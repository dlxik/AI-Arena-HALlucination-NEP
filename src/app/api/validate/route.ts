import { fail, ok, readJsonBody } from "@/lib/utils";
import { culturalApiError } from "@/lib/gemini/api-error";
import { critiqueWithGemini } from "@/lib/gemini/critic";
import { parseValidationInput } from "@/lib/validation/cultural-validation";
import type { RecommendationInput, ValidationLook, ValidationOutput } from "@/types/api";

export const runtime = "nodejs";

export type ValidationHandlerDependencies = {
  critique: (look: ValidationLook, input: RecommendationInput) => Promise<ValidationOutput>;
};

export async function handleValidation(
  request: Request,
  dependencies: ValidationHandlerDependencies = { critique: critiqueWithGemini },
) {
  const body = await readJsonBody(request);
  if (body === null) return fail("INVALID_JSON", "A JSON object is required.");
  const parsed = parseValidationInput(body);
  if (!parsed.success) return fail("INVALID_INPUT", parsed.message, 422);

  try {
    return ok(await dependencies.critique(parsed.data.look, parsed.data.recommendationInput));
  } catch (error) {
    return culturalApiError(error);
  }
}

export async function POST(request: Request) {
  return handleValidation(request);
}
