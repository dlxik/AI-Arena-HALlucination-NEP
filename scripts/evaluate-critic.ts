import { loadEnvConfig } from "@next/env";
import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { handleRecommendation } from "../src/app/api/recommend/route";
import { handleValidation } from "../src/app/api/validate/route";
import { getGeminiApiKey, getGeminiModel, getGeminiTimeoutMs } from "../src/lib/gemini/client";
import { loadCriticPrompt } from "../src/lib/gemini/critic";
import { retrieveCulturalRules } from "../src/lib/cultural/rule-retrieval";
import { parseCulturalValidation } from "../src/lib/validation/cultural-validation";
import type { RecommendationInput, RecommendationOutput, ValidationOutput } from "../src/types/api";
import { criticCases, makeCriticInput } from "../tests/fixtures/critic-cases";

loadEnvConfig(process.cwd());

function request(endpoint: string, body: unknown) {
  return new Request(`http://localhost/api/${endpoint}`, {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

async function main() {
  // Check configuration before any API request. Never print key or error causes.
  getGeminiApiKey();
  const report = {
    executedAt: new Date().toISOString(), timezone: "Asia/Saigon",
    model: getGeminiModel(), timeoutMs: getGeminiTimeoutMs(),
    prompt: "prompts/critic/critic-v1.md",
    promptSha256: createHash("sha256").update(await loadCriticPrompt()).digest("hex"),
    mode: "Live Gemini through API handlers; no browser/UI review",
    culturalReviewer: "Pending Diệu Linh review",
    critic: [] as Array<Record<string, unknown>>,
    recommendation: [] as Array<Record<string, unknown>>,
  };
  const destination = "docs/meeting-03-critic-evaluation.json";
  const retryFailed = process.argv.includes("--retry-failed");
  if (retryFailed) {
    const previous = JSON.parse(await readFile(destination, "utf8")) as typeof report;
    if (previous.promptSha256 !== report.promptSha256 || previous.model !== report.model) {
      throw new Error("A changed prompt/model requires a full evaluation.");
    }
    report.critic = previous.critic;
    report.recommendation = previous.recommendation;
  }
  function record(collection: Array<Record<string, unknown>>, entry: Record<string, unknown>) {
    const index = collection.findIndex(({ id }) => id === entry.id);
    if (index === -1) collection.push(entry);
    else {
      const old = collection[index];
      collection[index] = { ...entry, previousAttempts: [
        ...((old.previousAttempts as Array<Record<string, unknown>> | undefined) ?? []),
        { result: old.result, httpStatus: old.httpStatus, errorCode: old.errorCode,
          validation: old.validation, elapsedMs: old.elapsedMs },
      ] };
    }
  }
  for (const testCase of criticCases) {
    if (retryFailed && report.critic.some(({ id, result }) => id === testCase.id && result === "pass")) continue;
    console.log(`RUN ${testCase.id}`);
    const start = Date.now();
    const input = makeCriticInput(testCase);
    const response = await handleValidation(request("validate", input));
    const body = await response.json();
    const result = body.success ? body.data as ValidationOutput : undefined;
    const matches = result?.status === testCase.expectedStatus &&
      testCase.expectedRuleIds.every((id) => result.warnings.some(({ ruleId }) => ruleId === id));
    const context = retrieveCulturalRules(input.look);
    record(report.critic, {
      id: testCase.id, result: matches ? "pass" : "fail", httpStatus: response.status,
      elapsedMs: Date.now() - start, expectedStatus: testCase.expectedStatus,
      expectedRuleIds: testCase.expectedRuleIds,
      ...(result ? { validation: result } : { errorCode: body.error.code }),
      retrievedRules: context.rules.map((rule) => ({ id: rule.id, enforcement: rule.enforcement, sourceIds: rule.source_ids })),
    });
    console.log(`${matches ? "PASS" : "FAIL"} ${testCase.id} (${result?.status ?? body.error.code})`);
  }

  if (process.argv.includes("--recommend")) {
    const inputs = JSON.parse(await readFile("tests/prompt-evaluation/recommendation-cultural-cases.json", "utf8")) as {
      cases: Array<{ id: string; input: RecommendationInput }>;
    };
    for (const testCase of inputs.cases) {
      if (retryFailed && report.recommendation.some(({ id, result }) => id === testCase.id && result === "pass")) continue;
      console.log(`RUN ${testCase.id}`);
      const start = Date.now();
      const response = await handleRecommendation(request("recommend", testCase.input));
      const body = await response.json();
      const output = body.success ? body.data as RecommendationOutput : undefined;
      const valid = output?.looks.length === 3 && output.looks.every((look) =>
        parseCulturalValidation(look.validation, retrieveCulturalRules(look)).success);
      record(report.recommendation, {
        id: testCase.id, result: valid ? "pass" : "fail", httpStatus: response.status,
        elapsedMs: Date.now() - start,
        ...(output ? { looks: output.looks } : { errorCode: body.error.code }),
      });
      console.log(`${valid ? "PASS" : "FAIL"} ${testCase.id} (${response.status})`);
    }
  }
  await writeFile(destination, JSON.stringify(report, null, 2) + "\n", "utf8");
  const results = [...report.critic, ...report.recommendation];
  const passed = results.filter(({ result }) => result === "pass").length;
  console.log(`Evaluation: ${passed}/${results.length} pass. Report: ${destination}`);
  if (passed !== results.length) process.exitCode = 1;
}

main().catch(() => {
  console.error("Evaluation could not complete. Check local configuration/data; private error details are omitted.");
  process.exitCode = 1;
});
