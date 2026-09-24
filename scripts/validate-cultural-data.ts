import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type JsonObject = Record<string, unknown>;

const root = process.cwd();
const garmentsDirectory = join(root, "data", "garments");
const referencesPath = join(root, "data", "sources", "references.json");
const recordsPath = join(root, "data", "knowledge", "records.json");
const casesPath = join(root, "tests", "fixtures", "cultural-validation-cases.json");

function readJson(path: string): JsonObject {
  return JSON.parse(readFileSync(path, "utf8")) as JsonObject;
}

function requireStrings(value: unknown, label: string, allowEmpty = true): string[] {
  if (
    !Array.isArray(value) ||
    (!allowEmpty && value.length === 0) ||
    !value.every((item) => typeof item === "string" && item.trim() !== "")
  ) {
    throw new Error(`${label} must be ${allowEmpty ? "an" : "a non-empty"} array of strings.`);
  }
  return value;
}

function requireText(record: JsonObject, key: string, label: string): string {
  const value = record[key];
  if (typeof value !== "string" || value.trim() === "") {
    throw new Error(`${label}.${key} must be a non-empty string.`);
  }
  return value;
}

function requireEnum(record: JsonObject, key: string, allowed: string[], label: string): string {
  const value = requireText(record, key, label);
  if (!allowed.includes(value)) {
    throw new Error(`${label}.${key} must be one of: ${allowed.join(", ")}.`);
  }
  return value;
}

const referencesDocument = readJson(referencesPath);
if (!Array.isArray(referencesDocument.sources)) {
  throw new Error("references.json must contain a sources array.");
}

const sources = referencesDocument.sources as JsonObject[];
const sourceIds = new Set<string>();
for (const source of sources) {
  const id = requireText(source, "id", "source");
  if (sourceIds.has(id)) throw new Error(`Duplicate source ID: ${id}`);
  sourceIds.add(id);

  requireText(source, "publisher", id);
  requireText(source, "title", id);
  const url = requireText(source, "url", id);
  requireText(source, "accessed_at", id);
  requireStrings(source.garment_ids, `${id}.garment_ids`, false);
  requireStrings(source.categories, `${id}.categories`, false);
  requireStrings(source.usable_knowledge, `${id}.usable_knowledge`, false);
  requireText(source, "notes", id);
  if (!URL.canParse(url)) throw new Error(`${id}.url is invalid.`);
  requireEnum(source, "source_type", ["museum", "heritage_authority", "academic_journal"], id);
  requireEnum(source, "reliability", ["low", "medium", "high"], id);
  requireEnum(source, "status", ["needs_review", "approved"], id);
}

const garmentIds = new Set<string>();
const requiredGarmentKeys = [
  "id",
  "name",
  "summary",
  "recognizable_features",
  "preserve_rules",
  "flexible_elements",
  "compatible_occasions",
  "source_ids",
  "status",
] as const;

for (const file of readdirSync(garmentsDirectory).filter((name) => name.endsWith(".json"))) {
  const record = readJson(join(garmentsDirectory, file));
  const missing = requiredGarmentKeys.filter((key) => !(key in record));
  if (missing.length > 0) throw new Error(`${file} is missing: ${missing.join(", ")}`);

  const id = requireText(record, "id", file);
  if (garmentIds.has(id)) throw new Error(`Duplicate garment ID: ${id}`);
  garmentIds.add(id);

  for (const key of [
    "recognizable_features",
    "preserve_rules",
    "flexible_elements",
    "compatible_occasions",
    "source_ids",
  ] as const) {
    requireStrings(record[key], `${file}.${key}`);
  }
  for (const sourceId of record.source_ids as string[]) {
    if (!sourceIds.has(sourceId)) throw new Error(`${file} references unknown source: ${sourceId}`);
  }
  requireEnum(record, "status", ["draft", "needs_review", "approved"], file);
}

for (const source of sources) {
  for (const garmentId of source.garment_ids as string[]) {
    if (!garmentIds.has(garmentId)) {
      throw new Error(`${String(source.id)} references unknown garment: ${garmentId}`);
    }
  }
}

const recordsDocument = readJson(recordsPath);
if (!Array.isArray(recordsDocument.records)) {
  throw new Error("records.json must contain a records array.");
}

const ruleIds = new Set<string>();
const presentRuleTypes = new Set<string>();
for (const record of recordsDocument.records as JsonObject[]) {
  const id = requireText(record, "id", "knowledge record");
  if (ruleIds.has(id)) throw new Error(`Duplicate knowledge record ID: ${id}`);
  ruleIds.add(id);

  const garment = requireText(record, "garment", id);
  requireText(record, "component", id);
  requireText(record, "attribute", id);
  requireText(record, "fact", id);
  requireText(record, "condition", id);
  requireText(record, "action", id);
  requireText(record, "explanation", id);
  requireText(record, "publisher", id);
  requireText(record, "url", id);
  requireText(record, "notes", id);

  if (!garmentIds.has(garment)) throw new Error(`${id} references unknown garment: ${garment}`);
  requireEnum(record, "category", ["history", "structure", "accessory", "occasion", "warning"], id);
  const ruleType = requireEnum(record, "rule_type", ["preserve", "flexible", "context", "warning"], id);
  presentRuleTypes.add(ruleType);
  requireEnum(record, "constraint", ["allowed", "discouraged", "forbidden", "contextual"], id);
  requireEnum(record, "confidence", ["low", "medium", "high"], id);
  const verificationStatus = requireEnum(record, "verification_status", ["needs_review", "verified"], id);
  const enforcement = requireEnum(record, "enforcement", ["advisory", "hard"], id);

  if (typeof record.reviewed !== "boolean") throw new Error(`${id}.reviewed must be boolean.`);

  const recordSourceIds = requireStrings(record.source_ids, `${id}.source_ids`, false);
  const linkedSources = recordSourceIds.map((sourceId) => {
    const source = sources.find((candidate) => candidate.id === sourceId);
    if (!source) throw new Error(`${id} references unknown source: ${sourceId}`);
    return source;
  });

  const primarySource = linkedSources[0];
  if (record.publisher !== primarySource.publisher || record.url !== primarySource.url) {
    throw new Error(`${id} provenance does not match primary source ${String(primarySource.id)}.`);
  }

  if (
    enforcement === "hard" &&
    (!record.reviewed ||
      verificationStatus !== "verified" ||
      linkedSources.some((source) => source.status !== "approved"))
  ) {
    throw new Error(`${id} cannot be hard before the record and all sources are approved.`);
  }
  if (!record.reviewed && (verificationStatus !== "needs_review" || enforcement !== "advisory")) {
    throw new Error(`${id} must remain needs_review/advisory until reviewed.`);
  }
}

for (const requiredRuleType of ["preserve", "flexible", "context", "warning"]) {
  if (!presentRuleTypes.has(requiredRuleType)) {
    throw new Error(`Knowledge records are missing rule_type: ${requiredRuleType}`);
  }
}

const casesDocument = readJson(casesPath);
if (!Array.isArray(casesDocument.cases) || casesDocument.cases.length < 3) {
  throw new Error("At least three cultural validation cases are required.");
}

const caseIds = new Set<string>();
for (const testCase of casesDocument.cases as JsonObject[]) {
  const id = requireText(testCase, "id", "test case");
  if (caseIds.has(id)) throw new Error(`Duplicate cultural validation case ID: ${id}`);
  caseIds.add(id);

  const garment = requireText(testCase, "garment", id);
  if (!garmentIds.has(garment)) throw new Error(`${id} references unknown garment: ${garment}`);
  if (!testCase.expected || typeof testCase.expected !== "object") {
    throw new Error(`${id}.expected must be an object.`);
  }
  const expected = testCase.expected as JsonObject;
  for (const ruleId of requireStrings(expected.ruleIds, `${id}.expected.ruleIds`)) {
    if (!ruleIds.has(ruleId) && ruleId !== "SOURCE_ID_NOT_FOUND") {
      throw new Error(`${id} expects unknown rule: ${ruleId}`);
    }
  }
}

console.log(
  `Cultural data valid: ${garmentIds.size} garments, ${sourceIds.size} sources, ${ruleIds.size} knowledge records, ${presentRuleTypes.size} rule types, ${caseIds.size} test cases.`,
);
