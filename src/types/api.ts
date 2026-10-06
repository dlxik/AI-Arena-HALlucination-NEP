import type { OutfitLook, ValidationWarning } from "./outfit";

export type RecommendationInput = {
  occasion: string;
  garment: string | "auto";
  style: string;
  colors: string[];
  remixLevel: number;
  description?: string;
};

export type RecommendationOutput = {
  looks: OutfitLook[];
};

export type IntentParseRequest = {
  description: string;
};

export type ValidationOutput = {
  status: "pass" | "warning" | "revise";
  warnings: ValidationWarning[];
};

export type ValidationLook = Omit<
  OutfitLook,
  "validation" | "imageUrl" | "imageFallback" | "imageDisclaimer"
>;

export type ValidationInput = {
  look: ValidationLook;
  recommendationInput: RecommendationInput;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ImageFallbackReason =
  | "not_configured" | "timeout" | "quota" | "safety_rejection"
  | "upstream_error" | "invalid_image" | "cultural_revision_required";
export type ImageGenerationResult =
  | { lookId: string; status: "generated"; imageUrl: string; fallbackReason?: never }
  | { lookId: string; status: "fallback"; fallbackReason: ImageFallbackReason; imageUrl?: never };
export type FreshValidation = {
  validation: ValidationOutput;
  validationId: string;
  validatedAt: string;
};
export type ImageGenerationOutput = ImageGenerationResult & FreshValidation & { disclaimer: string };
export type RemixChanges = { palette?: string[]; accessories?: string[] };
export type RemixInput = ValidationInput & { changes: RemixChanges };
export type RemixOutput = FreshValidation & {
  parentLookId: string;
  look: OutfitLook;
  recommendationInput: RecommendationInput;
  image: ImageGenerationResult;
  disclaimer: string;
};
export type ApiFailure = {
  success: false;
  error: { code: string; message: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

