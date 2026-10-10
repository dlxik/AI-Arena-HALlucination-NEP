import { ApiError, type GenerateContentParameters } from "@google/genai";
import { createGeminiClient, GeminiConfigurationError } from "@/lib/gemini/client";
import { loadImagePrompt } from "@/lib/gemini/image-prompt";
import { parseImageDataUrl, parseInlineImage } from "@/lib/validation/image";
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

function buildDetailedVisualPrompt(imagePrompt: string): string {
  try {
    const spec = JSON.parse(imagePrompt) as Record<string, unknown>;
    const garmentId = String(spec.garment ?? "");
    const style = String(spec.style ?? "");
    const colors = Array.isArray(spec.palette)
      ? spec.palette.map((color) => String(color).replace(/_/g, " ")).join(", ")
      : "";
    const items = Array.isArray(spec.items)
      ? spec.items.map((item) => String(item)).join(", ")
      : "";
    const accessories = Array.isArray(spec.accessories)
      ? spec.accessories.map((accessory) => String(accessory)).join(", ")
      : "";

    return [
      "Full-body head-to-toe editorial fashion illustration of a Vietnamese model in neutral studio lighting.",
      garmentId ? `Garment category ID: ${garmentId}.` : "",
      style ? `Style ID: ${style}.` : "",
      colors ? `Use only this requested palette: ${colors}.` : "",
      items ? `Show only these supplied garment items: ${items}.` : "",
      accessories ? `Show only these supplied accessories: ${accessories}.` : "Do not invent accessories.",
      "Keep the entire figure visible without cropping.",
      "Do not infer or add rank, insignia, motifs, ritual status, historical period, region, or authenticity claims not present in the supplied specification.",
      "This is an AI-created fashion illustration, not an authenticated artefact or historical reconstruction.",
    ]
      .filter(Boolean)
      .join(", ");
  } catch {
    return imagePrompt;
  }
}

export async function generateImageWithPollinations(
  imagePrompt: string,
  timeoutMs = 60_000,
): Promise<{ imageUrl: string }> {
  const promptText = buildDetailedVisualPrompt(imagePrompt);
  const encoded = encodeURIComponent(promptText);

  let lastError: unknown;
  const startTime = Date.now();

  for (let attempt = 1; attempt <= 3; attempt++) {
    const elapsed = Date.now() - startTime;
    const remainingMs = Math.max(timeoutMs - elapsed, 10_000);
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), remainingMs);

    const seed = Math.floor(Math.random() * 900000) + 100000;
    const url = `https://image.pollinations.ai/prompt/${encoded}?width=1024&height=1024&nologo=true&seed=${seed}`;

    try {
      const res = await fetch(url, { signal: controller.signal });
      if (!res.ok) {
        throw new ImageProviderError("upstream_error");
      }
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      if (buffer.length < 5000 || buffer.length > 10 * 1024 * 1024) {
        throw new ImageProviderError("invalid_image");
      }

      const mimeType = res.headers.get("content-type") || "image/jpeg";
      const base64Data = buffer.toString("base64");
      const dataUrl = `data:${mimeType.includes("png") ? "image/png" : "image/jpeg"};base64,${base64Data}`;

      const validated = parseImageDataUrl(dataUrl);
      if (!validated) {
        throw new ImageProviderError("invalid_image");
      }
      return { imageUrl: validated };
    } catch (error) {
      lastError = error;
      if (
        (error instanceof Error && error.name === "AbortError") ||
        (typeof error === "object" &&
          error !== null &&
          "name" in error &&
          (error as { name: string }).name === "TimeoutError")
      ) {
        throw new ImageProviderError("timeout");
      }
      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1500 * attempt));
      }
    } finally {
      clearTimeout(timer);
    }
  }

  if (lastError instanceof ImageProviderError) throw lastError;
  throw new ImageProviderError("upstream_error");
}

export async function generateImage(imagePrompt: string): Promise<{ imageUrl: string }> {
  const provider = process.env.IMAGE_PROVIDER?.trim().toLowerCase();

  if (provider === "pollinations") {
    return generateImageWithPollinations(imagePrompt);
  }

  if (provider === "gemini") {
    try {
      return await generateImageWithGemini(imagePrompt);
    } catch (error) {
      // If Gemini quota is exceeded (429 free tier limit: 0), fallback to Pollinations to successfully deliver the image
      if (error instanceof ImageProviderError && error.reason === "quota") {
        console.warn("Gemini image quota exceeded, falling back to Pollinations free provider...");
        return generateImageWithPollinations(imagePrompt);
      }
      throw error;
    }
  }

  throw new ImageProviderError("not_configured");
}

