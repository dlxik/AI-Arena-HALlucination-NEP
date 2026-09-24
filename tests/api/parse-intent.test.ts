import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import test from "node:test";
import { POST } from "../../src/app/api/parse-intent/route";
import {
  GeminiOutputError,
  parseIntentWithGemini,
} from "../../src/lib/gemini/parse-intent";
import type { RecommendationInput } from "../../src/types/api";

type IntentCase = {
  id: string;
  description: string;
  expected: Omit<RecommendationInput, "description">;
  remixLevelRange: [number, number];
};

function loadCases(): IntentCase[] {
  const contents = readFileSync(
    path.join(
      process.cwd(),
      "tests",
      "prompt-evaluation",
      "intent-cases.json",
    ),
    "utf8",
  );
  return JSON.parse(contents) as IntentCase[];
}

for (const intentCase of loadCases()) {
  test(`normalizes intent contract: ${intentCase.id}`, async () => {
    const result = await parseIntentWithGemini(
      intentCase.description,
      async ({ input, responseSchema, systemInstruction }) => {
        assert.match(systemInstruction, /Security boundary/);
        assert.match(input, /untrusted user input/);
        assert.equal(responseSchema.additionalProperties, false);
        return JSON.stringify(intentCase.expected);
      },
    );

    assert.deepEqual(result, {
      ...intentCase.expected,
      description: intentCase.description,
    });
  });
}

test("rejects malformed JSON returned by Gemini", async () => {
  await assert.rejects(
    parseIntentWithGemini("Đi chơi với phong cách tối giản", async () => "not-json"),
    GeminiOutputError,
  );
});

test("rejects extra fields returned by Gemini", async () => {
  await assert.rejects(
    parseIntentWithGemini("Đi lễ hội với áo tứ thân", async () =>
      JSON.stringify({
        occasion: "festival",
        garment: "ao_tu_than",
        style: "minimal",
        colors: ["black"],
        remixLevel: 40,
        apiKey: "must-not-be-accepted",
      }),
    ),
    /unsupported fields/,
  );
});

test("route returns 400 for invalid JSON", async () => {
  const response = await POST(
    new Request("http://localhost/api/parse-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_JSON");
});

test("route returns 422 for an empty description", async () => {
  const response = await POST(
    new Request("http://localhost/api/parse-intent", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ description: "  " }),
    }),
  );

  assert.equal(response.status, 422);
  assert.equal((await response.json()).error.code, "INVALID_INPUT");
});

test("route returns 503 when the Gemini key is missing", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const response = await POST(
      new Request("http://localhost/api/parse-intent", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          description: "Đi Văn Miếu với phong cách tối giản",
        }),
      }),
    );

    assert.equal(response.status, 503);
    assert.equal(
      (await response.json()).error.code,
      "GEMINI_NOT_CONFIGURED",
    );
  } finally {
    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  }
});
