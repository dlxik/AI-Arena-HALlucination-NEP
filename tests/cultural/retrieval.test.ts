import assert from "node:assert/strict";
import test from "node:test";
import {
  CulturalContextNotFoundError,
  MAX_CULTURAL_RECORDS,
  MAX_CULTURAL_SOURCES,
  retrieveCulturalContext,
} from "../../src/lib/cultural/retrieval";
import { loadCulturalKnowledgeBase } from "../../src/lib/cultural/loader";
import type { RecommendationInput } from "../../src/types/api";

const BASE_INPUT: RecommendationInput = {
  occasion: "cultural_visit",
  garment: "ao_ngu_than",
  style: "minimal",
  colors: ["pastel_blue"],
  remixLevel: 40,
};

function knowledgeBaseSnapshot() {
  return structuredClone(loadCulturalKnowledgeBase());
}

test("repository data provides approved cultural context", () => {
  const context = retrieveCulturalContext(BASE_INPUT);
  assert.deepEqual(
    context.garmentCandidates.map(({ garment }) => garment.id),
    ["ao_ngu_than"],
  );
  assert.ok(context.records.length > 0);
  assert.ok(context.sources.length > 0);
});

test("retrieval keeps approved explicit garment context relevant", () => {
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
        record.reviewed &&
        record.verification_status === "verified",
    ),
  );
  assert.ok(
    context.garmentCandidates.every(
      ({ garment }) => garment.status === "approved",
    ),
  );
  assert.ok(
    context.sources.every((source) =>
      source.status === "approved" &&
      source.garment_ids.includes("ao_ngu_than"),
    ),
  );
  assert.deepEqual(context.policy.eligibleGarmentStatuses, ["approved"]);
  assert.deepEqual(context.policy.eligibleSourceStatuses, ["approved"]);
  assert.equal(context.policy.requiredRecordVerificationStatus, "verified");
  assert.equal(context.policy.requireReviewedRecords, true);
  assert.ok(context.records.length <= MAX_CULTURAL_RECORDS);
  assert.ok(context.sources.length <= MAX_CULTURAL_SOURCES);
});

test("retrieval excludes unverified records from otherwise approved context", () => {
  const knowledgeBase = knowledgeBaseSnapshot();
  knowledgeBase.records = knowledgeBase.records.map((record) => ({
    ...record,
    verification_status: "needs_review",
    reviewed: false,
  }));

  const context = retrieveCulturalContext(BASE_INPUT, knowledgeBase);
  assert.deepEqual(context.records, []);
  assert.ok(context.sources.length > 0);
});

test("retrieval rejects a garment whose only source is not approved", () => {
  const knowledgeBase = knowledgeBaseSnapshot();
  knowledgeBase.sources = knowledgeBase.sources.map((source) =>
    source.id === "VNMH_AO_NGU_THAN_2021"
      ? { ...source, status: "needs_review" }
      : source,
  );

  assert.throws(
    () => retrieveCulturalContext(BASE_INPUT, knowledgeBase),
    CulturalContextNotFoundError,
  );
});

test("retrieval rejects a garment that is still awaiting review", () => {
  const knowledgeBase = knowledgeBaseSnapshot();
  knowledgeBase.garments = knowledgeBase.garments.map((garment) =>
    garment.id === "ao_ngu_than"
      ? { ...garment, status: "needs_review" }
      : garment,
  );

  assert.throws(
    () => retrieveCulturalContext(BASE_INPUT, knowledgeBase),
    CulturalContextNotFoundError,
  );
});

test("auto retrieval is deterministic and prioritizes an occasion match", () => {
  const input: RecommendationInput = {
    ...BASE_INPUT,
    occasion: "festival",
    garment: "auto",
  };
  const knowledgeBase = knowledgeBaseSnapshot();
  const first = retrieveCulturalContext(input, knowledgeBase);
  const second = retrieveCulturalContext(input, knowledgeBase);

  assert.deepEqual(first, second);
  assert.ok(
    first.garmentCandidates[0].garment.compatible_occasions.includes("festival"),
    "The highest-ranked auto candidate must match the requested occasion.",
  );
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
