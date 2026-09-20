import type { CulturalSource } from "@/types/cultural";

export function mapSourcesById(
  sources: CulturalSource[],
): Map<string, CulturalSource> {
  return new Map(sources.map((source) => [source.id, source]));
}
