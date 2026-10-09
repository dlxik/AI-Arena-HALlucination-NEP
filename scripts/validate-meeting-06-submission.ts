import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const readJson = (path: string) => JSON.parse(readFileSync(resolve(path), "utf8"));
const evaluation = readJson("docs/meeting-05-ai-evaluation.json") as {
  imageProvider: { configured: boolean; mode: string };
  summary: { total: number; passed: number; failed: number };
};
const adjudication = readJson("docs/meeting-05-cultural-adjudication.json") as {
  metadata: { case_count: number };
  coverage: { garments: string[] };
  cases: unknown[];
};
const sources = readJson("data/sources/references.json").sources as Array<{
  id: string;
  status: "approved" | "needs_review";
}>;

const errors: string[] = [];
const requiredFiles = [
  "docs/submission-draft.md",
  "docs/demo-script-shot-list.md",
  "docs/meeting-06-cultural-signoff.md",
  "docs/meeting-06-submission-checklist.md",
];

for (const file of requiredFiles) {
  if (!existsSync(resolve(file))) errors.push(`Missing Meeting 06 artefact: ${file}`);
}

if (evaluation.summary.total !== 16 || evaluation.summary.passed !== 16 || evaluation.summary.failed !== 0) {
  errors.push("Final evaluation must remain 16 total, 16 passed, 0 failed");
}
if (adjudication.metadata.case_count !== 19 || adjudication.cases.length !== 19) {
  errors.push("Cultural adjudication must contain exactly 19 cases");
}
const expectedGarments = ["ao_dai", "ao_ngu_than", "ao_tu_than", "nhat_binh"];
if (expectedGarments.some((garment) => !adjudication.coverage.garments.includes(garment))) {
  errors.push("Cultural adjudication must cover all four MVP garments");
}

const approved = sources.filter((source) => source.status === "approved");
const needsReview = sources.filter((source) => source.status === "needs_review");
const expectedNeedsReview = ["HMCC_NHAT_BINH_2022", "VWM_AO_DAI"];
if (approved.length !== 6) errors.push(`Expected 6 approved sources, found ${approved.length}`);
if (
  needsReview.length !== 2 ||
  expectedNeedsReview.some((id) => !needsReview.some((source) => source.id === id))
) {
  errors.push("Expected only VWM_AO_DAI and HMCC_NHAT_BINH_2022 to remain needs_review");
}
if (evaluation.imageProvider.configured || evaluation.imageProvider.mode !== "disabled_for_critic_only_evaluation") {
  errors.push("Meeting 06 wording assumes the committed evaluation used image fallback; re-review generated images before changing this");
}

if (errors.length > 0) {
  console.error(errors.join("\n"));
  process.exit(1);
}

console.log(
  `Meeting 06 submission evidence valid: ${evaluation.summary.passed}/${evaluation.summary.total} evaluation cases passed; ` +
    `${adjudication.cases.length} cultural cases; ${approved.length} approved and ${needsReview.length} needs_review sources; image review N/A (fallback).`,
);
