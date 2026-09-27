import { RECOMMENDATION_COUNT } from "@/lib/constants";
import type { ValidationResult } from "@/lib/validation/schemas";
import type { RecommendationOutput } from "@/types/api";

export const PENDING_CRITIC_WARNING = {
  ruleId: "CULTURAL_CRITIC_PENDING",
  severity: "medium",
  reason: "Cultural Critic chưa chạy cho bản phối này.",
  suggestedFix:
    "Chạy Cultural Critic và review nguồn trước khi xem đây là kết quả đã kiểm duyệt.",
} as const;

export type RecommendationOutputConstraints = {
  allowedGarmentIds: readonly string[];
  allowedSourceIdsByGarment: ReadonlyMap<string, ReadonlySet<string>>;
  expectedStyle: string;
  requestedColors: readonly string[];
};

const OUTPUT_KEYS = new Set(["looks"]);
const LOOK_KEYS = new Set([
  "id",
  "name",
  "garment",
  "style",
  "palette",
  "items",
  "accessories",
  "reason",
  "culturalNote",
  "sourceIds",
  "validation",
  "imagePrompt",
]);
const VALIDATION_KEYS = new Set(["status", "warnings"]);
const WARNING_KEYS = new Set([
  "ruleId",
  "severity",
  "reason",
  "suggestedFix",
]);
const LOOK_ID_PATTERN = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function hasOnlyKeys(
  value: Record<string, unknown>,
  expected: ReadonlySet<string>,
): boolean {
  return Object.keys(value).every((key) => expected.has(key));
}

function isBoundedText(value: unknown, maxLength = 1_000): value is string {
  return (
    typeof value === "string" &&
    value.trim().length > 0 &&
    value.length <= maxLength
  );
}

function isTextArray(
  value: unknown,
  minItems: number,
  maxItems: number,
): value is string[] {
  return (
    Array.isArray(value) &&
    value.length >= minItems &&
    value.length <= maxItems &&
    value.every((item) => isBoundedText(item, 200)) &&
    new Set(value).size === value.length
  );
}

function invalid(message: string): ValidationResult<RecommendationOutput> {
  return { success: false, message };
}

export function parseRecommendationOutput(
  value: unknown,
  constraints: RecommendationOutputConstraints,
): ValidationResult<RecommendationOutput> {
  if (!isRecord(value) || !hasOnlyKeys(value, OUTPUT_KEYS)) {
    return invalid("Gemini output must contain only a looks array.");
  }

  if (!Array.isArray(value.looks) || value.looks.length !== RECOMMENDATION_COUNT) {
    return invalid(
      `Gemini output must contain exactly ${RECOMMENDATION_COUNT} looks.`,
    );
  }

  const allowedGarments = new Set(constraints.allowedGarmentIds);
  const requestedColors = new Set(constraints.requestedColors);
  const ids = new Set<string>();
  const names = new Set<string>();
  const signatures = new Set<string>();

  for (const [index, look] of value.looks.entries()) {
    const label = `looks[${index}]`;
    if (!isRecord(look) || !hasOnlyKeys(look, LOOK_KEYS)) {
      return invalid(`${label} contains missing or unsupported fields.`);
    }

    if (
      !isBoundedText(look.id, 64) ||
      !LOOK_ID_PATTERN.test(look.id) ||
      ids.has(look.id)
    ) {
      return invalid(`${label}.id must be a unique lowercase kebab-case ID.`);
    }
    ids.add(look.id);

    if (!isBoundedText(look.name, 120) || names.has(look.name)) {
      return invalid(`${label}.name must be non-empty and unique.`);
    }
    names.add(look.name);

    if (typeof look.garment !== "string" || !allowedGarments.has(look.garment)) {
      return invalid(`${label}.garment is not present in the retrieved context.`);
    }

    if (look.style !== constraints.expectedStyle) {
      return invalid(`${label}.style must match the requested style ID.`);
    }

    if (
      !isTextArray(look.palette, 1, 4) ||
      !look.palette.some((color) => requestedColors.has(color))
    ) {
      return invalid(
        `${label}.palette must contain 1 to 4 unique colors and include a requested color.`,
      );
    }

    if (!isTextArray(look.items, 1, 8)) {
      return invalid(`${label}.items must contain 1 to 8 unique items.`);
    }
    if (!isTextArray(look.accessories, 0, 6)) {
      return invalid(`${label}.accessories must contain at most 6 unique items.`);
    }
    if (!isBoundedText(look.reason) || !isBoundedText(look.culturalNote)) {
      return invalid(`${label} must contain a reason and culturalNote.`);
    }
    if (!isBoundedText(look.imagePrompt, 1_500)) {
      return invalid(`${label}.imagePrompt is invalid.`);
    }

    const allowedSources = constraints.allowedSourceIdsByGarment.get(
      look.garment,
    );
    if (
      !allowedSources ||
      !isTextArray(look.sourceIds, 1, 4) ||
      !look.sourceIds.every((sourceId) => allowedSources.has(sourceId))
    ) {
      return invalid(
        `${label}.sourceIds must contain only retrieved sources relevant to its garment.`,
      );
    }

    if (
      !isRecord(look.validation) ||
      !hasOnlyKeys(look.validation, VALIDATION_KEYS) ||
      look.validation.status !== "warning" ||
      !Array.isArray(look.validation.warnings) ||
      look.validation.warnings.length !== 1
    ) {
      return invalid(
        `${label}.validation must disclose that Cultural Critic is pending.`,
      );
    }

    const warning = look.validation.warnings[0];
    if (
      !isRecord(warning) ||
      !hasOnlyKeys(warning, WARNING_KEYS) ||
      warning.ruleId !== PENDING_CRITIC_WARNING.ruleId ||
      warning.severity !== PENDING_CRITIC_WARNING.severity ||
      warning.reason !== PENDING_CRITIC_WARNING.reason ||
      warning.suggestedFix !== PENDING_CRITIC_WARNING.suggestedFix
    ) {
      return invalid(
        `${label}.validation contains an unsupported warning or a fabricated critic result.`,
      );
    }

    const signature = JSON.stringify({
      garment: look.garment,
      palette: look.palette,
      items: look.items,
      accessories: look.accessories,
      imagePrompt: look.imagePrompt,
    });
    if (signatures.has(signature)) {
      return invalid("The three looks must be materially distinct.");
    }
    signatures.add(signature);
  }

  return { success: true, data: value as RecommendationOutput };
}
