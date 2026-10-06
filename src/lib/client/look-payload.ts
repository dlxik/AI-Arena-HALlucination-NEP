import type { ValidationLook } from "@/types/api";
import type { OutfitLook } from "@/types/outfit";

export function toValidationLook(look: OutfitLook): ValidationLook {
  return {
    id: look.id,
    name: look.name,
    garment: look.garment,
    style: look.style,
    palette: look.palette,
    items: look.items,
    accessories: look.accessories,
    reason: look.reason,
    culturalNote: look.culturalNote,
    sourceIds: look.sourceIds,
    imagePrompt: look.imagePrompt,
  };
}
