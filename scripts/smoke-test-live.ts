import { loadEnvConfig } from "@next/env";
import assert from "node:assert/strict";
import { POST as parseIntentHandler } from "../src/app/api/parse-intent/route";
import { POST as recommendHandler } from "../src/app/api/recommend/route";
import { POST as validateHandler } from "../src/app/api/validate/route";
import { POST as remixHandler } from "../src/app/api/remix/route";
import { POST as generateImageHandler } from "../src/app/api/generate-image/route";
import { makeCriticInput, criticCases } from "../tests/fixtures/critic-cases";
import type { RecommendationOutput, RemixOutput, ImageGenerationOutput, ValidationOutput, OutfitLook } from "../src/types/api";

loadEnvConfig(process.cwd());

function createRequest(body: unknown): Request {
  return new Request("http://localhost:3000/api", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function smokeTest() {
  console.log("=== LAN ANH TECHNICAL SMOKE TEST ===");
  const results: Record<string, { pass: boolean; details: string; elapsedMs: number }> = {};

  // 1. Parse Intent Endpoint
  {
    console.log("\n[1/5] Testing /api/parse-intent...");
    const start = Date.now();
    const req = createRequest({ description: "áo ngũ thân đi lễ chùa màu xanh nhạt phong cách tối giản" });
    const res = await parseIntentHandler(req);
    const body = (await res.json()) as { success: boolean; data: { garment: string; occasion: string; style: string; colors: string[]; remixLevel: number } };
    const elapsed = Date.now() - start;

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(body.success, true);
    assert.equal(body.data.garment, "ao_ngu_than");
    assert.equal(body.data.occasion, "cultural_visit");
    assert.equal(body.data.style, "minimal");
    assert.ok(Array.isArray(body.data.colors) && body.data.colors.length > 0);
    assert.ok(typeof body.data.remixLevel === "number");

    console.log(`  ✓ parse-intent returned valid intent: garment=${body.data.garment}, occasion=${body.data.occasion}, remixLevel=${body.data.remixLevel} (${elapsed}ms)`);
    results["parse-intent"] = { pass: true, details: `garment=${body.data.garment}, occasion=${body.data.occasion}`, elapsedMs: elapsed };
  }

  // 2. Validate Endpoint (Independent Critic)
  {
    console.log("\n[2/5] Testing /api/validate (Critic)...");
    const testCase = criticCases.find((c) => c.id === "CC_01_AO_DAI_VALID") ?? criticCases[0];
    const criticInput = makeCriticInput(testCase);

    const start = Date.now();
    const req = createRequest(criticInput);
    const res = await validateHandler(req);
    const body = (await res.json()) as { success: boolean; data?: ValidationOutput };
    const elapsed = Date.now() - start;

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(body.success, true);
    assert.ok(body.data);
    const valData = body.data;
    assert.ok(["pass", "warning", "revise"].includes(valData.status));
    assert.ok(Array.isArray(valData.warnings));

    console.log(`  ✓ validate returned status=${valData.status}, warnings=${valData.warnings.length} (${elapsed}ms)`);
    results["validate"] = { pass: true, details: `status=${valData.status}, warnings=${valData.warnings.length}`, elapsedMs: elapsed };
  }

  // 3. Recommend Endpoint (Stylist + Critic pipeline)
  let firstLook: OutfitLook | undefined;
  {
    console.log("\n[3/5] Testing /api/recommend (Stylist + Critic pipeline)...");
    const start = Date.now();
    const req = createRequest({
      occasion: "cultural_visit",
      garment: "ao_ngu_than",
      style: "minimal",
      colors: ["pastel_blue"],
      remixLevel: 40,
    });
    const res = await recommendHandler(req);
    const body = (await res.json()) as { success: boolean; data?: RecommendationOutput };
    const elapsed = Date.now() - start;

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(body.success, true);
    assert.ok(body.data);
    const recData = body.data;
    assert.equal(recData.looks.length, 3, "Expected 3 looks");
    for (const look of recData.looks) {
      assert.ok(look.id);
      assert.ok(look.name);
      assert.equal(look.garment, "ao_ngu_than");
      assert.ok(Array.isArray(look.items) && look.items.length > 0);
      assert.ok(Array.isArray(look.palette) && look.palette.length > 0);
      assert.ok(Array.isArray(look.sourceIds) && look.sourceIds.length > 0);
      assert.ok(look.culturalNote);
      assert.ok(["pass", "warning", "revise"].includes(look.validation.status));
    }
    firstLook = recData.looks[0];
    console.log(`  ✓ recommend returned 3 looks with Critic validation (${elapsed}ms)`);
    results["recommend"] = { pass: true, details: `3 looks generated and validated; first look id=${firstLook.id}`, elapsedMs: elapsed };
  }

  assert.ok(firstLook, "firstLook must be defined");

  // 4. Remix Endpoint (Fresh Critic + Image fallback)
  {
    console.log("\n[4/5] Testing /api/remix...");
    const start = Date.now();
    const req = createRequest({
      look: firstLook,
      recommendationInput: {
        occasion: "cultural_visit",
        garment: "ao_ngu_than",
        style: "minimal",
        colors: ["pastel_blue"],
        remixLevel: 40,
      },
      changes: {
        palette: ["deep_navy", "ivory"],
        accessories: ["guoc_moc"],
      },
    });
    const res = await remixHandler(req);
    const body = (await res.json()) as { success: boolean; data?: RemixOutput };
    const elapsed = Date.now() - start;

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(body.success, true);
    assert.ok(body.data);
    const remixData = body.data;
    assert.notEqual(remixData.look.id, firstLook.id, "Remix look ID must be fresh");
    assert.equal(remixData.parentLookId, firstLook.id, "Parent look ID must match original");
    assert.deepEqual(remixData.look.palette, ["deep_navy", "ivory"]);
    assert.deepEqual(remixData.look.accessories, ["guoc_moc"]);
    assert.ok(remixData.validationId, "Fresh validationId required");
    assert.ok(remixData.validatedAt, "Fresh validatedAt required");
    assert.ok(remixData.image, "Image object required");
    assert.equal(remixData.image.status, "fallback", "Image should fallback because GEMINI_IMAGE_MODEL not configured");
    assert.equal(remixData.image.fallbackReason, "not_configured");
    assert.ok(remixData.disclaimer, "Disclaimer required");

    console.log(`  ✓ remix returned fresh look=${remixData.look.id}, validationId=${remixData.validationId}, image=${remixData.image.status}/${remixData.image.fallbackReason ?? "none"} (${elapsed}ms)`);
    results["remix"] = { pass: true, details: `fresh look=${remixData.look.id}, image=${remixData.image.status}/${remixData.image.fallbackReason ?? "none"}`, elapsedMs: elapsed };
  }

  // 5. Generate Image Endpoint (explicit fallback check)
  {
    console.log("\n[5/5] Testing /api/generate-image (explicit fallback)...");
    const start = Date.now();
    const req = createRequest({
      look: firstLook,
      recommendationInput: {
        occasion: "cultural_visit",
        garment: "ao_ngu_than",
        style: "minimal",
        colors: ["pastel_blue"],
        remixLevel: 40,
      },
    });
    const res = await generateImageHandler(req);
    const body = (await res.json()) as { success: boolean; data?: ImageGenerationOutput };
    const elapsed = Date.now() - start;

    assert.equal(res.status, 200, `Expected 200, got ${res.status}`);
    assert.equal(body.success, true);
    assert.ok(body.data);
    const imgData = body.data;
    assert.equal(imgData.status, "fallback");
    assert.equal(imgData.fallbackReason, "not_configured");
    assert.ok(imgData.disclaimer);

    console.log(`  ✓ generate-image returned explicit fallback status=${imgData.status}, reason=${imgData.fallbackReason ?? "none"} (${elapsed}ms)`);
    results["generate-image"] = { pass: true, details: `status=${imgData.status}, reason=${imgData.fallbackReason ?? "none"}`, elapsedMs: elapsed };
  }

  console.log("\n=== ALL 5 ENDPOINTS PASSED LIVE SMOKE TEST ===");
  return results;
}

smokeTest().catch((err: unknown) => {
  console.error("Smoke test failed:", err);
  process.exit(1);
});
