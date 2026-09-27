import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_CULTURAL_RECORDS,
  MAX_CULTURAL_SOURCES,
  retrieveCulturalContext,
} from "../../src/lib/cultural/retrieval";
import type { RecommendationInput } from "../../src/types/api";

const BASE_INPUT: RecommendationInput = {
  occasion: "cultural_visit",
  garment: "ao_ngu_than",
  style: "minimal",
  colors: ["pastel_blue"],
  remixLevel: 40,
};

test("retrieval keeps explicit garment context relevant and advisory", () => {
  const context = retrieveCulturalContext(BASE_INPUT);

  assert.deepEqual(
    context.garmentCandidates.map(({ garment }) => garment.id),
    ["ao_ngu_than"],
  );
  assert.ok(context.records.length > 0);
  assert.ok(
    context.records.every(
      (record) =>
        record.garment === "ao_ngu_than" &&
        (record.reviewed || record.enforcement === "advisory"),
    ),
  );
  assert.ok(
    context.sources.every((source) =>
      source.garment_ids.includes("ao_ngu_than"),
    ),
  );
  assert.ok(context.records.length <= MAX_CULTURAL_RECORDS);
  assert.ok(context.sources.length <= MAX_CULTURAL_SOURCES);
});

test("auto retrieval is deterministic and prioritizes an occasion match", () => {
  const input: RecommendationInput = {
    ...BASE_INPUT,
    occasion: "festival",
    garment: "auto",
  };
  const first = retrieveCulturalContext(input);
  const second = retrieveCulturalContext(input);

  assert.deepEqual(first, second);
  assert.equal(first.garmentCandidates[0].garment.id, "ao_tu_than");
  assert.deepEqual(
    new Set(first.garmentCandidates.map(({ garment }) => garment.id)),
    new Set(["ao_dai", "ao_ngu_than", "ao_tu_than", "nhat_binh"]),
  );

  const candidateIds = new Set(
    first.garmentCandidates.map(({ garment }) => garment.id),
  );
  assert.ok(
    first.sources.every((source) =>
      source.garment_ids.some((garmentId) => candidateIds.has(garmentId)),
    ),
  );
});

test("retrieval excludes an occasion record outside its declared garment occasion", () => {
  const context = retrieveCulturalContext({
    ...BASE_INPUT,
    garment: "ao_tu_than",
  });

  assert.ok(
    !context.records.some(
      (record) => record.id === "ATT_CONTEXT_KINH_BAC_FESTIVAL",
    ),
  );
  assert.ok(
    context.records.some((record) => record.id === "ATT_STRUCTURE_FOUR_PANELS"),
  );
});
