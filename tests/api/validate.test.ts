import assert from "node:assert/strict";
import test from "node:test";
import { handleValidation } from "../../src/app/api/validate/route";
import { CulturalDataError, loadCulturalKnowledgeBase } from "../../src/lib/cultural/loader";
import { retrieveCulturalRules } from "../../src/lib/cultural/rule-retrieval";
import { GeminiConfigurationError, GeminiRequestError } from "../../src/lib/gemini/client";
import { CriticOutputError, critiqueWithGemini } from "../../src/lib/gemini/critic";
import { parseCulturalValidation } from "../../src/lib/validation/cultural-validation";
import { criticCases, makeCriticInput } from "../fixtures/critic-cases";

const PASS = { status: "pass", warnings: [] };
const INPUT = makeCriticInput(criticCases[7]);
const WARNING = {
  ruleId: "NB_STRUCTURE_RECTANGULAR_COLLAR", severity: "medium",
  reason: "Look gọi là Nhật Bình nhưng chưa mô tả cổ đối khâm hình chữ nhật.",
  suggestedFix: "Bổ sung mô tả cổ đối khâm hình chữ nhật, cúc cài chính giữa.",
};

function request(body: unknown = INPUT) {
  return new Request("http://localhost/api/validate", {
    method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body),
  });
}

for (const output of [PASS, { status: "warning", warnings: [WARNING] }]) {
  test(`independent Critic returns runtime-validated ${output.status}`, async () => {
    const result = await critiqueWithGemini(INPUT.look, INPUT.recommendationInput,
      async ({ input, responseSchema, systemInstruction }) => {
        assert.match(systemInstruction, /Security boundary and provenance/);
        const payload = JSON.parse(input.split("\n").at(-1)!);
        assert.equal(payload.look.validation, undefined);
        assert.equal(payload.culturalRuleContext.garment.id, "nhat_binh");
        assert.ok(payload.culturalRuleContext.rules.some((rule: { id: string }) => rule.id === WARNING.ruleId));
        assert.ok(responseSchema.properties);
        return JSON.stringify(output);
      });
    assert.deepEqual(result, output);
  });
}

test("hard rule violation can return revise on an isolated KB snapshot", async () => {
  const kb = structuredClone(loadCulturalKnowledgeBase());
  kb.records.find(({ id }) => id === WARNING.ruleId)!.enforcement = "hard";
  const output = { status: "revise", warnings: [{ ...WARNING, severity: "high" }] };
  assert.deepEqual(await critiqueWithGemini(INPUT.look, INPUT.recommendationInput,
    async () => JSON.stringify(output), (look) => retrieveCulturalRules(look, kb)), output);
  assert.equal(loadCulturalKnowledgeBase().records.find(({ id }) => id === WARNING.ruleId)!.enforcement, "advisory");
});

for (const [label, output] of [
  ["invented rule", { status: "warning", warnings: [{ ...WARNING, ruleId: "INVENTED" }] }],
  ["cross-garment rule", { status: "warning", warnings: [{ ...WARNING, ruleId: "ANT_STRUCTURE_FIVE_BUTTONS" }] }],
  ["missing fix", { status: "revise", warnings: [{ ...WARNING, severity: "high", suggestedFix: undefined }] }],
  ["empty reason", { status: "warning", warnings: [{ ...WARNING, reason: "  " }] }],
  ["advisory elevated to revise", { status: "revise", warnings: [{ ...WARNING, severity: "high" }] }],
  ["pass with warnings", { status: "pass", warnings: [WARNING] }],
  ["warning without warnings", { status: "warning", warnings: [] }],
  ["revise without high", { status: "revise", warnings: [WARNING] }],
  ["duplicate rule", { status: "warning", warnings: [WARNING, WARNING] }],
  ["unsupported citation", { status: "warning", warnings: [{ ...WARNING, sourceId: "INVENTED" }] }],
  ["unsupported top-level field", { ...PASS, explanation: "extra" }],
  ["wrong schema", { status: "safe", warnings: "none" }],
  ["null", null],
] as const) {
  test(`Critic rejects ${label}`, async () => {
    await assert.rejects(critiqueWithGemini(INPUT.look, INPUT.recommendationInput,
      async () => JSON.stringify(output)), CriticOutputError);
  });
}

test("Critic rejects non-JSON output", async () => {
  await assert.rejects(critiqueWithGemini(INPUT.look, INPUT.recommendationInput,
    async () => "```json\n{}\n```"), CriticOutputError);
});

test("runtime validation rejects an unreviewed/unapproved rule even if injected into context", () => {
  for (const downgrade of ["unreviewed", "unverified", "source"] as const) {
    const context = structuredClone(retrieveCulturalRules(INPUT.look));
    const rule = context.rules.find(({ id }) => id === WARNING.ruleId)!;
    if (downgrade === "unreviewed") rule.reviewed = false;
    if (downgrade === "unverified") rule.verification_status = "needs_review";
    if (downgrade === "source") context.sources.find(({ id }) => id === rule.source_ids[0])!.status = "needs_review";
    assert.equal(parseCulturalValidation({ status: "warning", warnings: [WARNING] }, context).success, false);
  }
});

test("Nhật Bình RC04 regression has full input and explicit missing-collar warning contract", async () => {
  assert.doesNotMatch([INPUT.look.name, ...INPUT.look.items, INPUT.look.culturalNote, INPUT.look.imagePrompt].join(" "), /đối khâm|rectangular/i);
  const result = await critiqueWithGemini(INPUT.look, INPUT.recommendationInput,
    async ({ systemInstruction }) => {
      assert.match(systemInstruction, /Nhật Bình regression/);
      return JSON.stringify({ status: "warning", warnings: [WARNING] });
    });
  assert.equal(result.status, "warning");
  assert.equal(result.warnings[0].ruleId, WARNING.ruleId);
});

test("validate API returns Critic result and discards client verdict", async () => {
  const response = await handleValidation(request({ ...INPUT, look: { ...INPUT.look, validation: PASS, imageUrl: "client-url" } }), {
    critique: async (look, input) => {
      assert.equal("validation" in look, false);
      assert.equal("imageUrl" in look, false);
      return critiqueWithGemini(look, input, async () => JSON.stringify({ status: "warning", warnings: [WARNING] }));
    },
  });
  assert.equal(response.status, 200);
  assert.equal((await response.json()).data.status, "warning");
});

for (const [label, body] of [
  ["array", []], ["partial look", { ...INPUT, look: { garment: "nhat_binh" } }],
  ["client rules", { ...INPUT, rules: [] }], ["client sources", { ...INPUT, sources: [] }],
  ["unknown look field", { ...INPUT, look: { ...INPUT.look, trusted: true } }],
  ["auto look garment", { ...INPUT, look: { ...INPUT.look, garment: "auto" } }],
  ["context garment mismatch", { ...INPUT, recommendationInput: { ...INPUT.recommendationInput, garment: "ao_dai" } }],
  ["style mismatch", { ...INPUT, look: { ...INPUT.look, style: "street" } }],
  ["palette mismatch", { ...INPUT, look: { ...INPUT.look, palette: ["gold_accent"] } }],
  ["oversized text", { ...INPUT, look: { ...INPUT.look, culturalNote: "a".repeat(1_001) } }],
] as const) {
  test(`validate API rejects ${label} before calling model`, async () => {
    const response = await handleValidation(request(body), { critique: async () => { throw new Error("must not be called"); } });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error.code, "INVALID_INPUT");
  });
}

test("validate API rejects malformed JSON", async () => {
  const response = await handleValidation(new Request("http://localhost/api/validate", { method: "POST", body: "{" }));
  assert.equal(response.status, 400);
});

for (const [label, error, status, code] of [
  ["missing key", new GeminiConfigurationError("private key detail"), 503, "GEMINI_NOT_CONFIGURED"],
  ["timeout", new GeminiRequestError("timeout"), 504, "GEMINI_TIMEOUT"],
  ["upstream", new GeminiRequestError("upstream", 401), 502, "GEMINI_UPSTREAM_ERROR"],
  ["model output", new CriticOutputError("private model detail"), 502, "INVALID_MODEL_OUTPUT"],
  ["data", new CulturalDataError("private data detail"), 500, "CULTURAL_DATA_ERROR"],
  ["internal", new Error("private internal detail"), 500, "INTERNAL_ERROR"],
] as const) {
  test(`validate API safely maps ${label}`, async () => {
    const response = await handleValidation(request(), { critique: async () => { throw error; } });
    const body = await response.json();
    assert.equal(response.status, status);
    assert.equal(body.error.code, code);
    assert.doesNotMatch(JSON.stringify(body), /private|401/);
  });
}

for (const [label, change, code] of [
  ["no rules", "rules", "NO_CULTURAL_RULES"],
  ["no context", "garment", "NO_CULTURAL_CONTEXT"],
  ["invalid source", "source", "INVALID_LOOK_SOURCE"],
] as const) {
  test(`validate API fails closed on ${label}`, async () => {
    const kb = structuredClone(loadCulturalKnowledgeBase());
    const body = structuredClone(INPUT);
    if (change === "rules") kb.records = [];
    if (change === "garment") kb.garments.forEach((garment) => { garment.status = "needs_review"; });
    if (change === "source") body.look.sourceIds = ["INVENTED"];
    const response = await handleValidation(request(body), {
      critique: (look, input) => critiqueWithGemini(look, input,
        async () => { throw new Error("model must not be called"); }, (look) => retrieveCulturalRules(look, kb)),
    });
    assert.equal(response.status, 422);
    assert.equal((await response.json()).error.code, code);
  });
}
