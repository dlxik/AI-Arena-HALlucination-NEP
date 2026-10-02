import type { OutfitLook } from "@/types/outfit";

export type ValidationUiState =
  | "validating"
  | "error"
  | OutfitLook["validation"]["status"];

const PENDING_RULE_IDS = new Set([
  "CULTURAL_CRITIC_PENDING",
  "SOURCE_REVIEW_REQUIRED",
]);

export function needsIndependentValidation(look: OutfitLook): boolean {
  return look.validation.warnings.some((warning) => PENDING_RULE_IDS.has(warning.ruleId));
}

export function resolveValidationUiState(
  look: OutfitLook,
  isValidating: boolean,
  validationError: boolean,
): ValidationUiState {
  if (isValidating) return "validating";
  if (validationError) return "error";
  return look.validation.status;
}
