import type { CulturalGarment } from "@/types/cultural";

export function isCulturalGarment(value: unknown): value is CulturalGarment {
  if (!value || typeof value !== "object") return false;
  const record = value as Record<string, unknown>;

  return (
    typeof record.id === "string" &&
    typeof record.name === "string" &&
    typeof record.summary === "string" &&
    Array.isArray(record.recognizable_features) &&
    Array.isArray(record.preserve_rules) &&
    Array.isArray(record.flexible_elements) &&
    Array.isArray(record.compatible_occasions) &&
    Array.isArray(record.source_ids) &&
    ["draft", "needs_review", "approved"].includes(String(record.status))
  );
}
