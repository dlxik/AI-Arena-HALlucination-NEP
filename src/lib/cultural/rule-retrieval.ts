import { loadCulturalKnowledgeBase } from "@/lib/cultural/loader";
import { CulturalContextNotFoundError } from "@/lib/cultural/retrieval";
import type { ValidationLook } from "@/types/api";
import type { CulturalKnowledgeBase, CulturalRuleContext } from "@/types/cultural";

export class CulturalRulesNotFoundError extends Error {
  constructor() {
    super("No reviewed rules are available for this garment.");
    this.name = "CulturalRulesNotFoundError";
  }
}

export class LookSourceError extends Error {
  constructor() {
    super("Look cites a source that is not approved for its garment.");
    this.name = "LookSourceError";
  }
}

export function retrieveCulturalRules(
  look: ValidationLook,
  knowledgeBase: CulturalKnowledgeBase = loadCulturalKnowledgeBase(),
): CulturalRuleContext {
  const garment = knowledgeBase.garments.find(({ id, status }) => id === look.garment && status === "approved");
  const sources = knowledgeBase.sources.filter((source) =>
    source.status === "approved" && source.garment_ids.includes(look.garment));
  const sourceIds = new Set(sources.map(({ id }) => id));
  if (!garment || !garment.source_ids.some((id) => sourceIds.has(id))) {
    throw new CulturalContextNotFoundError();
  }
  if (!look.sourceIds.every((id) => sourceIds.has(id))) throw new LookSourceError();

  // Keep conditional/context rules even when the occasion differs: they are needed
  // to detect claims that incorrectly turn a festival ensemble into a universal rule.
  const rules = knowledgeBase.records.filter((rule) =>
    rule.garment === look.garment && rule.reviewed && rule.verification_status === "verified" &&
    rule.source_ids.length > 0 && rule.source_ids.every((id) => sourceIds.has(id)))
    .sort((left, right) => left.id.localeCompare(right.id, "en"));
  if (rules.length === 0) throw new CulturalRulesNotFoundError();
  return { garment, rules, sources };
}
