import type { CulturalGarment } from "@/types/cultural";

export function retrieveApprovedGarments(
  records: CulturalGarment[],
  garmentId?: string,
): CulturalGarment[] {
  return records.filter(
    (record) =>
      record.status === "approved" && (!garmentId || record.id === garmentId),
  );
}
