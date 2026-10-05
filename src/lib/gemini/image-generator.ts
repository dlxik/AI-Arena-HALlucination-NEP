import { ApiError, type GenerateContentParameters } from "@google/genai";
import { createGeminiClient, GeminiConfigurationError } from "@/lib/gemini/client";
import { loadImagePrompt } from "@/lib/gemini/image-prompt";
import { parseInlineImage } from "@/lib/validation/image";
import type { ImageFallbackReason } from "@/types/api";

export class ImageProviderError extends Error {
  constructor(public readonly reason: Exclude<ImageFallbackReason, "cultural_revision_required">) {
    super("Image generation could not complete.");
    this.name = "ImageProviderError";
  }
}

export type ImageProviderConfiguration = { model: string; timeoutMs: number };
export type ImageTransport = (request: GenerateContentParameters) => Promise<unknown>;

export function getImageConfiguration(): ImageProviderConfiguration {
  const provider = process.env.IMAGE_PROVIDER?.trim();
  const model = process.env.GEMINI_IMAGE_MODEL?.trim();
  if (provider !== "gemini" || !model || !/^[a-zA-Z0-9._-]{1,100}$/.test(model)) {
    throw new ImageProviderError("not_configured");
  }
  const timeoutMs = Number(process.env.GEMINI_IMAGE_TIMEOUT_MS);
  return { model, timeoutMs: Number.isInteger(timeoutMs) && timeoutMs >= 1_000 && timeoutMs <= 120_000 ? timeoutMs : 60_000 };
}

function object(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

const BLOCKED_FINISH_REASONS = new Set([
  "SAFETY", "IMAGE_SAFETY", "PROHIBITED_CONTENT", "IMAGE_PROHIBITED_CONTENT",
  "BLOCKLIST", "SPII", "RECITATION", "IMAGE_RECITATION",
]);

export function parseImageProviderResponse(response: unknown): { imageUrl: string } {
  if (!object(response)) throw new ImageProviderError("invalid_image");
  if (object(response.promptFeedback) && response.promptFeedback.blockReason &&
      response.promptFeedback.blockReason !== "BLOCKED_REASON_UNSPECIFIED") {
    throw new ImageProviderError("safety_rejection");
  }
  if (!Array.isArray(response.candidates) || response.candidates.length !== 1 || !object(response.candidates[0])) {
    throw new ImageProviderError("invalid_image");
  }
  const candidate = response.candidates[0];
  if (BLOCKED_FINISH_REASONS.has(candidate.finishReason as string) ||
      (Array.isArray(candidate.safetyRatings) && candidate.safetyRatings.some((rating) => object(rating) && rating.blocked === true))) {
    throw new ImageProviderError("safety_rejection");
  }
  if (candidate.finishReason !== "STOP" || !object(candidate.content) || !Array.isArray(candidate.content.parts)) {
    throw new ImageProviderError("invalid_image");
  }
  const imageParts = candidate.content.parts.filter((part) => object(part) && part.inlineData !== undefined && part.thought !== true);
  if (imageParts.length !== 1) throw new ImageProviderError("invalid_image");
  const imageUrl = parseInlineImage(imageParts[0].inlineData);
  if (!imageUrl) throw new ImageProviderError("invalid_image");
  return { imageUrl };
}

export async function generateImageWithGemini(
  imagePrompt: string,
  transport?: ImageTransport,
  configuration?: ImageProviderConfiguration,
): Promise<{ imageUrl: string }> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const controller = new AbortController();
  try {
    const { model, timeoutMs } = configuration ?? getImageConfiguration();
    const systemInstruction = await loadImagePrompt();
    const send = transport ?? ((request) => createGeminiClient().models.generateContent(request));
    const deadline = new Promise<never>((_, reject) => {
      timer = setTimeout(() => {
        reject(new ImageProviderError("timeout"));
        controller.abort();
      }, timeoutMs);
    });
    const response = await Promise.race([send({ model, contents: imagePrompt, config: {
      systemInstruction, responseModalities: ["TEXT", "IMAGE"], candidateCount: 1,
      abortSignal: controller.signal, httpOptions: { timeout: timeoutMs, retryOptions: { attempts: 1 } },
    } }), deadline]);
    return parseImageProviderResponse(response);
  } catch (error) {
    if (error instanceof ImageProviderError) throw error;
    if (error instanceof GeminiConfigurationError) throw new ImageProviderError("not_configured");
    if (controller.signal.aborted || (error instanceof ApiError && [408, 504].includes(error.status)) ||
        (error instanceof Error && ["TimeoutError", "AbortError", "RequestTimeoutError"].includes(error.name))) {
      throw new ImageProviderError("timeout");
    }
    throw new ImageProviderError(error instanceof ApiError && error.status === 429 ? "quota" : "upstream_error");
  } finally {
    if (timer !== undefined) clearTimeout(timer);
  }
}
