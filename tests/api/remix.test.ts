import assert from "node:assert/strict";
import test from "node:test";
import { handleRemix } from "../../src/app/api/remix/route";
import { imageAfterValidation } from "../../src/lib/gemini/image-orchestration";
import { GeminiRequestError } from "../../src/lib/gemini/client";
import { ImageProviderError } from "../../src/lib/gemini/image-generator";
import { criticCases, makeCriticInput } from "../fixtures/critic-cases";
import { IMAGE_URL } from "../fixtures/image";

const PASS = { status: "pass" as const, warnings: [] };
const INPUT = makeCriticInput(criticCases[6]);
const WARNING = { status: "warning" as const, warnings: [{
  ruleId: "NB_WARNING_ARTIFACT_MOTIF_GENERALIZATION", severity: "medium" as const,
  reason: "Phụ kiện mới gán họa tiết hiện vật cho toàn bộ phẩm cấp mà không có nguồn.",
  suggestedFix: "Bỏ claim phẩm cấp và không khái quát họa tiết từ một hiện vật.",
}] };
function request(body: unknown = { ...INPUT, changes: { palette: ["soft_pink"] } }) {
  return new Request("http://localhost/api/remix", { method: "POST", body: JSON.stringify(body) });
}

test("remix changes whitelist fields, preserves provenance and checks before regenerating", async () => {
  const original = { ...INPUT, look: { ...INPUT.look, validation: PASS, imageUrl: "old-image" },
    changes: { palette: ["soft_pink"], accessories: ["Quạt trơn"] } };
  const snapshot = structuredClone(original);
  let checkedPrompt = "";
  const calls: string[] = [];
  const response = await handleRemix(request(original), {
    critique: async (look, input) => {
      calls.push("critic");
      assert.equal("validation" in look, false);
      assert.equal("imageUrl" in look, false);
      assert.notEqual(look.id, original.look.id);
      assert.deepEqual(look.palette, ["soft_pink"]);
      assert.deepEqual(look.accessories, ["Quạt trơn"]);
      assert.deepEqual(look.items, original.look.items);
      assert.deepEqual(look.sourceIds, original.look.sourceIds);
      assert.equal(look.garment, original.look.garment);
      assert.equal(look.culturalNote, original.look.culturalNote);
      assert.deepEqual(input.colors, ["soft_pink"]);
      assert.equal(input.occasion, original.recommendationInput.occasion);
      assert.equal(input.remixLevel, original.recommendationInput.remixLevel);
      checkedPrompt = look.imagePrompt;
      return PASS;
    },
    generate: async (prompt) => { calls.push("image"); assert.equal(prompt, checkedPrompt); return { imageUrl: IMAGE_URL }; },
  });
  assert.equal(response.status, 200);
  const { data } = await response.json();
  assert.deepEqual(calls, ["critic", "image"]);
  assert.deepEqual(original, snapshot);
  assert.equal(data.parentLookId, original.look.id);
  assert.equal(data.image.lookId, data.look.id);
  assert.equal(data.image.status, "generated");
  assert.equal(data.look.imageUrl, IMAGE_URL);
  assert.deepEqual(data.look.validation, PASS);
  assert.ok(data.validationId);
});

test("risky new accessory gets fresh warning; client pass cannot override it", async () => {
  const accessory = "Hoa văn hiện vật này xác thực mọi phẩm cấp cung đình";
  const response = await handleRemix(request({ ...INPUT, look: { ...INPUT.look, validation: PASS }, changes: { accessories: [accessory] } }), {
    critique: async (look) => { assert.ok(look.accessories.includes(accessory)); assert.ok(look.imagePrompt.includes(accessory)); return WARNING; },
    generate: async () => ({ imageUrl: IMAGE_URL }),
  });
  const { data } = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(data.validation, WARNING);
  assert.deepEqual(data.look.validation, WARNING);
  assert.equal(data.image.status, "generated");
});

test("remix executions always invoke Critic again and get new validation IDs", async () => {
  let checks = 0;
  const deps = { critique: async () => { checks++; return PASS; }, generate: async () => ({ imageUrl: IMAGE_URL }) };
  const first = (await (await handleRemix(request(), deps)).json()).data;
  const second = (await (await handleRemix(request(), deps)).json()).data;
  assert.equal(checks, 2);
  assert.notEqual(first.look.id, second.look.id);
  assert.notEqual(first.validationId, second.validationId);
  assert.ok(Number.isFinite(Date.parse(first.validatedAt)));
  assert.ok(Number.isFinite(Date.parse(second.validatedAt)));
});

test("revise gate skips image generation without altering cultural enforcement", async () => {
  let called = false;
  const image = await imageAfterValidation(INPUT.look, { validation: { status: "revise", warnings: [{
    ...WARNING.warnings[0], severity: "high",
  }] }, validationId: "fresh", validatedAt: new Date().toISOString() }, {
    critique: async () => { throw new Error("already checked"); },
    generate: async () => { called = true; return { imageUrl: IMAGE_URL }; },
  });
  assert.equal(called, false);
  assert.deepEqual(image, { lookId: INPUT.look.id, status: "fallback", fallbackReason: "cultural_revision_required" });
});

test("remix image failure keeps fresh look text and validation, removes stale image", async () => {
  const response = await handleRemix(request({ ...INPUT, look: { ...INPUT.look, imageUrl: "old-image", validation: PASS }, changes: { accessories: ["Quạt trơn"] } }), {
    critique: async () => WARNING,
    generate: async () => { throw new ImageProviderError("safety_rejection"); },
  });
  const { data } = await response.json();
  assert.equal(response.status, 200);
  assert.deepEqual(data.look.validation, WARNING);
  assert.equal(data.look.imageUrl, undefined);
  assert.deepEqual(data.look.items, INPUT.look.items);
  assert.equal(data.image.status, "fallback");
  assert.equal(data.image.fallbackReason, "safety_rejection");
});

test("Critic error leaves original untouched and has no partial/fake remix success", async () => {
  const snapshot = structuredClone(INPUT);
  let generated = false;
  const response = await handleRemix(request(), { critique: async () => { throw new GeminiRequestError("timeout"); },
    generate: async () => { generated = true; return { imageUrl: IMAGE_URL }; } });
  assert.equal(response.status, 504);
  const body = await response.json();
  assert.equal(body.success, false);
  assert.equal(body.data, undefined);
  assert.equal(generated, false);
  assert.deepEqual(INPUT, snapshot);
});

for (const [label, changes] of [
  ["empty", {}], ["no-op", { palette: INPUT.look.palette }], ["structure", { items: ["Three buttons"] }],
  ["garment", { garment: "ao_dai" }], ["source", { sourceIds: ["INVENTED"] }], ["claim", { culturalNote: "rank" }],
  ["prompt", { imagePrompt: "royal motif" }], ["level", { remixLevel: 100 }], ["null colors", { palette: null }],
  ["empty colors", { palette: [] }], ["duplicate colors", { palette: ["pink", "pink"] }],
  ["unknown format", { palette: ["Soft Pink"] }], ["too many colors", { palette: ["a", "b", "c", "d", "e"] }],
  ["long color", { palette: ["a".repeat(65)] }], ["empty accessory", { accessories: ["  "] }],
  ["duplicate accessories", { accessories: [" Quạt ", "Quạt"] }], ["long accessory", { accessories: ["a".repeat(201)] }],
  ["too many accessories", { accessories: ["a", "b", "c", "d", "e", "f", "g"] }],
] as const) {
  test(`remix rejects ${label} before calling models`, async () => {
    const response = await handleRemix(request({ ...INPUT, changes }), {
      critique: async () => { throw new Error("must not run"); }, generate: async () => { throw new Error("must not run"); },
    });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error.code, "INVALID_INPUT");
  });
}

test("remix supports clearing accessories and preserves original colors", async () => {
  const response = await handleRemix(request({ ...INPUT, look: { ...INPUT.look, accessories: ["Quạt trơn"] }, changes: { accessories: [] } }), {
    critique: async (look, input) => { assert.deepEqual(look.accessories, []); assert.deepEqual(input.colors, INPUT.recommendationInput.colors); return PASS; },
    generate: async () => ({ imageUrl: IMAGE_URL }),
  });
  assert.equal(response.status, 200);
});

test("remix rejects malformed JSON and invalid/unapproved provenance", async () => {
  assert.equal((await handleRemix(new Request("http://localhost", { method: "POST", body: "{" }))).status, 400);
  let called = false;
  const response = await handleRemix(request({ ...INPUT, look: { ...INPUT.look, sourceIds: ["INVENTED"] }, changes: { palette: ["pink"] } }), {
    critique: async () => { called = true; return PASS; }, generate: async () => ({ imageUrl: IMAGE_URL }),
  });
  assert.equal((await response.json()).error.code, "INVALID_LOOK_SOURCE");
  assert.equal(called, false);
});
