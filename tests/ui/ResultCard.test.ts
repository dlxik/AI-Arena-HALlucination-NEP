import assert from "node:assert/strict";
import test from "node:test";

import {
  needsIndependentValidation,
  resolveValidationUiState,
} from "../../src/components/results/validation-state";
import type { OutfitLook } from "../../src/types/outfit";

function createLook(
  status: OutfitLook["validation"]["status"],
  ruleId?: string,
): OutfitLook {
  return {
    id: "ui-state-look",
    name: "UI state look",
    garment: "ao_dai",
    style: "elegant",
    palette: ["soft_white"],
    items: ["Áo dài"],
    accessories: [],
    reason: "Test validation UI state.",
    culturalNote: "Test cultural note.",
    sourceIds: ["VNMH_AO_DAI_2015"],
    validation: {
      status,
      warnings: ruleId
        ? [
            {
              ruleId,
              severity: "medium",
              reason: "Test warning.",
              suggestedFix: "Test fix.",
            },
          ]
        : [],
    },
    imagePrompt: "Test image prompt.",
  };
}

test("validation UI exposes pass, warning and revise states", () => {
  for (const status of ["pass", "warning", "revise"] as const) {
    assert.equal(resolveValidationUiState(createLook(status), false, false), status);
  }
});

test("validation UI prioritizes loading and actionable error states", () => {
  const look = createLook("warning", "AD_WARNING_SINGLE_FORM_GENERALIZATION");
  assert.equal(resolveValidationUiState(look, true, true), "validating");
  assert.equal(resolveValidationUiState(look, false, true), "error");
});

test("only pending fixture warnings trigger independent validation", () => {
  assert.equal(
    needsIndependentValidation(createLook("warning", "CULTURAL_CRITIC_PENDING")),
    true,
  );
  assert.equal(
    needsIndependentValidation(createLook("warning", "SOURCE_REVIEW_REQUIRED")),
    true,
  );
  assert.equal(
    needsIndependentValidation(
      createLook("warning", "AD_WARNING_SINGLE_FORM_GENERALIZATION"),
    ),
    false,
  );
  assert.equal(needsIndependentValidation(createLook("pass")), false);
});
