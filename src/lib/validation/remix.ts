import { parseValidationInput } from "@/lib/validation/cultural-validation";
import type { ValidationResult } from "@/lib/validation/schemas";
import type { RemixChanges, RemixInput } from "@/types/api";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export function parseRemixInput(value: unknown): ValidationResult<RemixInput> {
  const invalid = { success: false as const, message: "Remix requires look, recommendationInput and nonempty changes containing only palette/accessories." };
  if (!object(value) || Object.keys(value).some((key) => !["look", "recommendationInput", "changes"].includes(key)) ||
      !object(value.changes) || Object.keys(value.changes).length === 0 ||
      Object.keys(value.changes).some((key) => !["palette", "accessories"].includes(key))) return invalid;
  const parsed = parseValidationInput({ look: value.look, recommendationInput: value.recommendationInput });
  if (!parsed.success) return parsed;
  const changes: RemixChanges = {};
  if ("palette" in value.changes) {
    const palette = value.changes.palette;
    if (!Array.isArray(palette) || palette.length < 1 || palette.length > 4 ||
        !palette.every((color) => typeof color === "string" && color.length <= 64 && /^[a-z0-9]+(?:_[a-z0-9]+)*$/.test(color)) ||
        new Set(palette).size !== palette.length) return invalid;
    changes.palette = [...palette];
  }
  if ("accessories" in value.changes) {
    const accessories = value.changes.accessories;
    if (!Array.isArray(accessories) || accessories.length > 6 ||
        !accessories.every((entry) => typeof entry === "string" && entry.trim().length > 0 && entry.length <= 200)) return invalid;
    const trimmed = accessories.map((entry: string) => entry.trim());
    if (new Set(trimmed).size !== trimmed.length) return invalid;
    changes.accessories = trimmed;
  }
  const changed = (changes.palette && JSON.stringify(changes.palette) !== JSON.stringify(parsed.data.look.palette)) ||
    (changes.accessories && JSON.stringify(changes.accessories) !== JSON.stringify(parsed.data.look.accessories));
  if (!changed) return { success: false, message: "Remix must change at least one palette or accessory value." };
  return { success: true, data: { ...parsed.data, changes } };
}
