import { retrieveCulturalContext } from "@/lib/cultural/retrieval";
import { culturalApiError } from "@/lib/gemini/api-error";
import { critiqueWithGemini } from "@/lib/gemini/critic";
import { recommendWithGemini } from "@/lib/gemini/stylist";
import { fail, ok, readJsonBody } from "@/lib/utils";
import { parseRecommendationInput } from "@/lib/validation/schemas";
import type { RecommendationInput, RecommendationOutput, ValidationLook, ValidationOutput } from "@/types/api";
import type { CulturalContext } from "@/types/cultural";

export const runtime = "nodejs";

export type RecommendationHandlerDependencies = {
  retrieve: (input: RecommendationInput) => CulturalContext;
  recommend: (
    input: RecommendationInput,
    context: CulturalContext,
  ) => Promise<RecommendationOutput>;
  critique: (look: ValidationLook, input: RecommendationInput) => Promise<ValidationOutput>;
};

const defaultDependencies: RecommendationHandlerDependencies = {
  retrieve: retrieveCulturalContext,
  recommend: recommendWithGemini,
  critique: critiqueWithGemini,
};

export async function handleRecommendation(
  request: Request,
  dependencies: RecommendationHandlerDependencies = defaultDependencies,
) {
  const body = await readJsonBody(request);
  if (body === null) {
    return fail("INVALID_JSON", "A JSON object is required.");
  }

  const parsed = parseRecommendationInput(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", parsed.message, 422);
  }

  try {
    const context = dependencies.retrieve(parsed.data);
    const recommendation = await dependencies.recommend(parsed.data, context);
    const looks = await Promise.all(recommendation.looks.map(async (look) => ({
      ...look,
      validation: await dependencies.critique(look, parsed.data),
    })));
    return ok({ looks });
  } catch (error) {
    return culturalApiError(error);
  }
}

export async function POST(request: Request) {
  return handleRecommendation(request);
}
