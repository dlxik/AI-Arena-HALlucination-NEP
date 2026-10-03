import type { OutfitLook } from "@/types/outfit";

export type ImageUiState = "has_image" | "generating" | "fallback" | "pending";

export function resolveImageUiState(look: OutfitLook, isGenerating: boolean): ImageUiState {
  if (look.imageUrl) return "has_image";
  if (isGenerating) return "generating";
  if (look.imageFallback) return "fallback";
  return "pending";
}

export type RemixUiState = "idle" | "editing" | "revalidating" | "regenerating_image";

export function resolveRemixUiState(isEditing: boolean, isRevalidating: boolean, isRegeneratingImage: boolean): RemixUiState {
  if (isRevalidating) return "revalidating";
  if (isRegeneratingImage) return "regenerating_image";
  if (isEditing) return "editing";
  return "idle";
}
