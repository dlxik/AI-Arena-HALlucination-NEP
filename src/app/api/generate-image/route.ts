import { fail, ok, readJsonBody } from "@/lib/utils";
import { culturalApiError } from "@/lib/gemini/api-error";
import { IMAGE_DISCLAIMER, imageAfterValidation, imagePipelineDependencies, validateForImage, type ImagePipelineDependencies } from "@/lib/gemini/image-orchestration";
import { parseValidationInput } from "@/lib/validation/cultural-validation";
import type { ImageGenerationOutput } from "@/types/api";

export const runtime = "nodejs";

export async function handleImageGeneration(request: Request, dependencies: ImagePipelineDependencies = imagePipelineDependencies) {
  const body = await readJsonBody(request);
  if (body === null) return fail("INVALID_JSON", "A JSON object is required.");
  const parsed = parseValidationInput(body);
  if (!parsed.success) return fail("INVALID_INPUT", parsed.message, 422);
  try {
    const { look, fresh } = await validateForImage(parsed.data, dependencies);
    const image = await imageAfterValidation(look, fresh, dependencies);
    return ok<ImageGenerationOutput>({ ...image, ...fresh, disclaimer: IMAGE_DISCLAIMER }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return culturalApiError(error);
  }
}

export async function POST(request: Request) {
  return handleImageGeneration(request);
}
