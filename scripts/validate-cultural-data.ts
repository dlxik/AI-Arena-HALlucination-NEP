import { existsSync, readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

type JsonObject = Record<string, unknown>;

const root = process.cwd();
const garmentsDirectory = join(root, "data", "garments");
const referencesPath = join(root, "data", "sources", "references.json");
const recordsPath = join(root, "data", "knowledge", "records.json");
const casesPath = join(root, "tests", "fixtures", "cultural-validation-cases.json");
const recommendationCasesPath = join(
  root,
  "tests",
  "prompt-evaluation",
  "recommendation-cultural-cases.json",
);

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
  const status = requireEnum(source, "status", ["needs_review", "approved"], id);
  if (status === "approved") {
    requireText(source, "reviewed_by", id);
    requireText(source, "reviewed_at", id);
  }
}

const garmentIds = new Set<string>();
const garmentProfiles: JsonObject[] = [];
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
  garmentProfiles.push(record);

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

const knowledgeRecords = recordsDocument.records as JsonObject[];
const ruleIds = new Set<string>();
const presentRuleTypes = new Set<string>();
for (const record of knowledgeRecords) {
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
  if (verificationStatus === "verified") {
    if (!record.reviewed) throw new Error(`${id} cannot be verified before review.`);
    requireText(record, "reviewed_by", id);
    requireText(record, "reviewed_at", id);
  }

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

for (const garment of garmentProfiles) {
  const garmentId = String(garment.id);
  const linkedSourceIds = garment.source_ids as string[];
  if (
    garment.status === "approved" &&
    linkedSourceIds.some(
      (sourceId) => sources.find((source) => source.id === sourceId)?.status !== "approved",
    )
  ) {
    throw new Error(`${garmentId} cannot be approved while a linked source still needs review.`);
  }

  for (const key of ["preserve_rules", "flexible_elements"] as const) {
    for (const ruleId of garment[key] as string[]) {
      const linkedRecord = knowledgeRecords.find((record) => record.id === ruleId);
      if (!linkedRecord) throw new Error(`${garmentId}.${key} references unknown record: ${ruleId}`);
      if (linkedRecord.garment !== garmentId) {
        throw new Error(`${garmentId}.${key} references a record for another garment: ${ruleId}`);
      }
      if (linkedRecord.verification_status !== "verified") {
        throw new Error(`${garmentId}.${key} references an unverified record: ${ruleId}`);
      }
    }
  }
}

for (const requiredRuleType of ["preserve", "flexible", "context", "warning"]) {
  if (!presentRuleTypes.has(requiredRuleType)) {
    throw new Error(`Knowledge records are missing rule_type: ${requiredRuleType}`);
  }
}

const casesDocument = readJson(casesPath);
if (!Array.isArray(casesDocument.cases) || casesDocument.cases.length < 8) {
  throw new Error("At least eight Cultural Critic acceptance cases are required.");
}

if (!casesDocument.metadata || typeof casesDocument.metadata !== "object") {
  throw new Error("Cultural validation cases must include metadata.");
}
const criticMetadata = casesDocument.metadata as JsonObject;
requireText(criticMetadata, "owner", "cultural validation metadata");
requireText(criticMetadata, "policy_note", "cultural validation metadata");
requireEnum(
  criticMetadata,
  "runtime_status",
  ["pending_critic_implementation", "ready_for_live_review", "reviewed"],
  "cultural validation metadata",
);

if (!Array.isArray(casesDocument.rule_matrix)) {
  throw new Error("Cultural validation cases must include a rule_matrix array.");
}
const matrixRuleIds = new Set<string>();
for (const row of casesDocument.rule_matrix as JsonObject[]) {
  const ruleId = requireText(row, "ruleId", "rule matrix row");
  if (matrixRuleIds.has(ruleId)) throw new Error(`Duplicate rule matrix ID: ${ruleId}`);
  matrixRuleIds.add(ruleId);

  const linkedRecord = knowledgeRecords.find((record) => record.id === ruleId);
  if (!linkedRecord) throw new Error(`Rule matrix references unknown rule: ${ruleId}`);
  const garment = requireText(row, "garment", ruleId);
  if (garment !== linkedRecord.garment) {
    throw new Error(`${ruleId} matrix garment does not match its knowledge record.`);
  }
  const expectedStatus = requireEnum(row, "expected_status", ["pass", "warning", "revise"], ruleId);
  const severity = row.expected_severity;
  if (
    !(
      (expectedStatus === "pass" && severity === null) ||
      (expectedStatus !== "pass" && ["low", "medium", "high"].includes(String(severity)))
    )
  ) {
    throw new Error(`${ruleId}.expected_severity is inconsistent with expected_status.`);
  }
  if (linkedRecord.enforcement === "advisory" && expectedStatus === "revise") {
    throw new Error(`${ruleId} is advisory and cannot map directly to revise.`);
  }
  requireText(row, "trigger", ruleId);
  requireText(row, "suggested_action", ruleId);
  for (const sourceId of requireStrings(row.sourceIds, `${ruleId}.sourceIds`, false)) {
    if (!(linkedRecord.source_ids as string[]).includes(sourceId)) {
      throw new Error(`${ruleId} matrix uses a source not linked to the knowledge record: ${sourceId}`);
    }
    const linkedSource = sources.find((source) => source.id === sourceId);
    if (linkedSource?.status !== "approved") {
      throw new Error(`${ruleId} matrix uses an unapproved source: ${sourceId}`);
    }
  }
}

for (const recordId of ruleIds) {
  if (!matrixRuleIds.has(recordId)) {
    throw new Error(`Critic rule matrix is missing knowledge record: ${recordId}`);
  }
}

const caseIds = new Set<string>();
const criticCoverage = new Map<string, Set<string>>();
for (const testCase of casesDocument.cases as JsonObject[]) {
  const id = requireText(testCase, "id", "test case");
  if (caseIds.has(id)) throw new Error(`Duplicate cultural validation case ID: ${id}`);
  caseIds.add(id);

  const garment = requireText(testCase, "garment", id);
  if (!garmentIds.has(garment)) throw new Error(`${id} references unknown garment: ${garment}`);
  requireText(testCase, "description", id);
  if (!testCase.input || typeof testCase.input !== "object" || Array.isArray(testCase.input)) {
    throw new Error(`${id}.input must be an object.`);
  }
  const criticInput = testCase.input as JsonObject;
  requireStrings(criticInput.items, `${id}.input.items`, false);
  requireText(criticInput, "occasion", `${id}.input`);
  requireText(criticInput, "culturalNote", `${id}.input`);
  for (const sourceId of requireStrings(criticInput.sourceIds, `${id}.input.sourceIds`, false)) {
    const linkedSource = sources.find((source) => source.id === sourceId);
    if (!linkedSource) throw new Error(`${id} input references unknown source: ${sourceId}`);
    if (!(linkedSource.garment_ids as string[]).includes(garment)) {
      throw new Error(`${id} input uses source ${sourceId} for another garment.`);
    }
    if (linkedSource.status !== "approved") {
      throw new Error(`${id} input uses unapproved source: ${sourceId}`);
    }
  }
  if (!testCase.expected || typeof testCase.expected !== "object") {
    throw new Error(`${id}.expected must be an object.`);
  }
  const expected = testCase.expected as JsonObject;
  const expectedStatus = requireEnum(expected, "status", ["pass", "warning", "revise"], `${id}.expected`);
  const expectedRuleIds = requireStrings(expected.ruleIds, `${id}.expected.ruleIds`);
  for (const ruleId of expectedRuleIds) {
    const linkedRecord = knowledgeRecords.find((record) => record.id === ruleId);
    if (!linkedRecord) throw new Error(`${id} expects unknown rule: ${ruleId}`);
    if (linkedRecord.garment !== garment) {
      throw new Error(`${id} expects rule ${ruleId} for another garment.`);
    }
    if (linkedRecord.verification_status !== "verified" || !linkedRecord.reviewed) {
      throw new Error(`${id} expects rule ${ruleId} that is not verified/reviewed.`);
    }
  }
  for (const sourceId of requireStrings(expected.sourceIds, `${id}.expected.sourceIds`, false)) {
    const linkedSource = sources.find((source) => source.id === sourceId);
    if (!linkedSource) throw new Error(`${id} expects unknown source: ${sourceId}`);
    if (!(linkedSource.garment_ids as string[]).includes(garment)) {
      throw new Error(`${id} expects source ${sourceId} for another garment.`);
    }
    if (linkedSource.status !== "approved") {
      throw new Error(`${id} expects unapproved source: ${sourceId}`);
    }
  }
  if (!Array.isArray(expected.warnings)) throw new Error(`${id}.expected.warnings must be an array.`);
  const warningRuleIds = new Set<string>();
  for (const warning of expected.warnings as JsonObject[]) {
    const warningRuleId = requireText(warning, "ruleId", `${id}.expected.warning`);
    if (warningRuleIds.has(warningRuleId)) throw new Error(`${id} has duplicate warning rule: ${warningRuleId}`);
    warningRuleIds.add(warningRuleId);
    if (!expectedRuleIds.includes(warningRuleId)) {
      throw new Error(`${id} warning ${warningRuleId} is missing from expected.ruleIds.`);
    }
    requireEnum(warning, "severity", ["low", "medium", "high"], `${id}.${warningRuleId}`);
    requireText(warning, "suggestedFix", `${id}.${warningRuleId}`);
    const matrixRow = (casesDocument.rule_matrix as JsonObject[]).find(
      (row) => row.ruleId === warningRuleId,
    );
    if (warning.severity !== matrixRow?.expected_severity) {
      throw new Error(`${id}.${warningRuleId}.severity does not match the critic rule matrix.`);
    }
  }
  for (const ruleId of expectedRuleIds) {
    if (!warningRuleIds.has(ruleId)) {
      throw new Error(`${id} expected rule ${ruleId} has no warning payload.`);
    }
  }
  if (expectedStatus === "pass" && (expectedRuleIds.length > 0 || warningRuleIds.size > 0)) {
    throw new Error(`${id} pass case cannot contain expected warnings.`);
  }
  if (expectedStatus !== "pass" && warningRuleIds.size === 0) {
    throw new Error(`${id} ${expectedStatus} case must contain at least one warning.`);
  }
  if (
    expectedStatus === "revise" &&
    expectedRuleIds.some(
      (ruleId) => knowledgeRecords.find((record) => record.id === ruleId)?.enforcement !== "hard",
    )
  ) {
    throw new Error(`${id} cannot expect revise from advisory-only cultural rules.`);
  }

  for (const reviewKey of ["case_review", "runtime_review"] as const) {
    if (!testCase[reviewKey] || typeof testCase[reviewKey] !== "object") {
      throw new Error(`${id}.${reviewKey} must be an object.`);
    }
    const review = testCase[reviewKey] as JsonObject;
    requireEnum(review, "verdict", ["pass", "warning", "fail", "pending"], `${id}.${reviewKey}`);
    requireText(review, "reason", `${id}.${reviewKey}`);
  }

  const statuses = criticCoverage.get(garment) ?? new Set<string>();
  statuses.add(expectedStatus);
  criticCoverage.set(garment, statuses);
}

for (const garment of ["ao_dai", "ao_ngu_than", "ao_tu_than", "nhat_binh"]) {
  const statuses = criticCoverage.get(garment);
  if (!statuses?.has("pass") || !statuses.has("warning")) {
    throw new Error(`Critic cases must cover both pass and warning for ${garment}.`);
  }
}

const recommendationCasesDocument = readJson(recommendationCasesPath);
if (
  !Array.isArray(recommendationCasesDocument.cases) ||
  recommendationCasesDocument.cases.length < 5
) {
  throw new Error("At least five recommendation cultural acceptance cases are required.");
}

const metadata = recommendationCasesDocument.metadata;
if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
  throw new Error("Recommendation cultural cases must include metadata.");
}
const baselineArtifact = requireText(metadata as JsonObject, "baseline_artifact", "metadata");
if (!existsSync(join(root, baselineArtifact))) {
  throw new Error(`Recommendation baseline artifact does not exist: ${baselineArtifact}`);
}

const recommendationCaseIds = new Set<string>();
const coveredGarments = new Set<string>();
for (const testCase of recommendationCasesDocument.cases as JsonObject[]) {
  const id = requireText(testCase, "id", "recommendation cultural case");
  if (recommendationCaseIds.has(id)) throw new Error(`Duplicate recommendation case ID: ${id}`);
  recommendationCaseIds.add(id);

  if (!testCase.input || typeof testCase.input !== "object" || Array.isArray(testCase.input)) {
    throw new Error(`${id}.input must be an object.`);
  }
  const input = testCase.input as JsonObject;
  const garment = requireText(input, "garment", `${id}.input`);
  if (garment !== "auto" && !garmentIds.has(garment)) {
    throw new Error(`${id} uses unknown garment: ${garment}`);
  }
  coveredGarments.add(garment);
  requireText(input, "occasion", `${id}.input`);
  requireText(input, "style", `${id}.input`);
  requireStrings(input.colors, `${id}.input.colors`, false);
  if (
    typeof input.remixLevel !== "number" ||
    input.remixLevel < 0 ||
    input.remixLevel > 100
  ) {
    throw new Error(`${id}.input.remixLevel must be between 0 and 100.`);
  }

  if (
    !testCase.expected_grounding ||
    typeof testCase.expected_grounding !== "object" ||
    Array.isArray(testCase.expected_grounding)
  ) {
    throw new Error(`${id}.expected_grounding must be an object.`);
  }
  const expected = testCase.expected_grounding as JsonObject;
  for (const eligibleGarment of requireStrings(
    expected.eligible_garments,
    `${id}.expected_grounding.eligible_garments`,
    false,
  )) {
    if (!garmentIds.has(eligibleGarment)) {
      throw new Error(`${id} expects unknown eligible garment: ${eligibleGarment}`);
    }
  }
  const requiredSourceIds = requireStrings(
    expected.required_source_ids,
    `${id}.expected_grounding.required_source_ids`,
  );
  for (const sourceId of requiredSourceIds) {
    if (!sourceIds.has(sourceId)) throw new Error(`${id} expects unknown source: ${sourceId}`);
  }
  for (const ruleId of requireStrings(
    expected.required_record_ids,
    `${id}.expected_grounding.required_record_ids`,
  )) {
    const linkedRecord = knowledgeRecords.find((record) => record.id === ruleId);
    if (!linkedRecord) throw new Error(`${id} expects unknown record: ${ruleId}`);
    if (garment !== "auto" && linkedRecord.garment !== garment) {
      throw new Error(`${id} expects a record for another garment: ${ruleId}`);
    }
    for (const sourceId of linkedRecord.source_ids as string[]) {
      if (!requiredSourceIds.includes(sourceId)) {
        throw new Error(`${id} omits source ${sourceId} required by record ${ruleId}.`);
      }
    }
  }
  requireStrings(expected.assertions, `${id}.expected_grounding.assertions`, false);

  if (
    !testCase.baseline_review ||
    typeof testCase.baseline_review !== "object" ||
    Array.isArray(testCase.baseline_review)
  ) {
    throw new Error(`${id}.baseline_review must be an object.`);
  }
  const baselineReview = testCase.baseline_review as JsonObject;
  for (const key of ["cultural_note", "source_ids", "overall"] as const) {
    requireEnum(baselineReview, key, ["pass", "warning", "fail"], `${id}.baseline_review`);
  }
  requireText(baselineReview, "reason", `${id}.baseline_review`);

  if (
    !testCase.live_review ||
    typeof testCase.live_review !== "object" ||
    Array.isArray(testCase.live_review)
  ) {
    throw new Error(`${id}.live_review must be an object.`);
  }
  const liveReview = testCase.live_review as JsonObject;
  if (typeof liveReview.look_count !== "number" || liveReview.look_count !== 3) {
    throw new Error(`${id}.live_review.look_count must equal 3.`);
  }
  for (const outputGarment of requireStrings(
    liveReview.output_garments,
    `${id}.live_review.output_garments`,
    false,
  )) {
    if (!garmentIds.has(outputGarment)) {
      throw new Error(`${id}.live_review uses unknown output garment: ${outputGarment}`);
    }
  }
  for (const sourceId of requireStrings(
    liveReview.observed_source_ids,
    `${id}.live_review.observed_source_ids`,
    false,
  )) {
    if (!sourceIds.has(sourceId)) {
      throw new Error(`${id}.live_review references unknown source: ${sourceId}`);
    }
  }
  for (const key of ["cultural_note", "source_ids", "overall"] as const) {
    requireEnum(liveReview, key, ["pass", "warning", "fail"], `${id}.live_review`);
  }
  requireText(liveReview, "reason", `${id}.live_review`);
}

for (const requiredGarment of ["ao_dai", "ao_ngu_than", "ao_tu_than", "nhat_binh", "auto"]) {
  if (!coveredGarments.has(requiredGarment)) {
    throw new Error(`Recommendation cases do not cover garment: ${requiredGarment}`);
  }
}

console.log(
  `Cultural data valid: ${garmentIds.size} garments, ${sourceIds.size} sources, ${ruleIds.size} knowledge records, ${presentRuleTypes.size} rule types, ${caseIds.size} validation cases, ${recommendationCaseIds.size} recommendation cases.`,
);
