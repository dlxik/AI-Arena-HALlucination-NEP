import { fail, ok, readJsonBody } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return fail("INVALID_JSON", "An image request object is required.");
  }

  // TODO: Connect Gemini image generation only after cultural validation passes.
  return ok({
    imageUrl: null,
    status: "not_integrated",
    message: "Image generation has not been integrated yet.",
    placeholder: "/placeholders/look-image.svg",
  });
}
