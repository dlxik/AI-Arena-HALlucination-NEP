import assert from "node:assert/strict";
import test from "node:test";
import { loadCulturalKnowledgeBase } from "../../src/lib/cultural/loader";
import { CulturalContextNotFoundError } from "../../src/lib/cultural/retrieval";
import { CulturalRulesNotFoundError, LookSourceError, retrieveCulturalRules } from "../../src/lib/cultural/rule-retrieval";
import { criticCases, makeCriticInput } from "../fixtures/critic-cases";

test("Critic retrieval keeps every eligible rule and same-garment provenance for each garment", () => {
  for (const testCase of criticCases) {
    const { look } = makeCriticInput(testCase);
    const context = retrieveCulturalRules(look);
    const kb = loadCulturalKnowledgeBase();
    assert.ok(context.rules.length > 0);
    assert.deepEqual(context.rules.map(({ id }) => id).sort(), kb.records.filter((rule) =>
      rule.garment === look.garment && rule.reviewed && rule.verification_status === "verified")
      .map(({ id }) => id).sort());
    for (const rule of context.rules) {
      assert.equal(rule.garment, look.garment);
      for (const id of rule.source_ids) assert.ok(context.sources.some((source) =>
        source.id === id && source.status === "approved" && source.garment_ids.includes(look.garment)));
    }
  }
});

test("photoshoot retrieval retains festival context rule to detect universal ensemble claims", () => {
  const context = retrieveCulturalRules(makeCriticInput(criticCases[5]).look);
  assert.ok(context.rules.some(({ id }) => id === "ATT_CONTEXT_KINH_BAC_FESTIVAL"));
});

for (const downgrade of ["unreviewed", "unverified", "unapproved-source", "wrong-garment-source"] as const) {
  test(`Critic retrieval excludes ${downgrade} rules and fails closed when none remain`, () => {
    const kb = structuredClone(loadCulturalKnowledgeBase());
    const look = makeCriticInput().look;
    if (downgrade === "unreviewed" || downgrade === "unverified") {
      kb.records.forEach((rule) => {
        if (rule.garment === look.garment) {
          if (downgrade === "unreviewed") rule.reviewed = false;
          else rule.verification_status = "needs_review";
        }
      });
      assert.throws(() => retrieveCulturalRules(look, kb), CulturalRulesNotFoundError);
    } else {
      kb.sources.forEach((source) => {
        if (source.garment_ids.includes(look.garment)) {
          if (downgrade === "unapproved-source") source.status = "needs_review";
          else source.garment_ids = ["nhat_binh"];
        }
      });
      assert.throws(() => retrieveCulturalRules(look, kb), CulturalContextNotFoundError);
    }
  });
}

test("a record with even one unapproved linked source is excluded", () => {
  const kb = structuredClone(loadCulturalKnowledgeBase());
  const look = makeCriticInput().look;
  const rule = kb.records.find((record) => record.garment === look.garment)!;
  rule.source_ids.push(kb.sources.find(({ status }) => status === "needs_review")!.id);
  assert.ok(!retrieveCulturalRules(look, kb).rules.some(({ id }) => id === rule.id));
});

test("Critic retrieval rejects invented and cross-garment look sources", () => {
  for (const sourceId of ["INVENTED_SOURCE", "VHNT_NHAT_BINH_MOTIF_2025"]) {
    assert.throws(() => retrieveCulturalRules({ ...makeCriticInput().look, sourceIds: [sourceId] }), LookSourceError);
  }
});
