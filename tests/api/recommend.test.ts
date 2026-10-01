import assert from "node:assert/strict";
import test from "node:test";
import {
  handleRecommendation,
  type RecommendationHandlerDependencies,
} from "../../src/app/api/recommend/route";
import { retrieveCulturalContext } from "../../src/lib/cultural/retrieval";
import { GeminiRequestError } from "../../src/lib/gemini/client";
import {
  recommendWithGemini,
  StylistOutputError,
} from "../../src/lib/gemini/stylist";
import { loadCulturalKnowledgeBase } from "../../src/lib/cultural/loader";
import { PENDING_CRITIC_WARNING } from "../../src/lib/validation/recommendation-output";
import { critiqueWithGemini, CriticOutputError } from "../../src/lib/gemini/critic";
import type {
  RecommendationInput,
  RecommendationOutput,
} from "../../src/types/api";

const INPUT: RecommendationInput = {
  occasion: "cultural_visit",
  garment: "ao_ngu_than",
  style: "minimal",
  colors: ["pastel_blue", "soft_white"],
  remixLevel: 40,
  description: "Đi Văn Miếu với phong cách tối giản.",
};

function makeOutput(): RecommendationOutput {
  return {
    looks: [1, 2, 3].map((index) => ({
      id: `look-${index}`,
      name: `Bản phối ${index}`,
      garment: "ao_ngu_than",
      style: "minimal",
      palette: ["pastel_blue", `accent_${index}`],
      items: [`Áo ngũ thân phương án ${index}`, "Quần dài trơn"],
      accessories: [`Phụ kiện tiết chế ${index}`],
      reason: `Phương án ${index} bám phong cách tối giản và dịp tham quan văn hóa.`,
      culturalNote:
        "Nguồn bảo tàng mô tả một nhóm hiện vật áo ngũ thân tay chẽn trong phạm vi cụ thể.",
      sourceIds: ["VNMH_AO_NGU_THAN_2021"],
      validation: {
        status: "warning",
        warnings: [{ ...PENDING_CRITIC_WARNING }],
      },
      imagePrompt: `Vietnamese outfit concept ${index}, pastel blue, minimal styling`,
    })),
  };
}

function request(body: unknown = INPUT): Request {
  return new Request("http://localhost/api/recommend", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

function dependencies(
  recommend: RecommendationHandlerDependencies["recommend"],
): RecommendationHandlerDependencies {
  return {
    retrieve: retrieveCulturalContext, recommend,
    critique: async (look, input) => critiqueWithGemini(look, input, async () =>
      JSON.stringify({ status: "pass", warnings: [] })),
  };
}

test("Gemini Stylist receives grounded context and returns three validated looks", async () => {
  const context = retrieveCulturalContext(INPUT);
  const expected = makeOutput();

  const result = await recommendWithGemini(
    INPUT,
    context,
    async ({ input, maxOutputTokens, responseSchema, systemInstruction }) => {
      assert.match(systemInstruction, /Security boundary/);
      assert.match(systemInstruction, /CULTURAL_CRITIC_PENDING/);
      assert.match(input, /culturalContext/);
      assert.match(input, /VNMH_AO_NGU_THAN_2021/);
      assert.equal(maxOutputTokens, 4_096);

      const looksSchema = (responseSchema.properties as Record<string, unknown>)
        .looks as Record<string, unknown>;
      assert.equal(looksSchema.minItems, 3);
      assert.equal(looksSchema.maxItems, 3);
      return JSON.stringify(expected);
    },
  );

  assert.deepEqual(result, expected);
});

test("Gemini Stylist rejects an invented source ID", async () => {
  const context = retrieveCulturalContext(INPUT);
  const invalid = makeOutput();
  invalid.looks[0].sourceIds = ["MADE_UP_SOURCE"];

  await assert.rejects(
    recommendWithGemini(INPUT, context, async () => JSON.stringify(invalid)),
    StylistOutputError,
  );
});

test("Gemini Stylist rejects output with fewer than three looks", async () => {
  const context = retrieveCulturalContext(INPUT);
  const invalid = makeOutput();
  invalid.looks.pop();

  await assert.rejects(
    recommendWithGemini(INPUT, context, async () => JSON.stringify(invalid)),
    /exactly 3 looks/,
  );
});

test("recommend route returns a successful envelope", async () => {
  const expected = makeOutput();
  const response = await handleRecommendation(
    request(),
    dependencies(async (_input, context) => {
      assert.deepEqual(
        context.garmentCandidates.map(({ garment }) => garment.id),
        ["ao_ngu_than"],
      );
      return expected;
    }),
  );

  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { success: true, data: {
    looks: expected.looks.map((look) => ({ ...look, validation: { status: "pass", warnings: [] } })),
  } });
});

test("recommend route keeps frontend response invariants", async () => {
  const response = await handleRecommendation(
    request(),
    dependencies(async () => makeOutput()),
  );
  const body = await response.json();

  assert.equal(body.success, true);
  assert.equal(body.data.looks.length, 3);
  assert.equal(new Set(body.data.looks.map((look: { id: string }) => look.id)).size, 3);
  for (const look of body.data.looks) {
    assert.ok(["pass", "warning", "revise"].includes(look.validation.status));
    assert.equal(typeof look.imagePrompt, "string");
  }
});

test("recommend route accepts garment auto with grounded candidates", async () => {
  const response = await handleRecommendation(
    request({ ...INPUT, garment: "auto" }),
    dependencies(async (_input, context) => {
      assert.equal(context.garmentCandidates.length, 4);
      return makeOutput();
    }),
  );

  assert.equal(response.status, 200);
});

for (const [label, invalidInput] of [
  ["missing required fields", {}],
  ["missing occasion", { ...INPUT, occasion: undefined }],
  ["colors is not an array", { ...INPUT, colors: "pastel_blue" }],
  ["remixLevel is below zero", { ...INPUT, remixLevel: -1 }],
  ["remixLevel is above one hundred", { ...INPUT, remixLevel: 101 }],
] as const) {
  test(`recommend route returns 422 when ${label}`, async () => {
    const response = await handleRecommendation(
      request(invalidInput),
      dependencies(async () => makeOutput()),
    );

    assert.equal(response.status, 422);
    assert.equal((await response.json()).error.code, "INVALID_INPUT");
  });
}

test("recommend route returns 400 for invalid JSON", async () => {
  const response = await handleRecommendation(
    new Request("http://localhost/api/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{",
    }),
    dependencies(async () => makeOutput()),
  );

  assert.equal(response.status, 400);
  assert.equal((await response.json()).error.code, "INVALID_JSON");
});

test("recommend route returns 422 for unsupported input IDs", async () => {
  const response = await handleRecommendation(
    request({ ...INPUT, garment: "invented_garment" }),
    dependencies(async () => makeOutput()),
  );

  assert.equal(response.status, 422);
  assert.equal((await response.json()).error.code, "INVALID_INPUT");
});

test("recommend route returns 422 when no approved context exists", async () => {
  const blockedKnowledgeBase = structuredClone(loadCulturalKnowledgeBase());
  blockedKnowledgeBase.garments = blockedKnowledgeBase.garments.map(
    (garment) => ({ ...garment, status: "needs_review" as const }),
  );
  const response = await handleRecommendation(request(), {
    retrieve: (input) => retrieveCulturalContext(input, blockedKnowledgeBase),
    recommend: async () => makeOutput(),
    critique: dependencies(async () => makeOutput()).critique,
  });

  assert.equal(response.status, 422);
  assert.equal((await response.json()).error.code, "NO_CULTURAL_CONTEXT");
});

test("recommend route returns 503 when the Gemini key is missing", async () => {
  const previousKey = process.env.GEMINI_API_KEY;
  delete process.env.GEMINI_API_KEY;

  try {
    const response = await handleRecommendation(
      request(),
      dependencies(recommendWithGemini),
    );
    assert.equal(response.status, 503);
    assert.equal((await response.json()).error.code, "GEMINI_NOT_CONFIGURED");
  } finally {
    if (previousKey === undefined) {
      delete process.env.GEMINI_API_KEY;
    } else {
      process.env.GEMINI_API_KEY = previousKey;
    }
  }
});

test("recommend route maps invalid model output to 502", async () => {
  const response = await handleRecommendation(
    request(),
    dependencies(async () => {
      throw new StylistOutputError("raw validation detail");
    }),
  );

  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.error.code, "INVALID_MODEL_OUTPUT");
  assert.doesNotMatch(body.error.message, /raw validation detail/);
});

test("recommend route maps upstream failures to a safe 502 envelope", async () => {
  const response = await handleRecommendation(
    request(),
    dependencies(async () => {
      throw new GeminiRequestError("upstream", 401);
    }),
  );

  const body = await response.json();
  assert.equal(response.status, 502);
  assert.equal(body.error.code, "GEMINI_UPSTREAM_ERROR");
  assert.doesNotMatch(JSON.stringify(body), /401/);
});

test("recommend route maps Gemini timeouts to 504", async () => {
  const response = await handleRecommendation(
    request(),
    dependencies(async () => {
      throw new GeminiRequestError("timeout");
    }),
  );

  assert.equal(response.status, 504);
  assert.equal((await response.json()).error.code, "GEMINI_TIMEOUT");
});

test("recommend pipeline runs independent Critic on all three looks and replaces pending", async () => {
  const seen: string[] = [];
  const deps = dependencies(async () => makeOutput());
  const originalCritique = deps.critique;
  deps.critique = async (look, input) => {
    seen.push(look.id);
    return originalCritique(look, input);
  };
  const response = await handleRecommendation(request(), deps);
  assert.equal(response.status, 200);
  assert.deepEqual(seen.sort(), ["look-1", "look-2", "look-3"]);
  const result = await response.json();
  assert.doesNotMatch(JSON.stringify(result), /CULTURAL_CRITIC_PENDING/);
});

for (const [label, error, code, status] of [
  ["invalid output", new CriticOutputError("private model detail"), "INVALID_MODEL_OUTPUT", 502],
  ["timeout", new GeminiRequestError("timeout"), "GEMINI_TIMEOUT", 504],
] as const) {
  test(`recommend does not return partial or pending results on Critic ${label}`, async () => {
    const deps = dependencies(async () => makeOutput());
    deps.critique = async (look) => {
      if (look.id === "look-2") throw error;
      return { status: "pass", warnings: [] };
    };
    const response = await handleRecommendation(request(), deps);
    const body = await response.json();
    assert.equal(response.status, status);
    assert.equal(body.error.code, code);
    assert.equal(body.data, undefined);
    assert.doesNotMatch(JSON.stringify(body), /private model detail|CULTURAL_CRITIC_PENDING/);
  });
}
