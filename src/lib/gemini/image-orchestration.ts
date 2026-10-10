import { randomUUID } from "node:crypto";
import { retrieveCulturalRules } from "@/lib/cultural/rule-retrieval";
import { CriticOutputError, critiqueWithGemini } from "@/lib/gemini/critic";
import { generateImage, generateImageWithGemini, ImageProviderError } from "@/lib/gemini/image-generator";
import { buildImagePrompt } from "@/lib/gemini/image-prompt";
import { parseCulturalValidation, parseValidationInput } from "@/lib/validation/cultural-validation";
import { parseImageDataUrl } from "@/lib/validation/image";
import type { FreshValidation, ImageGenerationResult, RecommendationInput, ValidationInput, ValidationLook, ValidationOutput } from "@/types/api";

export const IMAGE_DISCLAIMER = "Ảnh AI chỉ là minh họa, không phải hiện vật lịch sử hoặc bản phục dựng được xác thực.";
export type ImagePipelineDependencies = {
  critique: (look: ValidationLook, input: RecommendationInput) => Promise<ValidationOutput>;
  generate: (imagePrompt: string) => Promise<{ imageUrl: string }>;
};
export const imagePipelineDependencies: ImagePipelineDependencies = {
  critique: critiqueWithGemini, generate: generateImage,
};

export async function validateForImage(
  input: ValidationInput,
  dependencies: ImagePipelineDependencies,
): Promise<{ look: ValidationLook; fresh: FreshValidation }> {
  const look = { ...input.look, imagePrompt: buildImagePrompt(input.look) };
  const parsed = parseValidationInput({ look, recommendationInput: input.recommendationInput });
  if (!parsed.success) throw new CriticOutputError(parsed.message);
  // Retrieve independently so the orchestration also fails closed on provenance and output.
  const context = retrieveCulturalRules(parsed.data.look);
  const result = await dependencies.critique(parsed.data.look, parsed.data.recommendationInput);
  const validation = parseCulturalValidation(result, context);
  if (!validation.success) throw new CriticOutputError(validation.message);
  return { look: parsed.data.look, fresh: { validation: validation.data,
    validationId: randomUUID(), validatedAt: new Date().toISOString() } };
}

export async function imageAfterValidation(
  look: ValidationLook,
  fresh: FreshValidation,
  dependencies: ImagePipelineDependencies,
): Promise<ImageGenerationResult> {
  if (fresh.validation.status === "revise") {
    return { lookId: look.id, status: "fallback", fallbackReason: "cultural_revision_required" };
  }
  try {
    const result = await dependencies.generate(look.imagePrompt);
    const imageUrl = parseImageDataUrl(result?.imageUrl);
    if (!imageUrl) throw new ImageProviderError("invalid_image");
    return { lookId: look.id, status: "generated", imageUrl };
  } catch (error) {
    return { lookId: look.id, status: "fallback",
      fallbackReason: error instanceof ImageProviderError ? error.reason : "upstream_error" };
  }
}
