import { loadCulturalKnowledgeBase } from "@/lib/cultural/loader";
import type { RecommendationInput } from "@/types/api";
import type {
  CulturalContext,
  CulturalGarment,
  CulturalKnowledgeBase,
  CulturalKnowledgeRecord,
  CulturalSource,
} from "@/types/cultural";

export const MAX_CULTURAL_RECORDS = 6;
export const MAX_CULTURAL_SOURCES = 8;

const ELIGIBLE_GARMENT_STATUSES = ["needs_review", "approved"] as const;
const ELIGIBLE_SOURCE_STATUSES = ["needs_review", "approved"] as const;

export class CulturalContextNotFoundError extends Error {
  constructor(message = "No eligible cultural context was found.") {
    super(message);
    this.name = "CulturalContextNotFoundError";
  }
}

function isEligibleGarment(garment: CulturalGarment): boolean {
  return ELIGIBLE_GARMENT_STATUSES.some((status) => status === garment.status);
}

function isEligibleSource(source: CulturalSource): boolean {
  return ELIGIBLE_SOURCE_STATUSES.some((status) => status === source.status);
}

function isEligibleRecord(
  record: CulturalKnowledgeRecord,
  sourcesById: ReadonlyMap<string, CulturalSource>,
): boolean {
  const sources = record.source_ids.map((sourceId) => sourcesById.get(sourceId));
  if (
    sources.some((source) => !source || !isEligibleSource(source)) ||
    sources.length === 0
  ) {
    return false;
  }

  if (!record.reviewed) {
    return (
      record.verification_status === "needs_review" &&
      record.enforcement === "advisory"
    );
  }

  if (record.enforcement === "hard") {
    return (
      record.verification_status === "verified" &&
      sources.every((source) => source?.status === "approved")
    );
  }

  return true;
}

function garmentScore(
  garment: CulturalGarment,
  input: RecommendationInput,
  records: CulturalKnowledgeRecord[],
): number {
  const occasionScore = garment.compatible_occasions.includes(input.occasion)
    ? 100
    : 0;
  const recordScore = records.filter(
    (record) => record.garment === garment.id,
  ).length;
  const contentScore =
    (garment.summary.trim() ? 2 : 0) + garment.recognizable_features.length;
  const approvedScore = garment.status === "approved" ? 1 : 0;

  return occasionScore + recordScore * 5 + contentScore + approvedScore;
}

function recordScore(
  record: CulturalKnowledgeRecord,
  input: RecommendationInput,
): number {
  let score =
    record.confidence === "high"
      ? 30
      : record.confidence === "medium"
        ? 20
        : 10;

  if (record.reviewed && record.verification_status === "verified") score += 100;
  if (record.rule_type === "preserve") score += 8;
  if (record.rule_type === "warning") score += 7;
  if (record.rule_type === "context") score += 4;
  if (record.category === "occasion") score += 6;
  if (
    record.rule_type === "flexible" &&
    (input.remixLevel > 40 || input.style !== "traditional")
  ) {
    score += 10;
  }

  return score;
}

function isRecordRelevantToInput(
  record: CulturalKnowledgeRecord,
  input: RecommendationInput,
  garmentsById: ReadonlyMap<string, CulturalGarment>,
): boolean {
  if (record.category !== "occasion") return true;

  const garment = garmentsById.get(record.garment);
  return (
    !garment ||
    garment.compatible_occasions.length === 0 ||
    garment.compatible_occasions.includes(input.occasion)
  );
}

function selectRecords(
  records: CulturalKnowledgeRecord[],
  garmentIds: readonly string[],
  input: RecommendationInput,
): CulturalKnowledgeRecord[] {
  const recordsByGarment = new Map(
    garmentIds.map((garmentId) => [
      garmentId,
      records
        .filter((record) => record.garment === garmentId)
        .sort((left, right) => {
          const scoreDifference =
            recordScore(right, input) - recordScore(left, input);
          return scoreDifference || left.id.localeCompare(right.id, "en");
        }),
    ]),
  );
  const selected: CulturalKnowledgeRecord[] = [];

  while (selected.length < MAX_CULTURAL_RECORDS) {
    let added = false;
    for (const garmentId of garmentIds) {
      const next = recordsByGarment.get(garmentId)?.shift();
      if (!next) continue;
      selected.push(next);
      added = true;
      if (selected.length === MAX_CULTURAL_RECORDS) break;
    }
    if (!added) break;
  }

  return selected;
}

function selectionReason(
  garment: CulturalGarment,
  input: RecommendationInput,
): string {
  if (input.garment !== "auto") {
    return "Explicitly selected by the user.";
  }
  if (garment.compatible_occasions.includes(input.occasion)) {
    return `Candidate profile explicitly lists occasion ${input.occasion}.`;
  }
  return "Eligible MVP candidate supplied for auto selection; the model must justify its choice from the available context.";
}

export function retrieveCulturalContext(
  input: RecommendationInput,
  knowledgeBase: CulturalKnowledgeBase = loadCulturalKnowledgeBase(),
): CulturalContext {
  const sourcesById = new Map(
    knowledgeBase.sources.map((source) => [source.id, source]),
  );
  const garmentsById = new Map(
    knowledgeBase.garments.map((garment) => [garment.id, garment]),
  );
  const eligibleRecords = knowledgeBase.records.filter(
    (record) =>
      isEligibleRecord(record, sourcesById) &&
      isRecordRelevantToInput(record, input, garmentsById),
  );

  const garmentCandidates = knowledgeBase.garments
    .filter(
      (garment) =>
        isEligibleGarment(garment) &&
        (input.garment === "auto" || garment.id === input.garment),
    )
    .sort((left, right) => {
      const scoreDifference =
        garmentScore(right, input, eligibleRecords) -
        garmentScore(left, input, eligibleRecords);
      return scoreDifference || left.id.localeCompare(right.id, "en");
    })
    .map((garment) => ({
      garment,
      selectionReason: selectionReason(garment, input),
    }));

  if (garmentCandidates.length === 0) {
    throw new CulturalContextNotFoundError();
  }

  const candidateIds = new Set(
    garmentCandidates.map(({ garment }) => garment.id),
  );
  const orderedCandidateIds = garmentCandidates.map(({ garment }) => garment.id);
  const records = selectRecords(
    eligibleRecords.filter((record) => candidateIds.has(record.garment)),
    orderedCandidateIds,
    input,
  );

  const relevantSourceIds = new Set<string>();
  for (const { garment } of garmentCandidates) {
    for (const sourceId of garment.source_ids) relevantSourceIds.add(sourceId);
  }
  for (const record of records) {
    for (const sourceId of record.source_ids) relevantSourceIds.add(sourceId);
  }

  const sourcePool = knowledgeBase.sources
    .filter(
      (source) =>
        relevantSourceIds.has(source.id) &&
        isEligibleSource(source) &&
        source.garment_ids.some((garmentId) => candidateIds.has(garmentId)),
    )
    .sort((left, right) => {
      const reviewDifference =
        Number(right.status === "approved") - Number(left.status === "approved");
      const reliabilityRank = { low: 0, medium: 1, high: 2 } as const;
      const reliabilityDifference =
        reliabilityRank[right.reliability] - reliabilityRank[left.reliability];
      return (
        reviewDifference ||
        reliabilityDifference ||
        left.id.localeCompare(right.id, "en")
      );
    });

  const selectedSources: CulturalSource[] = [];
  const selectedSourceIds = new Set<string>();
  for (const garmentId of orderedCandidateIds) {
    const source = sourcePool.find(
      (candidate) =>
        !selectedSourceIds.has(candidate.id) &&
        candidate.garment_ids.includes(garmentId),
    );
    if (!source) continue;
    selectedSources.push(source);
    selectedSourceIds.add(source.id);
  }
  for (const source of sourcePool) {
    if (
      selectedSources.length === MAX_CULTURAL_SOURCES ||
      selectedSourceIds.has(source.id)
    ) {
      continue;
    }
    selectedSources.push(source);
    selectedSourceIds.add(source.id);
  }
  const sources = selectedSources.slice(0, MAX_CULTURAL_SOURCES);

  if (sources.length === 0) {
    throw new CulturalContextNotFoundError(
      "Eligible garments were found, but none had an eligible source.",
    );
  }

  return {
    garmentCandidates,
    records,
    sources,
    policy: {
      eligibleGarmentStatuses: [...ELIGIBLE_GARMENT_STATUSES],
      eligibleSourceStatuses: [...ELIGIBLE_SOURCE_STATUSES],
      maxRecords: MAX_CULTURAL_RECORDS,
      maxSources: MAX_CULTURAL_SOURCES,
      unreviewedRecordsAreAdvisoryOnly: true,
    },
  };
}
