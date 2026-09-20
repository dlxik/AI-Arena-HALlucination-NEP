import type { RecommendationInput, RecommendationOutput } from "@/types/api";

export async function recommendWithGemini(
  _input: RecommendationInput,
): Promise<RecommendationOutput> {
  void _input;
  // TODO: Ground the stylist prompt with reviewed cultural records.
  throw new Error("Gemini stylist integration is not implemented yet.");
}
