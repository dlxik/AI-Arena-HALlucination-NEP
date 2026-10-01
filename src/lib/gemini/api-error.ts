import { CulturalDataError } from "@/lib/cultural/loader";
import { CulturalContextNotFoundError } from "@/lib/cultural/retrieval";
import { CulturalRulesNotFoundError, LookSourceError } from "@/lib/cultural/rule-retrieval";
import { GeminiConfigurationError, GeminiRequestError } from "@/lib/gemini/client";
import { CriticOutputError } from "@/lib/gemini/critic";
import { StylistOutputError } from "@/lib/gemini/stylist";
import { fail } from "@/lib/utils";

export function culturalApiError(error: unknown): Response {
  if (error instanceof CulturalContextNotFoundError) {
    return fail("NO_CULTURAL_CONTEXT", "No approved cultural context is available for this request.", 422);
  }
  if (error instanceof CulturalRulesNotFoundError) {
    return fail("NO_CULTURAL_RULES", "No reviewed cultural rules are available for this garment.", 422);
  }
  if (error instanceof LookSourceError) {
    return fail("INVALID_LOOK_SOURCE", "Look sources must be approved and relevant to its garment.", 422);
  }
  if (error instanceof GeminiConfigurationError) {
    return fail("GEMINI_NOT_CONFIGURED", "Gemini is not configured. Add GEMINI_API_KEY to .env.local.", 503);
  }
  if (error instanceof GeminiRequestError) {
    return error.kind === "timeout"
      ? fail("GEMINI_TIMEOUT", "Gemini took too long to respond. Please try again.", 504)
      : fail("GEMINI_UPSTREAM_ERROR", "Gemini is temporarily unavailable. Please try again.", 502);
  }
  if (error instanceof CriticOutputError || error instanceof StylistOutputError) {
    return fail("INVALID_MODEL_OUTPUT", "Gemini returned a response that did not match the required schema or provenance.", 502);
  }
  if (error instanceof CulturalDataError) {
    return fail("CULTURAL_DATA_ERROR", "Cultural data could not be loaded safely.", 500);
  }
  return fail("INTERNAL_ERROR", "The request could not be completed because of an internal error.", 500);
}
