import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

type ReviewCase = {
  id: string;
  group: "intent" | "recommendation" | "critic" | "image" | "remix";
  garment: string;
  expected: string;
  actual: string;
  verdict: "pass" | "pass_with_limitation" | "warning" | "fail";
  rationale: string;
  source_ids: string[];
  rule_ids: string[];
  evidence: string[];
};

const readJson = (path: string) => JSON.parse(readFileSync(resolve(path), "utf8"));
const review = readJson("docs/meeting-05-cultural-adjudication.json") as {
  metadata: { case_count: number };
  cases: ReviewCase[];
};
const sources = readJson("data/sources/references.json").sources as Array<{
  id: string;
  status: string;
  garment_ids: string[];
}>;
const records = readJson("data/knowledge/records.json").records as Array<{
  id: string;
  garment: string;
  verification_status: string;
  reviewed: boolean;
  source_ids: string[];
}>;

const errors: string[] = [];
const ids = new Set<string>();
const counts = new Map<string, number>();
const sourceById = new Map(sources.map((source) => [source.id, source]));
const recordById = new Map(records.map((record) => [record.id, record]));

for (const item of review.cases) {
  if (ids.has(item.id)) errors.push(`Duplicate case id: ${item.id}`);
  ids.add(item.id);
  counts.set(item.group, (counts.get(item.group) ?? 0) + 1);
  for (const field of [item.expected, item.actual, item.rationale]) {
    if (!field.trim()) errors.push(`${item.id}: missing review text`);
  }
  if (item.evidence.length === 0) errors.push(`${item.id}: missing evidence`);
  for (const evidencePath of item.evidence) {
    if (!existsSync(resolve(evidencePath))) errors.push(`${item.id}: evidence file not found: ${evidencePath}`);
  }

  for (const sourceId of item.source_ids) {
    const source = sourceById.get(sourceId);
    if (!source) errors.push(`${item.id}: unknown source ${sourceId}`);
    else if (source.status !== "approved") errors.push(`${item.id}: unapproved source ${sourceId}`);
    else if (!source.garment_ids.includes(item.garment)) errors.push(`${item.id}: source ${sourceId} does not match ${item.garment}`);
  }

  for (const ruleId of item.rule_ids) {
    const rule = recordById.get(ruleId);
    if (!rule) errors.push(`${item.id}: unknown rule ${ruleId}`);
    else if (rule.garment !== item.garment) errors.push(`${item.id}: rule ${ruleId} does not match ${item.garment}`);
    else if (rule.verification_status !== "verified" || !rule.reviewed) errors.push(`${item.id}: rule ${ruleId} is not production-reviewed`);
    else if (rule.source_ids.some((sourceId) => !item.source_ids.includes(sourceId))) errors.push(`${item.id}: rule ${ruleId} source missing from case`);
  }
}

const minimums = { intent: 3, recommendation: 4, critic: 4, image: 2, remix: 3 };
for (const [group, minimum] of Object.entries(minimums)) {
  if ((counts.get(group) ?? 0) < minimum) errors.push(`${group}: expected at least ${minimum} cases`);
}
if (review.cases.length < 15 || review.cases.length > 20) errors.push("Case count must be between 15 and 20");
if (review.metadata.case_count !== review.cases.length) errors.push("metadata.case_count does not match cases length");

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(`Meeting 05 cultural review valid: ${review.cases.length} cases; ${[...counts].map(([group, count]) => `${group}=${count}`).join(", ")}.`);
