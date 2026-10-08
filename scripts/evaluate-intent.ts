import { loadEnvConfig } from "@next/env";
import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readFile } from "node:fs/promises";
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { getGeminiApiKey, getGeminiModel, getGeminiTimeoutMs } from "../src/lib/gemini/client";
import { loadIntentPrompt, parseIntentWithGemini } from "../src/lib/gemini/parse-intent";
import type { RecommendationInput } from "../src/types/api";

type IntentCase = {
  id: string;
  description: string;
  expected: Omit<RecommendationInput, "description">;
  remixLevelRange: [number, number];
};

function promptSha256(prompt: string): string {
  return createHash("sha256").update(prompt.replace(/\r\n/g, "\n")).digest("hex");
}

loadEnvConfig(process.cwd());

async function main() {
  getGeminiApiKey();
  const casesPath = path.join(
    process.cwd(),
    "tests",
    "prompt-evaluation",
    "intent-cases.json",
  );
  const cases = JSON.parse(await readFile(casesPath, "utf8")) as IntentCase[];
  const prompt = await loadIntentPrompt();
  const report = {
    executedAt: new Date().toISOString(),
    timezone: "Asia/Saigon",
    model: getGeminiModel(),
    timeoutMs: getGeminiTimeoutMs(),
    prompt: "prompts/intent/intent-v1.md",
    promptSha256: promptSha256(prompt),
    cases: [] as Array<Record<string, unknown>>,
  };

  let passed = 0;

  for (const intentCase of cases) {
    const started = Date.now();
    try {
      const actual = await parseIntentWithGemini(intentCase.description);
      assert.deepEqual(
        {
          occasion: actual.occasion,
          garment: actual.garment,
          style: actual.style,
          colors: actual.colors,
        },
        {
          occasion: intentCase.expected.occasion,
          garment: intentCase.expected.garment,
          style: intentCase.expected.style,
          colors: intentCase.expected.colors,
        },
      );
      assert.ok(
        actual.remixLevel >= intentCase.remixLevelRange[0] &&
          actual.remixLevel <= intentCase.remixLevelRange[1],
        `Expected remixLevel in ${intentCase.remixLevelRange.join("..")}, received ${actual.remixLevel}.`,
      );
      passed += 1;
      report.cases.push({
        id: intentCase.id,
        result: "pass",
        elapsedMs: Date.now() - started,
        expected: intentCase.expected,
        actual: {
          occasion: actual.occasion,
          garment: actual.garment,
          style: actual.style,
          colors: actual.colors,
          remixLevel: actual.remixLevel,
        },
      });
      console.log(`PASS ${intentCase.id}`);
    } catch (error) {
      report.cases.push({
        id: intentCase.id,
        result: "fail",
        elapsedMs: Date.now() - started,
        expected: intentCase.expected,
        errorCode: error instanceof Error ? error.name : "UnknownError",
      });
      console.error(
        `FAIL ${intentCase.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error && "cause" in error ? error.cause : ""
      );
    }
  }

  const reportPath = "docs/meeting-05-intent-evaluation.json";
  await writeFile(reportPath, JSON.stringify(report, null, 2) + "\n", "utf8");
  console.log(`Intent evaluation: ${passed}/${cases.length} passed.`);
  console.log(`Intent report: ${reportPath}`);
  if (passed !== cases.length) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Intent evaluation failed.");
  process.exitCode = 1;
});
