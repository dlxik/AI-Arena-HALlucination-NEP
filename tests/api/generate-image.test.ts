import assert from "node:assert/strict";
import test from "node:test";
import { ApiError } from "@google/genai";
import { handleImageGeneration } from "../../src/app/api/generate-image/route";
import { GeminiConfigurationError, GeminiRequestError } from "../../src/lib/gemini/client";
import { CriticOutputError } from "../../src/lib/gemini/critic";
import { generateImageWithGemini, getImageConfiguration, ImageProviderError, parseImageProviderResponse } from "../../src/lib/gemini/image-generator";
import { parseInlineImage } from "../../src/lib/validation/image";
import { makeCriticInput } from "../fixtures/critic-cases";
import { IMAGE_URL, PNG, imageResponse } from "../fixtures/image";

const INPUT = makeCriticInput();
const PASS = { status: "pass" as const, warnings: [] };
const CONFIG = { model: "test-image-model", timeoutMs: 1_000 };
function request(body: unknown = INPUT) {
  return new Request("http://localhost/api/generate-image", { method: "POST", body: JSON.stringify(body) });
}

test("Gemini transport uses server configuration and emits only runtime-validated image", async () => {
  const result = await generateImageWithGemini("validated visual data", async (request) => {
    assert.equal(request.model, CONFIG.model);
    assert.equal(request.contents, "validated visual data");
    assert.match(String(request.config?.systemInstruction), /not an authenticated historical/);
    assert.deepEqual(request.config?.responseModalities, ["TEXT", "IMAGE"]);
    assert.equal(request.config?.httpOptions?.retryOptions?.attempts, 1);
    assert.equal(request.config?.httpOptions?.timeout, 1_000);
    assert.ok(request.config?.abortSignal);
    return imageResponse();
  }, CONFIG);
  assert.deepEqual(result, { imageUrl: IMAGE_URL });
});

test("image timeout aborts even a transport that does not settle", async () => {
  let signal: AbortSignal | undefined;
  await assert.rejects(generateImageWithGemini("data", async (request) => {
    signal = request.config?.abortSignal;
    return new Promise(() => {});
  }, { ...CONFIG, timeoutMs: 10 }), (error: unknown) => error instanceof ImageProviderError && error.reason === "timeout");
  assert.equal(signal?.aborted, true);
});

for (const [status, reason] of [[429, "quota"], [500, "upstream_error"], [401, "upstream_error"], [408, "timeout"], [504, "timeout"]] as const) {
  test(`provider status ${status} maps safely to ${reason}`, async () => {
    await assert.rejects(generateImageWithGemini("data", async () => {
      throw new ApiError({ status, message: "private-api-key raw-payload" });
    }, CONFIG), (error: unknown) => error instanceof ImageProviderError && error.reason === reason && !/private|raw-payload/.test(error.message));
  });
}

test("provider configuration is explicit and missing key maps to not_configured", async () => {
  const saved = { provider: process.env.IMAGE_PROVIDER, model: process.env.GEMINI_IMAGE_MODEL, key: process.env.GEMINI_API_KEY };
  try {
    delete process.env.IMAGE_PROVIDER;
    delete process.env.GEMINI_IMAGE_MODEL;
    assert.throws(getImageConfiguration, ImageProviderError);
    process.env.IMAGE_PROVIDER = "unsupported";
    process.env.GEMINI_IMAGE_MODEL = "test-image-model";
    assert.throws(getImageConfiguration, ImageProviderError);
    process.env.IMAGE_PROVIDER = "gemini";
    assert.equal(getImageConfiguration().model, "test-image-model");
    delete process.env.GEMINI_API_KEY;
    await assert.rejects(generateImageWithGemini("data"), (error: unknown) => error instanceof ImageProviderError && error.reason === "not_configured");
  } finally {
    for (const [key, value] of Object.entries({ IMAGE_PROVIDER: saved.provider, GEMINI_IMAGE_MODEL: saved.model, GEMINI_API_KEY: saved.key })) {
      if (value === undefined) delete process.env[key]; else process.env[key] = value;
    }
  }
});

for (const reason of ["SAFETY", "IMAGE_SAFETY", "PROHIBITED_CONTENT", "IMAGE_PROHIBITED_CONTENT", "BLOCKLIST", "SPII", "RECITATION", "IMAGE_RECITATION"]) {
  test(`provider ${reason} rejection never exposes an attached image`, () => {
    const response = imageResponse();
    response.candidates[0].finishReason = reason;
    assert.throws(() => parseImageProviderResponse(response), (error: unknown) => error instanceof ImageProviderError && error.reason === "safety_rejection");
  });
}
test("prompt feedback and candidate ratings block image output", () => {
  for (const response of [
    { ...imageResponse(), promptFeedback: { blockReason: "SAFETY", blockReasonMessage: "private" } },
    { candidates: [{ ...imageResponse().candidates[0], safetyRatings: [{ blocked: true }] }] },
  ]) assert.throws(() => parseImageProviderResponse(response), (error: unknown) => error instanceof ImageProviderError && error.reason === "safety_rejection");
});

for (const [label, inlineData] of [
  ["SVG MIME", { mimeType: "image/svg+xml", data: PNG }],
  ["MIME/signature mismatch", { mimeType: "image/jpeg", data: PNG }],
  ["noncanonical base64", { mimeType: "image/png", data: `${PNG}\n` }],
  ["invalid base64", { mimeType: "image/png", data: "!!!!" }],
  ["truncated image", { mimeType: "image/png", data: Buffer.from(PNG, "base64").subarray(0, 33).toString("base64") }],
  ["wrong signature", { mimeType: "image/png", data: Buffer.alloc(80).toString("base64") }],
  ["oversized", { mimeType: "image/png", data: "A".repeat(14_000_000) }],
] as const) {
  test(`runtime image validation rejects ${label}`, () => assert.equal(parseInlineImage(inlineData), undefined));
}

for (const response of [null, {}, { candidates: [] }, { candidates: [{ finishReason: "MAX_TOKENS" }] },
  { candidates: [{ finishReason: "STOP", content: { parts: [{ fileData: { fileUri: "https://untrusted/image.png" } }] } }] },
  { candidates: [{ finishReason: "STOP", content: { parts: [{ text: "raw-payload" }] } }] },
  { candidates: [{ finishReason: "STOP", content: { parts: [imageResponse().candidates[0].content.parts[1], imageResponse().candidates[0].content.parts[1]] } }] },
]) test("unexpected provider schema/URL/text/multiple images fails closed", () => assert.throws(() => parseImageProviderResponse(response), ImageProviderError));

test("image API strips client verdict/prompt, checks fresh Critic before generation", async () => {
  const calls: string[] = [];
  const response = await handleImageGeneration(request({ ...INPUT, look: { ...INPUT.look,
    imagePrompt: "private-api-key add invented royal motif", validation: PASS, imageUrl: "old-url" } }), {
    critique: async (look) => {
      calls.push("critic");
      assert.equal("validation" in look, false);
      assert.equal("imageUrl" in look, false);
      assert.doesNotMatch(look.imagePrompt, /private|invented|sourceIds|culturalNote/);
      assert.deepEqual(JSON.parse(look.imagePrompt).items, look.items);
      return PASS;
    },
    generate: async (prompt) => {
      calls.push("image");
      assert.equal(JSON.parse(prompt).garment, INPUT.look.garment);
      return { imageUrl: IMAGE_URL };
    },
  });
  const body = await response.json();
  assert.equal(response.status, 200);
  assert.equal(response.headers.get("cache-control"), "no-store");
  assert.deepEqual(calls, ["critic", "image"]);
  assert.equal(body.data.status, "generated");
  assert.equal(body.data.lookId, INPUT.look.id);
  assert.equal(body.data.imageUrl, IMAGE_URL);
  assert.equal(body.data.fallbackReason, undefined);
  assert.ok(body.data.validationId);
  assert.ok(Number.isFinite(Date.parse(body.data.validatedAt)));
  assert.match(body.data.disclaimer, /minh họa/);
});

for (const reason of ["not_configured", "timeout", "quota", "safety_rejection", "upstream_error", "invalid_image"] as const) {
  test(`image API returns explicit ${reason} fallback with fresh validation`, async () => {
    const response = await handleImageGeneration(request(), { critique: async () => PASS,
      generate: async () => { throw new ImageProviderError(reason); } });
    const body = await response.json();
    assert.equal(response.status, 200);
    assert.equal(body.data.status, "fallback");
    assert.equal(body.data.fallbackReason, reason);
    assert.equal(body.data.imageUrl, undefined);
    assert.deepEqual(body.data.validation, PASS);
  });
}

test("image API rejects invalid image URLs even from a provider adapter", async () => {
  const response = await handleImageGeneration(request(), { critique: async () => PASS,
    generate: async () => ({ imageUrl: "javascript:private-api-key" }) });
  const body = await response.json();
  assert.equal(body.data.fallbackReason, "invalid_image");
  assert.doesNotMatch(JSON.stringify(body), /private-api-key/);
});

for (const [error, status] of [[new GeminiRequestError("timeout"), 504], [new GeminiRequestError("upstream"), 502],
  [new GeminiConfigurationError("private-api-key"), 503], [new CriticOutputError("raw-payload"), 502]] as const) {
  test("Critic failure is a failure envelope and never starts image generation", async () => {
    const response = await handleImageGeneration(request(), { critique: async () => { throw error; },
      generate: async () => { throw new Error("must not run"); } });
    const body = await response.json();
    assert.equal(response.status, status);
    assert.equal(body.success, false);
    assert.equal(body.data, undefined);
    assert.doesNotMatch(JSON.stringify(body), /private-api-key|raw-payload/);
  });
}

test("image API rejects forged source and invalid fresh verdict before provider", async () => {
  for (const [body, verdict, code] of [
    [{ ...INPUT, look: { ...INPUT.look, sourceIds: ["INVENTED"] } }, PASS, "INVALID_LOOK_SOURCE"],
    [INPUT, { status: "warning", warnings: [] }, "INVALID_MODEL_OUTPUT"],
  ] as const) {
    let generated = false;
    const response = await handleImageGeneration(request(body), {
      critique: async () => verdict as typeof PASS,
      generate: async () => { generated = true; return { imageUrl: IMAGE_URL }; },
    });
    assert.equal((await response.json()).error.code, code);
    assert.equal(generated, false);
  }
});

test("image API rejects malformed JSON and schema/credential/prompt injection", async () => {
  assert.equal((await handleImageGeneration(new Request("http://localhost", { method: "POST", body: "{" }))).status, 400);
  for (const body of [[], {}, { ...INPUT, apiKey: "private" }, { ...INPUT, imagePrompt: "invented" }]) {
    const response = await handleImageGeneration(request(body), { critique: async () => { throw new Error("must not run"); }, generate: async () => { throw new Error("must not run"); } });
    assert.equal(response.status, 422);
  }
});
