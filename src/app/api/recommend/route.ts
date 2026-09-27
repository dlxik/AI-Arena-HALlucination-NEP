import { CulturalDataError } from "@/lib/cultural/loader";
import {
  CulturalContextNotFoundError,
  retrieveCulturalContext,
} from "@/lib/cultural/retrieval";
import {
  GeminiConfigurationError,
  GeminiRequestError,
} from "@/lib/gemini/client";
import {
  recommendWithGemini,
  StylistOutputError,
} from "@/lib/gemini/stylist";
import { fail, ok, readJsonBody } from "@/lib/utils";
import { parseRecommendationInput } from "@/lib/validation/schemas";
import type { RecommendationInput, RecommendationOutput } from "@/types/api";
import type { CulturalContext } from "@/types/cultural";

export const runtime = "nodejs";

export type RecommendationHandlerDependencies = {
  retrieve: (input: RecommendationInput) => CulturalContext;
  recommend: (
    input: RecommendationInput,
    context: CulturalContext,
  ) => Promise<RecommendationOutput>;
};

const defaultDependencies: RecommendationHandlerDependencies = {
  retrieve: retrieveCulturalContext,
  recommend: recommendWithGemini,
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
    return ok(await dependencies.recommend(parsed.data, context));
  } catch (error) {
    if (error instanceof CulturalContextNotFoundError) {
      return fail(
        "NO_CULTURAL_CONTEXT",
        "No approved cultural context is available for this request.",
        422,
      );
    }

    if (error instanceof GeminiConfigurationError) {
      return fail(
        "GEMINI_NOT_CONFIGURED",
        "Gemini is not configured. Add GEMINI_API_KEY to .env.local.",
        503,
      );
    }

    if (error instanceof GeminiRequestError) {
      if (error.kind === "timeout") {
        return fail(
          "GEMINI_TIMEOUT",
          "Gemini took too long to respond. Please try again.",
          504,
        );
      }

      return fail(
        "GEMINI_UPSTREAM_ERROR",
        "Gemini is temporarily unavailable. Please try again.",
        502,
      );
    }

    if (error instanceof StylistOutputError) {
      return fail(
        "INVALID_MODEL_OUTPUT",
        "Gemini returned a response that did not match the recommendation schema.",
        502,
      );
    }

    if (error instanceof CulturalDataError) {
      return fail(
        "CULTURAL_DATA_ERROR",
        "Cultural data could not be loaded safely.",
        500,
      );
    }

    return fail(
      "INTERNAL_ERROR",
      "The recommendation could not be generated because of an internal error.",
      500,
    );
  }
}

export async function POST(request: Request) {
  return handleRecommendation(request);
}
