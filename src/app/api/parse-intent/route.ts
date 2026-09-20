import { fail, ok, readJsonBody } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return fail("INVALID_JSON", "A JSON object is required.");
  }

  // TODO: Replace this deterministic response with Gemini intent parsing.
  return ok({
    occasion: "Tham quan Văn Miếu",
    garment: "ao_ngu_than",
    style: "Thanh lịch, tối giản",
    colors: ["xanh pastel"],
    remixLevel: 40,
    description: "Mock structured intent; chưa gọi Gemini.",
  });
}
