import { loadEnvConfig } from "@next/env";
import { createHash } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import { handleRemix } from "../src/app/api/remix/route";
import { getGeminiApiKey, getGeminiModel, getGeminiTimeoutMs } from "../src/lib/gemini/client";
import { critiqueWithGemini, loadCriticPrompt } from "../src/lib/gemini/critic";
import { generateImageWithGemini, getImageConfiguration, ImageProviderError } from "../src/lib/gemini/image-generator";
import { loadImagePrompt } from "../src/lib/gemini/image-prompt";
import { retrieveCulturalRules } from "../src/lib/cultural/rule-retrieval";
import type { RemixOutput } from "../src/types/api";
import cases from "../tests/prompt-evaluation/image-remix-cases.json";
import { criticCases, makeCriticInput } from "../tests/fixtures/critic-cases";

loadEnvConfig(process.cwd());
const hash = (value: string | Buffer) => createHash("sha256").update(value).digest("hex");

async function main() {
  getGeminiApiKey();
  const withImages = process.argv.includes("--with-images");
  const configuration = withImages ? getImageConfiguration() : undefined;
  const report = {
    executedAt: new Date().toISOString(), timezone: "Asia/Saigon",
    criticModel: getGeminiModel(), criticTimeoutMs: getGeminiTimeoutMs(),
    imageProvider: configuration ? "gemini" : "disabled_for_critic_only_evaluation",
    imageModel: configuration?.model ?? null, imageTimeoutMs: configuration?.timeoutMs ?? null,
    criticPrompt: "prompts/critic/critic-v1.md", criticPromptSha256: hash(await loadCriticPrompt()),
    imagePrompt: "prompts/image/image-v1.md", imagePromptSha256: hash(await loadImagePrompt()),
    culturalReviewer: "Pending Diệu Linh review; expected outcomes are backend hypotheses",
    imageReview: "Not culturally reviewed; images are AI illustrations, not authenticated artefacts",
    cases: [] as Array<Record<string, unknown>>,
  };
  const destination = "docs/meeting-04-image-remix-evaluation.json";
  for (const testCase of cases) {
    console.log(`RUN ${testCase.id}`);
    const started = Date.now();
    const base = criticCases.find(({ id }) => id === testCase.baseCaseId);
    if (!base) throw new Error("Evaluation fixture is missing.");
    const input = makeCriticInput(base);
    const response = await handleRemix(new Request("http://localhost/api/remix", {
      method: "POST", body: JSON.stringify({ ...input, look: { ...input.look,
        validation: { status: "pass", warnings: [] }, imageUrl: "stale-image-must-not-survive" }, changes: testCase.changes }),
    }), { critique: critiqueWithGemini, generate: withImages ? generateImageWithGemini : async () => { throw new ImageProviderError("not_configured"); } });
    const body = await response.json();
    const data: RemixOutput | undefined = body.success ? body.data : undefined;
    const matches = data?.validation.status === testCase.expectedStatus &&
      testCase.expectedRuleIds.every((id) => data.validation.warnings.some(({ ruleId }) => ruleId === id)) &&
      data.look.id !== input.look.id && data.image.lookId === data.look.id &&
      Boolean(data.validationId) && Number.isFinite(Date.parse(data.validatedAt)) &&
      JSON.stringify(data.look.sourceIds) === JSON.stringify(input.look.sourceIds) &&
      data.look.garment === input.look.garment;
    let imageEvidence: Record<string, unknown> | undefined;
    if (data?.image.status === "generated") {
      const [prefix, base64] = data.image.imageUrl.split(";base64,");
      const bytes = Buffer.from(base64, "base64");
      const extension = prefix === "data:image/jpeg" ? "jpg" : prefix === "data:image/webp" ? "webp" : "png";
      await mkdir("artifacts/meeting-04", { recursive: true });
      const imagePath = `artifacts/meeting-04/${testCase.id}.${extension}`;
      await writeFile(imagePath, bytes);
      imageEvidence = { imagePath, mimeType: prefix.slice(5), bytes: bytes.length, sha256: hash(bytes) };
    }
    report.cases.push({ id: testCase.id, garment: input.look.garment,
      result: matches ? "pass" : "fail", httpStatus: response.status, elapsedMs: Date.now() - started,
      expectedStatus: testCase.expectedStatus, expectedRuleIds: testCase.expectedRuleIds,
      changes: testCase.changes,
      ...(data ? { validation: data.validation, validationId: data.validationId, validatedAt: data.validatedAt,
        image: { lookId: data.image.lookId, status: data.image.status,
          ...(data.image.status === "fallback" ? { fallbackReason: data.image.fallbackReason } : imageEvidence) },
        sourceIds: data.look.sourceIds, ruleIds: retrieveCulturalRules(data.look).rules.map(({ id }) => id),
      } : { errorCode: body.error.code }),
    });
    // Persist progress after each case; no raw provider payloads or base64 in the report.
    await writeFile(destination, JSON.stringify(report, null, 2) + "\n", "utf8");
    console.log(`${matches ? "PASS" : "FAIL"} ${testCase.id} (${data?.validation.status ?? body.error.code}; image=${data?.image.status ?? "not_started"})`);
  }
  const passed = report.cases.filter(({ result }) => result === "pass").length;
  console.log(`Critic/remix evaluation: ${passed}/${cases.length}. Report: ${destination}`);
  if (passed !== cases.length || (withImages && report.cases.some((entry) => (entry.image as { status?: string } | undefined)?.status !== "generated"))) process.exitCode = 1;
}

main().catch(() => {
  console.error("Evaluation could not complete. Check local Gemini/image configuration; private details omitted.");
  process.exitCode = 1;
});
