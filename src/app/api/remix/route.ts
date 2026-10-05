import { randomUUID } from "node:crypto";
import { culturalApiError } from "@/lib/gemini/api-error";
import { IMAGE_DISCLAIMER, imageAfterValidation, imagePipelineDependencies, validateForImage, type ImagePipelineDependencies } from "@/lib/gemini/image-orchestration";
import { parseRemixInput } from "@/lib/validation/remix";
import { fail, ok, readJsonBody } from "@/lib/utils";
import type { RemixOutput } from "@/types/api";

export const runtime = "nodejs";

export async function handleRemix(request: Request, dependencies: ImagePipelineDependencies = imagePipelineDependencies) {
  const body = await readJsonBody(request);
  if (body === null) return fail("INVALID_JSON", "A JSON object is required.");
  const parsed = parseRemixInput(body);
  if (!parsed.success) return fail("INVALID_INPUT", parsed.message, 422);
  const { look: original, recommendationInput, changes } = parsed.data;
  const input = { ...recommendationInput,
    ...(changes.palette ? { colors: [...changes.palette] } : {}) };
  const modified = { ...original, id: `remix-${randomUUID()}`,
    palette: [...(changes.palette ?? original.palette)],
    accessories: [...(changes.accessories ?? original.accessories)],
    items: [...original.items], sourceIds: [...original.sourceIds] };
  try {
    const { look, fresh } = await validateForImage({ look: modified, recommendationInput: input }, dependencies);
    const image = await imageAfterValidation(look, fresh, dependencies);
    return ok<RemixOutput>({ parentLookId: original.id,
      look: { ...look, validation: fresh.validation, ...(image.status === "generated" ? { imageUrl: image.imageUrl } : {}) },
      recommendationInput: input, ...fresh, image, disclaimer: IMAGE_DISCLAIMER,
    }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    return culturalApiError(error);
  }
}

export async function POST(request: Request) {
  return handleRemix(request);
}
