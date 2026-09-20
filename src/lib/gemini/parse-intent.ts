import type { RecommendationInput } from "@/types/api";

export async function parseIntentWithGemini(
  _description: string,
): Promise<RecommendationInput> {
  void _description;
  // TODO: Load prompts/intent/intent-v1.md and call the configured Gemini client.
  throw new Error("Gemini intent parsing is not implemented yet.");
}
