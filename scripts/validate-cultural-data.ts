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

function requireStrings(value: unknown, label: string): string[] {
  if (!Array.isArray(value) || !value.every((item) => typeof item === "string")) {
    throw new Error(`${label} must be an array of strings.`);
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
  requireStrings(source.garment_ids, `${id}.garment_ids`);
  if (!URL.canParse(url)) throw new Error(`${id}.url is invalid.`);
  if (!["museum", "heritage_authority", "academic_journal"].includes(String(source.source_type))) {
    throw new Error(`${id}.source_type is invalid.`);
  }
  if (!["needs_review", "approved"].includes(String(source.status))) {
    throw new Error(`${id}.status is invalid.`);
  }
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
  if (!["draft", "needs_review", "approved"].includes(String(record.status))) {
    throw new Error(`${file} has an invalid status.`);
  }
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
for (const record of recordsDocument.records as JsonObject[]) {
  const id = requireText(record, "id", "knowledge record");
  if (ruleIds.has(id)) throw new Error(`Duplicate knowledge record ID: ${id}`);
  ruleIds.add(id);

  const garment = requireText(record, "garment", id);
  const sourceId = requireText(record, "source_id", id);
  requireText(record, "fact", id);
  requireText(record, "publisher", id);
  requireText(record, "url", id);
  requireText(record, "notes", id);

  if (!garmentIds.has(garment)) throw new Error(`${id} references unknown garment: ${garment}`);
  if (!sourceIds.has(sourceId)) throw new Error(`${id} references unknown source: ${sourceId}`);
  if (!["history", "structure", "accessory", "occasion", "warning"].includes(String(record.category))) {
    throw new Error(`${id}.category is invalid.`);
  }
  if (!["preserve", "flexible", "context", "note"].includes(String(record.rule_type))) {
    throw new Error(`${id}.rule_type is invalid.`);
  }
  if (!["low", "medium", "high"].includes(String(record.confidence))) {
    throw new Error(`${id}.confidence is invalid.`);
  }
  if (typeof record.reviewed !== "boolean") throw new Error(`${id}.reviewed must be boolean.`);
  if (!["advisory", "hard"].includes(String(record.enforcement))) {
    throw new Error(`${id}.enforcement is invalid.`);
  }

  const source = sources.find((candidate) => candidate.id === sourceId);
  if (record.publisher !== source?.publisher || record.url !== source?.url) {
    throw new Error(`${id} provenance does not match ${sourceId}.`);
  }
  if (record.enforcement === "hard" && (!record.reviewed || source?.status !== "approved")) {
    throw new Error(`${id} cannot be hard before both record and source are approved.`);
  }
}

const casesDocument = readJson(casesPath);
if (!Array.isArray(casesDocument.cases) || casesDocument.cases.length < 3) {
  throw new Error("At least three cultural validation cases are required.");
}
for (const testCase of casesDocument.cases as JsonObject[]) {
  const id = requireText(testCase, "id", "test case");
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
  `Cultural data valid: ${garmentIds.size} garments, ${sourceIds.size} sources, ${ruleIds.size} knowledge records, ${casesDocument.cases.length} test cases.`,
);
