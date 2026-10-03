import assert from "node:assert/strict";
import test from "node:test";

import { resolveImageUiState, resolveRemixUiState } from "../../src/components/results/ui-state";
import type { OutfitLook } from "../../src/types/outfit";

function createLook(imageUrl?: string, imageFallback?: string): OutfitLook {
  return {
    id: "ui-state-look",
    name: "UI state look",
    garment: "ao_dai",
    style: "elegant",
    palette: ["soft_white"],
    items: ["Áo dài"],
    accessories: [],
    reason: "Test state.",
    culturalNote: "Test state.",
    sourceIds: ["VNMH_AO_DAI_2015"],
    validation: {
      status: "pass",
      warnings: [],
    },
    imagePrompt: "Test image prompt.",
    imageUrl,
    imageFallback,
  };
}

test("resolveImageUiState prioritizing has_image when imageUrl is present", () => {
  const look = createLook("http://example.com/image.png");
  assert.equal(resolveImageUiState(look, true), "has_image");
  assert.equal(resolveImageUiState(look, false), "has_image");
});

test("resolveImageUiState prioritizing generating when isGenerating is true", () => {
  const look = createLook(undefined, "fallback reason");
  assert.equal(resolveImageUiState(look, true), "generating");
});

test("resolveImageUiState returning fallback when imageFallback is present and not generating", () => {
  const look = createLook(undefined, "fallback reason");
  assert.equal(resolveImageUiState(look, false), "fallback");
});

test("resolveImageUiState returning pending when no image, no fallback, and not generating", () => {
  const look = createLook();
  assert.equal(resolveImageUiState(look, false), "pending");
});

test("resolveRemixUiState returns correct state based on flags", () => {
  assert.equal(resolveRemixUiState(false, false, false), "idle");
  assert.equal(resolveRemixUiState(true, false, false), "editing");
  assert.equal(resolveRemixUiState(true, true, false), "revalidating");
  assert.equal(resolveRemixUiState(true, false, true), "regenerating_image");
  assert.equal(resolveRemixUiState(false, true, true), "revalidating"); // revalidating takes precedence
});
