import { GARMENT_IDS, OCCASION_IDS, STYLE_IDS } from "@/lib/constants";
import type { IntentParseRequest, RecommendationInput } from "@/types/api";

export type ValidationResult<T> =
  | { success: true; data: T }
  | { success: false; message: string };

const INTENT_REQUEST_MAX_LENGTH = 1_000;
const INTENT_OUTPUT_KEYS = new Set([
  "occasion",
  "garment",
  "style",
  "colors",
  "remixLevel",
  "description",
]);
const RECOMMENDATION_INPUT_KEYS = new Set(INTENT_OUTPUT_KEYS);
const NORMALIZED_ID_PATTERN = /^[a-z0-9]+(?:_[a-z0-9]+)*$/;

function isRecord(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === "object" && !Array.isArray(value);
}

function isOneOf<T extends readonly string[]>(
  value: unknown,
  choices: T,
): value is T[number] {
  return typeof value === "string" && choices.includes(value as T[number]);
}

export function parseIntentRequest(
  value: unknown,
): ValidationResult<IntentParseRequest> {
  if (!isRecord(value)) {
    return { success: false, message: "Request body must be a JSON object." };
  }

  if (typeof value.description !== "string") {
    return { success: false, message: "description must be a string." };
  }

  const description = value.description.trim();
  if (description.length < 3 || description.length > INTENT_REQUEST_MAX_LENGTH) {
    return {
      success: false,
      message: `description must contain between 3 and ${INTENT_REQUEST_MAX_LENGTH} characters.`,
    };
  }

  return { success: true, data: { description } };
}

export function parseStructuredIntent(
  value: unknown,
): ValidationResult<RecommendationInput> {
  if (!isRecord(value)) {
    return { success: false, message: "Gemini output must be a JSON object." };
  }

  const unexpectedKeys = Object.keys(value).filter(
    (key) => !INTENT_OUTPUT_KEYS.has(key),
  );
  if (unexpectedKeys.length > 0) {
    return {
      success: false,
      message: `Gemini output contains unsupported fields: ${unexpectedKeys.join(", ")}.`,
    };
  }

  if (!isOneOf(value.occasion, OCCASION_IDS)) {
    return { success: false, message: "Gemini returned an unsupported occasion." };
  }

  if (!isOneOf(value.garment, GARMENT_IDS)) {
    return { success: false, message: "Gemini returned an unsupported garment." };
  }

  if (!isOneOf(value.style, STYLE_IDS)) {
    return { success: false, message: "Gemini returned an unsupported style." };
  }

  if (
    !Array.isArray(value.colors) ||
    value.colors.length < 1 ||
    value.colors.length > 4 ||
    !value.colors.every(
      (color) =>
        typeof color === "string" && NORMALIZED_ID_PATTERN.test(color),
    )
  ) {
    return {
      success: false,
      message: "Gemini colors must contain 1 to 4 normalized color IDs.",
    };
  }

  if (
    typeof value.remixLevel !== "number" ||
    !Number.isInteger(value.remixLevel) ||
    value.remixLevel < 0 ||
    value.remixLevel > 100
  ) {
    return {
      success: false,
      message: "Gemini remixLevel must be an integer between 0 and 100.",
    };
  }

  if (
    value.description !== undefined &&
    typeof value.description !== "string"
  ) {
    return {
      success: false,
      message: "Gemini description must be a string when present.",
    };
  }

  return {
    success: true,
    data: {
      occasion: value.occasion,
      garment: value.garment,
      style: value.style,
      colors: value.colors,
      remixLevel: value.remixLevel,
      ...(value.description === undefined
        ? {}
        : { description: value.description }),
    },
  };
}

export function parseRecommendationInput(
  value: unknown,
): ValidationResult<RecommendationInput> {
  if (!isRecord(value)) {
    return { success: false, message: "Request body must be a JSON object." };
  }

  const unexpectedKeys = Object.keys(value).filter(
    (key) => !RECOMMENDATION_INPUT_KEYS.has(key),
  );
  if (unexpectedKeys.length > 0) {
    return {
      success: false,
      message: `Recommendation input contains unsupported fields: ${unexpectedKeys.join(", ")}.`,
    };
  }

  if (!isOneOf(value.occasion, OCCASION_IDS)) {
    return { success: false, message: "occasion is not supported." };
  }

  if (!isOneOf(value.garment, GARMENT_IDS)) {
    return { success: false, message: "garment is not supported." };
  }

  if (!isOneOf(value.style, STYLE_IDS)) {
    return { success: false, message: "style is not supported." };
  }

  if (
    !Array.isArray(value.colors) ||
    value.colors.length < 1 ||
    value.colors.length > 4 ||
    !value.colors.every(
      (color) =>
        typeof color === "string" && NORMALIZED_ID_PATTERN.test(color),
    ) ||
    new Set(value.colors).size !== value.colors.length
  ) {
    return {
      success: false,
      message:
        "colors must contain 1 to 4 unique lowercase ASCII snake_case IDs.",
    };
  }

  if (
    typeof value.remixLevel !== "number" ||
    !Number.isInteger(value.remixLevel) ||
    value.remixLevel < 0 ||
    value.remixLevel > 100
  ) {
    return {
      success: false,
      message: "remixLevel must be an integer between 0 and 100.",
    };
  }

  if (
    value.description !== undefined &&
    (typeof value.description !== "string" ||
      value.description.length > INTENT_REQUEST_MAX_LENGTH)
  ) {
    return {
      success: false,
      message: `description must be a string of at most ${INTENT_REQUEST_MAX_LENGTH} characters when present.`,
    };
  }

  const description = value.description?.trim();
  return {
    success: true,
    data: {
      occasion: value.occasion,
      garment: value.garment,
      style: value.style,
      colors: value.colors,
      remixLevel: value.remixLevel,
      ...(description ? { description } : {}),
    },
  };
}
