import type { RecommendationInput } from "@/types/api";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

export function parseRecommendationInput(
  value: unknown,
): ValidationResult<RecommendationInput> {
  if (!value || typeof value !== "object") {
    return { success: false, message: "Request body must be a JSON object." };
  }

  const input = value as Record<string, unknown>;
  if (
    typeof input.occasion !== "string" ||
    typeof input.garment !== "string" ||
    typeof input.style !== "string" ||
    !Array.isArray(input.colors) ||
    !input.colors.every((color) => typeof color === "string") ||
    typeof input.remixLevel !== "number" ||
    input.remixLevel < 0 ||
    input.remixLevel > 100 ||
    (input.description !== undefined && typeof input.description !== "string")
  ) {
    return {
      success: false,
      message: "Invalid recommendation input. remixLevel must be between 0 and 100.",
    };
  }

  return { success: true, data: input as RecommendationInput };
}
