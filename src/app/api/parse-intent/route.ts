import {
  GeminiConfigurationError,
  GeminiRequestError,
} from "@/lib/gemini/client";
import {
  GeminiOutputError,
  parseIntentWithGemini,
} from "@/lib/gemini/parse-intent";
import { fail, ok, readJsonBody } from "@/lib/utils";
import { parseIntentRequest } from "@/lib/validation/schemas";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (body === null) {
    return fail("INVALID_JSON", "A JSON object is required.");
  }

  const parsed = parseIntentRequest(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", parsed.message, 422);
  }

  try {
    return ok(await parseIntentWithGemini(parsed.data.description));
  } catch (error) {
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

    if (error instanceof GeminiOutputError) {
      return fail(
        "INVALID_MODEL_OUTPUT",
        "Gemini returned a response that did not match the intent schema.",
        502,
      );
    }

    return fail(
      "INTERNAL_ERROR",
      "The intent could not be parsed because of an internal error.",
      500,
    );
  }
}
