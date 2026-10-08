import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { loadCriticPrompt } from "../src/lib/gemini/critic";
import { loadImagePrompt } from "../src/lib/gemini/image-prompt";
import { loadIntentPrompt } from "../src/lib/gemini/parse-intent";

type Entry = Record<string, unknown>;

async function readJson(file: string): Promise<Entry> {
  return JSON.parse(await readFile(file, "utf8")) as Entry;
}

/** Cast a value known to be an object at runtime to Entry. */
function asEntry(value: unknown): Entry {
  return value as Entry;
}

/** Cast a value known to be an array at runtime to Entry[]. */
function asEntries(value: unknown): Entry[] {
  return (value ?? []) as Entry[];
}

async function main() {
  const [intentReport, criticReport, remixReport, criticPrompt, imagePrompt, intentPrompt] = await Promise.all([
    readJson("docs/meeting-05-intent-evaluation.json"),
    readJson("docs/meeting-03-critic-evaluation.json"),
    readJson("docs/meeting-04-image-remix-evaluation.json"),
    loadCriticPrompt(),
    loadImagePrompt(),
    loadIntentPrompt(),
  ]);
  const intent = (id: string) => asEntries(intentReport.cases).find((entry) => entry.id === id);
  const recommendation = (id: string) => asEntries(criticReport.recommendation).find((entry) => entry.id === id);
  const critic = (id: string) => asEntries(criticReport.critic).find((entry) => entry.id === id);
  const remix = (id: string) => asEntries(remixReport.cases).find((entry) => entry.id === id);
  const cases: Entry[] = [];

  for (const id of ["cultural-visit-explicit", "photoshoot-missing-garment", "prompt-injection"]) {
    const entry = intent(id);
    if (!entry) throw new Error(`Missing intent evaluation: ${id}`);
    cases.push({ id, category: "intent", expected: entry.expected, actual: entry.actual ?? { errorCode: entry.errorCode },
      verdict: entry.result, elapsedMs: entry.elapsedMs, reviewer: "Lan Anh (backend); cultural adjudication pending Linh",
      sourceArtifact: "docs/meeting-05-intent-evaluation.json" });
  }

  for (const id of ["RC_01_AO_DAI_FESTIVAL", "RC_02_AO_NGU_THAN_CULTURAL_VISIT", "RC_03_AO_TU_THAN_FESTIVAL", "RC_04_NHAT_BINH_PHOTOSHOOT"]) {
    const entry = recommendation(id);
    if (!entry) throw new Error(`Missing recommendation evaluation: ${id}`);
    const looks = asEntries(entry.looks);
    cases.push({ id, category: "recommendation", expected: { lookCount: 3, requestedGarment: id.split("_")[2] },
      actual: { lookCount: looks.length, garments: looks.map((look) => look.garment),
        statuses: looks.map((look) => asEntry(look.validation).status), sourceIds: [...new Set(looks.flatMap((look) => asEntries(look.sourceIds)))] },
      verdict: entry.result, elapsedMs: entry.elapsedMs, reviewer: "Lan Anh (backend); cultural adjudication pending Linh",
      sourceArtifact: "docs/meeting-03-critic-evaluation.json" });
  }

  for (const id of ["CC_01_AO_DAI_VALID", "CC_04_NGU_THAN_BUTTONS", "CC_05_TU_THAN_VALID", "CC_08_RC04_NHAT_BINH_MISSING_COLLAR"]) {
    const entry = critic(id);
    if (!entry) throw new Error(`Missing Critic evaluation: ${id}`);
    const validation = asEntry(entry.validation);
    cases.push({ id, category: "critic", expected: { status: entry.expectedStatus, ruleIds: entry.expectedRuleIds },
      actual: { status: validation.status, warnings: asEntries(validation.warnings), retrievedRules: asEntries(entry.retrievedRules).map((rule) => rule.id) },
      verdict: entry.result, elapsedMs: entry.elapsedMs, reviewer: "Lan Anh (backend); cultural adjudication pending Linh",
      sourceArtifact: "docs/meeting-03-critic-evaluation.json" });
  }

  for (const id of ["IR_01_AO_DAI_PALETTE", "IR_03_NGU_THAN_PALETTE"]) {
    const entry = remix(id);
    if (!entry) throw new Error(`Missing image evaluation: ${id}`);
    const image = asEntry(entry.image);
    cases.push({ id, category: "image", expected: { status: "generated or explicit fallback", fallbackReason: "not_configured" },
      actual: { status: image.status, fallbackReason: image.fallbackReason, httpStatus: entry.httpStatus },
      verdict: entry.result, elapsedMs: entry.elapsedMs, reviewer: "Lan Anh (backend); generated-image review pending provider configuration",
      sourceArtifact: "docs/meeting-04-image-remix-evaluation.json" });
  }

  for (const id of ["IR_02_AO_DAI_RISK", "IR_06_TU_THAN_RISK", "IR_08_NHAT_BINH_RISK"]) {
    const entry = remix(id);
    if (!entry) throw new Error(`Missing remix evaluation: ${id}`);
    const validation = asEntry(entry.validation);
    cases.push({ id, category: "remix", expected: { status: entry.expectedStatus, ruleIds: entry.expectedRuleIds, freshValidation: true },
      actual: { status: validation.status, warnings: asEntries(validation.warnings),
        freshValidation: Boolean(entry.validationId && entry.validatedAt), image: entry.image },
      verdict: entry.result, elapsedMs: entry.elapsedMs, reviewer: "Lan Anh (backend); cultural adjudication pending Linh",
      sourceArtifact: "docs/meeting-04-image-remix-evaluation.json" });
  }

  const categoryCounts = Object.fromEntries(["intent", "recommendation", "critic", "image", "remix"].map((category) =>
    [category, cases.filter((entry) => entry.category === category).length]));
  if (cases.length < 15 || cases.length > 20 || cases.some((entry) => entry.verdict !== "pass") ||
      Object.values(categoryCounts).some((count) => count < 2)) {
    throw new Error("Meeting 05 evaluation is incomplete or contains a failed case.");
  }

  const report = {
    executedAt: new Date().toISOString(), timezone: "Asia/Saigon", model: criticReport.model,
    promptVersions: {
      intent: { file: "prompts/intent/intent-v1.md", sha256: createHash("sha256").update(intentPrompt).digest("hex") },
      critic: { file: "prompts/critic/critic-v1.md", sha256: createHash("sha256").update(criticPrompt).digest("hex") },
      image: { file: "prompts/image/image-v1.md", sha256: createHash("sha256").update(imagePrompt).digest("hex") },
    },
    timeoutMs: { critic: criticReport.timeoutMs, image: remixReport.imageTimeoutMs },
    imageProvider: { configured: remixReport.imageProvider === "gemini", mode: remixReport.imageProvider,
      model: remixReport.imageModel, blocker: remixReport.imageProvider === "gemini" ? null : "GEMINI_IMAGE_MODEL/provider is not configured; generated-image success cannot be demonstrated." },
    summary: { total: cases.length, passed: cases.filter((entry) => entry.verdict === "pass").length,
      failed: cases.filter((entry) => entry.verdict !== "pass").length, categories: categoryCounts },
    culturalReview: "Pending Diệu Linh adjudication; backend verdicts are not cultural approval.",
    cases,
  };
  await writeFile("docs/meeting-05-ai-evaluation.json", JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(`Meeting 05 evaluation: ${cases.length} cases; report docs/meeting-05-ai-evaluation.json`);
}

main().catch(() => {
  console.error("Could not build Meeting 05 report. Check that all source evaluations completed successfully.");
  process.exitCode = 1;
});
