import type { OutfitLook } from "@/types/outfit";
import type { ValidationOutput } from "@/types/api";

export async function critiqueWithGemini(
  _look: OutfitLook,
): Promise<ValidationOutput> {
  void _look;
  // TODO: Evaluate the look only against reviewed sources and preserve rules.
  throw new Error("Gemini cultural critic integration is not implemented yet.");
}
