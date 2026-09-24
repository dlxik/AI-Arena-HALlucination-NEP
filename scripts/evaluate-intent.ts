import { loadEnvConfig } from "@next/env";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import path from "node:path";
import { parseIntentWithGemini } from "../src/lib/gemini/parse-intent";
import type { RecommendationInput } from "../src/types/api";

type IntentCase = {
  id: string;
  description: string;
  expected: Omit<RecommendationInput, "description">;
  remixLevelRange: [number, number];
};

loadEnvConfig(process.cwd());

async function main() {
  const casesPath = path.join(
    process.cwd(),
    "tests",
    "prompt-evaluation",
    "intent-cases.json",
  );
  const cases = JSON.parse(await readFile(casesPath, "utf8")) as IntentCase[];

  let passed = 0;

  for (const intentCase of cases) {
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
      console.log(`PASS ${intentCase.id}`);
    } catch (error) {
      console.error(
        `FAIL ${intentCase.id}: ${error instanceof Error ? error.message : "Unknown error"}`,
        error instanceof Error && "cause" in error ? error.cause : ""
      );
    }
  }

  console.log(`Intent evaluation: ${passed}/${cases.length} passed.`);
  if (passed !== cases.length) {
    process.exitCode = 1;
  }
}

main().catch((error: unknown) => {
  console.error(error instanceof Error ? error.message : "Intent evaluation failed.");
  process.exitCode = 1;
});
