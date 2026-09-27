import { loadCulturalKnowledgeBase } from "../../src/lib/cultural/loader";
import type { CulturalKnowledgeBase } from "../../src/types/cultural";

/**
 * Synthetic approved copy for pipeline tests only. This never mutates or
 * promotes the repository's real cultural data.
 */
export function createApprovedKnowledgeBase(): CulturalKnowledgeBase {
  const knowledgeBase = loadCulturalKnowledgeBase();

  return {
    garments: knowledgeBase.garments.map((garment) => ({
      ...garment,
      status: "approved",
    })),
    sources: knowledgeBase.sources.map((source) => ({
      ...source,
      status: "approved",
    })),
    records: knowledgeBase.records.map((record) => ({
      ...record,
      verification_status: "verified",
      reviewed: true,
    })),
  };
}
