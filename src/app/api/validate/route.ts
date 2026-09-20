import { fail, ok, readJsonBody } from "@/lib/utils";

export async function POST(request: Request) {
  const body = await readJsonBody(request);
  if (!body || typeof body !== "object") {
    return fail("INVALID_JSON", "A look object is required.");
  }

  // TODO: Validate against approved cultural rules, then add Gemini critique.
  return ok({
    status: "warning" as const,
    warnings: [
      {
        ruleId: "SOURCE_REVIEW_REQUIRED",
        severity: "medium" as const,
        reason: "Cultural data is placeholder-only and has not been reviewed.",
        suggestedFix: "Add approved references before treating the result as verified.",
      },
    ],
  });
}
