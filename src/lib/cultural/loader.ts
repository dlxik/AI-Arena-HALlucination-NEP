import aoDai from "../../../data/garments/ao-dai.json";
import aoNguThan from "../../../data/garments/ao-ngu-than.json";
import aoTuThan from "../../../data/garments/ao-tu-than.json";
import nhatBinh from "../../../data/garments/nhat-binh.json";
import knowledgeDocument from "../../../data/knowledge/records.json";
import sourcesDocument from "../../../data/sources/references.json";
import type {
  CulturalGarment,
  CulturalKnowledgeBase,
  CulturalKnowledgeRecord,
  CulturalSource,
} from "@/types/cultural";

const GARMENT_STATUSES = ["draft", "needs_review", "approved"] as const;
const SOURCE_STATUSES = ["needs_review", "approved"] as const;
const SOURCE_TYPES = [
  "museum",
  "heritage_authority",
  "academic_journal",
] as const;
const CONFIDENCE_LEVELS = ["low", "medium", "high"] as const;
const RECORD_CATEGORIES = [
  "history",
  "structure",
  "accessory",
  "occasion",
  "warning",
] as const;
const RULE_TYPES = ["preserve", "flexible", "context", "warning"] as const;
const CONSTRAINTS = [
  "allowed",
  "discouraged",
  "forbidden",
  "contextual",
] as const;
const VERIFICATION_STATUSES = ["needs_review", "verified"] as const;
const ENFORCEMENT_LEVELS = ["advisory", "hard"] as const;

export class CulturalDataError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "CulturalDataError";
  }
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isStringArray(value: unknown): value is string[] {
  return (
    Array.isArray(value) &&
    value.every((item) => typeof item === "string" && item.trim().length > 0)
  );
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  choices: T,
): value is T[number] {
  return typeof value === "string" && choices.includes(value as T[number]);
}

function hasTextFields(
  record: Record<string, unknown>,
  fields: readonly string[],
): boolean {
  return fields.every(
    (field) =>
      typeof record[field] === "string" &&
      (record[field] as string).trim().length > 0,
  );
}

export function isCulturalGarment(value: unknown): value is CulturalGarment {
  if (!isRecord(value)) return false;

  return (
    hasTextFields(value, ["id", "name"]) &&
    typeof value.summary === "string" &&
    isStringArray(value.recognizable_features) &&
    isStringArray(value.preserve_rules) &&
    isStringArray(value.flexible_elements) &&
    isStringArray(value.compatible_occasions) &&
    isStringArray(value.source_ids) &&
    isOneOf(value.status, GARMENT_STATUSES)
  );
}

export function isCulturalSource(value: unknown): value is CulturalSource {
  if (!isRecord(value)) return false;

  return (
    hasTextFields(value, [
      "id",
      "publisher",
      "title",
      "url",
      "accessed_at",
      "notes",
    ]) &&
    isOneOf(value.source_type, SOURCE_TYPES) &&
    isStringArray(value.garment_ids) &&
    value.garment_ids.length > 0 &&
    isStringArray(value.categories) &&
    value.categories.length > 0 &&
    isStringArray(value.usable_knowledge) &&
    value.usable_knowledge.length > 0 &&
    isOneOf(value.reliability, CONFIDENCE_LEVELS) &&
    isOneOf(value.status, SOURCE_STATUSES)
  );
}

export function isCulturalKnowledgeRecord(
  value: unknown,
): value is CulturalKnowledgeRecord {
  if (!isRecord(value)) return false;

  return (
    hasTextFields(value, [
      "id",
      "garment",
      "component",
      "attribute",
      "fact",
      "condition",
      "action",
      "explanation",
      "publisher",
      "url",
      "notes",
    ]) &&
    isOneOf(value.category, RECORD_CATEGORIES) &&
    isOneOf(value.rule_type, RULE_TYPES) &&
    isOneOf(value.constraint, CONSTRAINTS) &&
    isStringArray(value.source_ids) &&
    value.source_ids.length > 0 &&
    isOneOf(value.confidence, CONFIDENCE_LEVELS) &&
    isOneOf(value.verification_status, VERIFICATION_STATUSES) &&
    typeof value.reviewed === "boolean" &&
    isOneOf(value.enforcement, ENFORCEMENT_LEVELS)
  );
}

function parseArray<T>(
  value: unknown,
  label: string,
  predicate: (candidate: unknown) => candidate is T,
): T[] {
  if (!Array.isArray(value)) {
    throw new CulturalDataError(`${label} must be an array.`);
  }

  return value.map((candidate, index) => {
    if (!predicate(candidate)) {
      throw new CulturalDataError(`${label}[${index}] is invalid.`);
    }
    return candidate;
  });
}

function assertUniqueIds(
  values: ReadonlyArray<{ id: string }>,
  label: string,
): void {
  const ids = new Set<string>();
  for (const value of values) {
    if (ids.has(value.id)) {
      throw new CulturalDataError(`Duplicate ${label} ID: ${value.id}.`);
    }
    ids.add(value.id);
  }
}

let cachedKnowledgeBase: CulturalKnowledgeBase | undefined;

export function loadCulturalKnowledgeBase(): CulturalKnowledgeBase {
  if (cachedKnowledgeBase) return cachedKnowledgeBase;

  const garments = parseArray(
    [aoDai, aoNguThan, aoTuThan, nhatBinh],
    "garments",
    isCulturalGarment,
  );
  const sources = parseArray(
    sourcesDocument.sources,
    "sources",
    isCulturalSource,
  );
  const records = parseArray(
    knowledgeDocument.records,
    "records",
    isCulturalKnowledgeRecord,
  );

  assertUniqueIds(garments, "garment");
  assertUniqueIds(sources, "source");
  assertUniqueIds(records, "record");

  const garmentIds = new Set(garments.map(({ id }) => id));
  const sourceIds = new Set(sources.map(({ id }) => id));

  for (const garment of garments) {
    if (garment.source_ids.some((sourceId) => !sourceIds.has(sourceId))) {
      throw new CulturalDataError(
        `Garment ${garment.id} references an unknown source.`,
      );
    }
  }

  for (const source of sources) {
    if (!URL.canParse(source.url)) {
      throw new CulturalDataError(`Source ${source.id} has an invalid URL.`);
    }
    if (source.garment_ids.some((garmentId) => !garmentIds.has(garmentId))) {
      throw new CulturalDataError(
        `Source ${source.id} references an unknown garment.`,
      );
    }
  }

  for (const record of records) {
    if (!garmentIds.has(record.garment)) {
      throw new CulturalDataError(
        `Record ${record.id} references an unknown garment.`,
      );
    }
    if (record.source_ids.some((sourceId) => !sourceIds.has(sourceId))) {
      throw new CulturalDataError(
        `Record ${record.id} references an unknown source.`,
      );
    }

    const linkedSources = record.source_ids.map((sourceId) =>
      sources.find((source) => source.id === sourceId),
    );
    const primarySource = linkedSources[0];
    if (
      !primarySource ||
      record.publisher !== primarySource.publisher ||
      record.url !== primarySource.url
    ) {
      throw new CulturalDataError(
        `Record ${record.id} does not match its primary source provenance.`,
      );
    }

    if (
      !record.reviewed &&
      (record.verification_status !== "needs_review" ||
        record.enforcement !== "advisory")
    ) {
      throw new CulturalDataError(
        `Unreviewed record ${record.id} must remain advisory and needs_review.`,
      );
    }

    if (
      record.enforcement === "hard" &&
      (!record.reviewed ||
        record.verification_status !== "verified" ||
        linkedSources.some((source) => source?.status !== "approved"))
    ) {
      throw new CulturalDataError(
        `Hard record ${record.id} is not fully reviewed and approved.`,
      );
    }
  }

  cachedKnowledgeBase = { garments, sources, records };
  return cachedKnowledgeBase;
}
