/**
 * Tests cho /api/recommend route
 *
 * Owner: Hiền — kiểm tra validation request, error codes theo API contract
 * (MEETING_02.md §6 "Bổ sung kiểm tra frontend phù hợp cho success/error flow")
 *
 * Ghi chú: Kết quả hiện vẫn trả fixture (TODO của Lan Anh).
 * Các test này kiểm tra request validation và response envelope,
 * không phụ thuộc vào Gemini key.
 */

import assert from "node:assert/strict";
import test from "node:test";
import { POST } from "../../src/app/api/recommend/route";
import type { ApiResponse, RecommendationOutput } from "../../src/types/api";

// ─────────────────────────────────────────────────────────
// Helper
// ─────────────────────────────────────────────────────────

function makeRequest(body: unknown): Request {
  return new Request("http://localhost/api/recommend", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

/** Input hợp lệ theo RecommendationInput schema */
const VALID_INPUT = {
  occasion: "cultural_visit",
  garment: "ao_dai",
  style: "minimal",
  colors: ["pastel_blue"],
  remixLevel: 40,
};

// ─────────────────────────────────────────────────────────
// Request validation
// ─────────────────────────────────────────────────────────

test("returns 422 when body is missing required fields", async () => {
  const response = await POST(makeRequest({}));
  const json = (await response.json()) as ApiResponse<never>;

  assert.equal(response.status, 422);
  assert.equal(json.success, false);
  assert.equal(!json.success && json.error.code, "INVALID_INPUT");
});

test("returns 422 when occasion is missing", async () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  const { occasion: _omit, ...rest } = VALID_INPUT;
  const response = await POST(makeRequest(rest));
  const json = (await response.json()) as ApiResponse<never>;

  assert.equal(response.status, 422);
  assert.equal(json.success, false);
});

test("returns 422 when colors is not an array", async () => {
  const response = await POST(makeRequest({ ...VALID_INPUT, colors: "pastel_blue" }));
  const json = (await response.json()) as ApiResponse<never>;

  assert.equal(response.status, 422);
  assert.equal(json.success, false);
  assert.equal(!json.success && json.error.code, "INVALID_INPUT");
});

test("returns 422 when remixLevel is out of range (< 0)", async () => {
  const response = await POST(makeRequest({ ...VALID_INPUT, remixLevel: -1 }));
  const json = (await response.json()) as ApiResponse<never>;

  assert.equal(response.status, 422);
  assert.equal(json.success, false);
});

test("returns 422 when remixLevel is out of range (> 100)", async () => {
  const response = await POST(makeRequest({ ...VALID_INPUT, remixLevel: 101 }));
  const json = (await response.json()) as ApiResponse<never>;

  assert.equal(response.status, 422);
  assert.equal(json.success, false);
});

test("returns 422 when body is invalid JSON (null body)", async () => {
  const response = await POST(
    new Request("http://localhost/api/recommend", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: "{invalid",
    }),
  );
  // readJsonBody returns null → parseRecommendationInput sẽ reject
  const json = (await response.json()) as ApiResponse<never>;
  assert.equal(response.status, 422);
  assert.equal(json.success, false);
});

// ─────────────────────────────────────────────────────────
// Success path (fixture)
// ─────────────────────────────────────────────────────────

test("returns 200 with valid input — response envelope is well-formed", async () => {
  const response = await POST(makeRequest(VALID_INPUT));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(response.status, 200);
  assert.equal(json.success, true);
});

test("returns exactly 3 looks in success response", async () => {
  const response = await POST(makeRequest(VALID_INPUT));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(json.success, true);
  if (!json.success) throw new Error("Expected success");
  assert.equal(json.data.looks.length, 3, "Must have exactly 3 looks");
});

test("look IDs are unique in success response", async () => {
  const response = await POST(makeRequest(VALID_INPUT));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(json.success, true);
  if (!json.success) throw new Error("Expected success");
  const ids = json.data.looks.map((l) => l.id);
  const unique = new Set(ids);
  assert.equal(unique.size, ids.length, "Look IDs must be unique");
});

test("each look has required fields", async () => {
  const response = await POST(makeRequest(VALID_INPUT));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(json.success, true);
  if (!json.success) throw new Error("Expected success");

  const REQUIRED = [
    "id", "name", "garment", "style", "palette", "items",
    "accessories", "reason", "culturalNote", "sourceIds",
    "validation", "imagePrompt",
  ] as const;

  for (const look of json.data.looks) {
    for (const field of REQUIRED) {
      assert.notEqual(
        (look as Record<string, unknown>)[field],
        undefined,
        `Look ${look.id} is missing field: ${field}`,
      );
    }
  }
});

test("each look has valid validation status", async () => {
  const response = await POST(makeRequest(VALID_INPUT));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(json.success, true);
  if (!json.success) throw new Error("Expected success");

  const VALID_STATUSES = new Set(["pass", "warning", "revise"]);
  for (const look of json.data.looks) {
    assert.ok(
      VALID_STATUSES.has(look.validation.status),
      `Look ${look.id} has invalid validation.status: ${look.validation.status}`,
    );
  }
});

test("accepts garment=auto in valid input", async () => {
  const response = await POST(makeRequest({ ...VALID_INPUT, garment: "auto" }));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(response.status, 200);
  assert.equal(json.success, true);
});

test("imagePrompt is not exposed in a field named 'imagePrompt' at top level of look — field exists but is internal", async () => {
  // imagePrompt tồn tại trong schema nhưng không được hiển thị cho người dùng.
  // Test này chỉ xác nhận field tồn tại và là string (không bị xóa khỏi schema).
  const response = await POST(makeRequest(VALID_INPUT));
  const json = (await response.json()) as ApiResponse<RecommendationOutput>;

  assert.equal(json.success, true);
  if (!json.success) throw new Error("Expected success");
  for (const look of json.data.looks) {
    assert.equal(typeof look.imagePrompt, "string");
  }
});
