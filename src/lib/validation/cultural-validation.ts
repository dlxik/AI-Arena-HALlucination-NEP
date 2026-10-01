import { GARMENT_IDS, STYLE_IDS } from "@/lib/constants";
import { parseRecommendationInput, type ValidationResult } from "@/lib/validation/schemas";
import type { ValidationInput, ValidationLook, ValidationOutput } from "@/types/api";
import type { CulturalRuleContext } from "@/types/cultural";

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function keys(value: Record<string, unknown>, allowed: readonly string[]) {
  return Object.keys(value).every((key) => allowed.includes(key));
}

function text(value: unknown, max = 1_000): value is string {
  return typeof value === "string" && value.trim().length > 0 && value.length <= max;
}

function texts(value: unknown, min: number, max: number): value is string[] {
  return Array.isArray(value) && value.length >= min && value.length <= max &&
    value.every((entry) => text(entry, 200)) && new Set(value).size === value.length;
}

function invalid<T>(message: string): ValidationResult<T> {
  return { success: false, message };
}

export function parseValidationLook(value: unknown): ValidationResult<ValidationLook> {
  if (!object(value) || !keys(value, [
    "id", "name", "garment", "style", "palette", "items", "accessories", "reason",
    "culturalNote", "sourceIds", "imagePrompt", "validation", "imageUrl",
  ])) return invalid("look must contain only supported outfit fields.");

  if (!text(value.id, 64) || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value.id) ||
      !text(value.name, 120) || typeof value.garment !== "string" ||
      value.garment === "auto" || !GARMENT_IDS.includes(value.garment as typeof GARMENT_IDS[number]) ||
      typeof value.style !== "string" || !STYLE_IDS.includes(value.style as typeof STYLE_IDS[number]) ||
      !texts(value.palette, 1, 4) || !texts(value.items, 1, 8) ||
      !texts(value.accessories, 0, 6) || !text(value.reason) || !text(value.culturalNote) ||
      !texts(value.sourceIds, 1, 4) || !text(value.imagePrompt, 1_500)) {
    return invalid("look must contain all bounded outfit fields and a concrete garment ID.");
  }

  // Never send a client-supplied previous verdict or image URL to the Critic.
  return { success: true, data: {
    id: value.id, name: value.name, garment: value.garment, style: value.style,
    palette: value.palette, items: value.items, accessories: value.accessories,
    reason: value.reason, culturalNote: value.culturalNote,
    sourceIds: value.sourceIds, imagePrompt: value.imagePrompt,
  } };
}

export function parseValidationInput(value: unknown): ValidationResult<ValidationInput> {
  if (!object(value) || !keys(value, ["look", "recommendationInput"])) {
    return invalid("Validation request must contain only look and recommendationInput.");
  }
  const input = parseRecommendationInput(value.recommendationInput);
  if (!input.success) return input;
  const look = parseValidationLook(value.look);
  if (!look.success) return look;
  if ((input.data.garment !== "auto" && input.data.garment !== look.data.garment) ||
      input.data.style !== look.data.style ||
      !look.data.palette.some((color) => input.data.colors.includes(color))) {
    return invalid("look must match the requested garment, style and at least one color.");
  }
  return { success: true, data: { look: look.data, recommendationInput: input.data } };
}

export function parseCulturalValidation(
  value: unknown,
  context: CulturalRuleContext,
): ValidationResult<ValidationOutput> {
  if (!object(value) || !keys(value, ["status", "warnings"]) ||
      !["pass", "warning", "revise"].includes(value.status as string) ||
      !Array.isArray(value.warnings) || value.warnings.length > context.rules.length) {
    return invalid("Critic output must contain status and a bounded warnings array.");
  }
  const seen = new Set<string>();
  let high = false;
  for (const warning of value.warnings) {
    if (!object(warning) || !keys(warning, ["ruleId", "severity", "reason", "suggestedFix"]) ||
        !text(warning.ruleId, 200) || seen.has(warning.ruleId) ||
        !["low", "medium", "high"].includes(warning.severity as string) ||
        !text(warning.reason) || !text(warning.suggestedFix)) {
      return invalid("Every warning requires a unique ruleId, severity, reason and actionable suggestedFix.");
    }
    const rule = context.rules.find(({ id }) => id === warning.ruleId);
    if (!rule || rule.garment !== context.garment.id || !rule.reviewed ||
        rule.verification_status !== "verified" || rule.source_ids.length === 0 ||
        !rule.source_ids.every((id) => context.sources.some((source) =>
          source.id === id && source.status === "approved" && source.garment_ids.includes(rule.garment)))) {
      return invalid("Warning rule must be retrieved, reviewed and grounded in approved sources for this garment.");
    }
    if (warning.severity === "high" && rule.enforcement !== "hard") {
      return invalid("An advisory rule cannot become a high-severity mandatory revision.");
    }
    high ||= warning.severity === "high";
    seen.add(warning.ruleId);
  }
  const expected = value.warnings.length === 0 ? "pass" : high ? "revise" : "warning";
  if (value.status !== expected) return invalid("Critic status does not match warning severities.");
  return { success: true, data: value as ValidationOutput };
}
