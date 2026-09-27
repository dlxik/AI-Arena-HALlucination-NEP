import fixture from "../../../../tests/fixtures/recommendation-output.json";
import { fail, ok, readJsonBody } from "@/lib/utils";
import { parseRecommendationInput } from "@/lib/validation/schemas";
import type { RecommendationOutput } from "@/types/api";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (body === null) {
    return fail("INVALID_JSON", "A JSON object is required.");
  }

  const parsed = parseRecommendationInput(body);
  if (!parsed.success) {
    return fail("INVALID_INPUT", parsed.message, 422);
  }

  // TODO: Replace the fixture with cultural retrieval + Gemini stylist output.
  return ok(fixture as RecommendationOutput);
}
