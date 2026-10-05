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

export type ValidationLook = Omit<OutfitLook, "validation" | "imageUrl">;

export type ValidationInput = {
  look: ValidationLook;
  recommendationInput: RecommendationInput;
};

export type ApiSuccess<T> = { success: true; data: T };
export type ApiFailure = {
  success: false;
  error: { code: string; message: string };
};

export type ApiResponse<T> = ApiSuccess<T> | ApiFailure;

export type ImageGenerationRequest = {
  look: OutfitLook;
};

export type ImageGenerationResult = {
  lookId: string;
  status: "generated" | "fallback";
  imageUrl?: string;
  fallbackReason?: string;
};

