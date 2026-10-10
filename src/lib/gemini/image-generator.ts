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
    const spec = JSON.parse(imagePrompt);
    const garmentId = spec.garment;
    const style = spec.style || "traditional";
    const colors = Array.isArray(spec.palette) && spec.palette.length > 0
      ? spec.palette.map((c: string) => String(c).replace(/_/g, " ")).join(", ")
      : "pastel mint green, traditional colors";
    const items = Array.isArray(spec.items) && spec.items.length > 0
      ? spec.items.join(", ")
      : "";
    const accessories = Array.isArray(spec.accessories) && spec.accessories.length > 0
      ? spec.accessories.join(", ")
      : "";

    let garmentDescription = "";

    if (garmentId === "nhat_binh") {
      garmentDescription = [
        "authentic Vietnamese royal court costume Nhat Binh robe (Áo Nhật Bình) from Nguyen Dynasty",
        "prominent wide rectangular embroidered collar band running vertically down the chest (cổ đối khâm hình chữ nhật)",
        "wide loose sleeves with distinct five-colored rainbow stripes (ngũ sắc cuffs: red, yellow, blue, white, green) on the sleeve hems",
        "wearing an elaborate traditional royal blue coiled fabric crown turban (khăn vành quấn đầu nhiều vòng) neatly atop styled hair",
        "luxurious long silk outer robe over wide white silk trousers",
        "wearing traditional Vietnamese imperial embroidered silk slippers (hài thêu hoa sen hoặc chim phượng) clearly visible on feet resting on the floor",
        accessories ? `holding matching accessories: ${accessories}` : "holding a delicate traditional imperial embroidered silk purse or clutch handbag (túi gấm) and painted silk folding fan",
        "traditional Vietnamese royal embroidery with cloud and water (thủy ba) wave patterns",
        "strictly authentic Vietnamese historical attire, NOT Chinese Hanfu, NOT Japanese Kimono",
      ].join(", ");
    } else if (garmentId === "ao_ngu_than") {
      garmentDescription = [
        "authentic traditional Vietnamese five-panel robe (Áo Ngũ Thân)",
        "featuring a high standing round Mandarin collar (cổ đứng)",
        "curved overlapping front right lapel fastened with a vertical row of five traditional buttons (hàng năm cúc ngũ khuy) from neck to side",
        "modest straight silhouette with side slits worn over loose white silk pants",
        "wearing an authentic traditional Vietnamese folded fabric turban (khăn đóng / khăn vấn)",
        items.toLowerCase().includes("chẽn") || items.toLowerCase().includes("tay chẽn")
          ? "neatly fitted narrow sleeves (tay chẽn)"
          : "traditional sleeves",
        "wearing traditional Vietnamese wooden clogs (guốc mộc) or embroidered slippers visible on feet standing on the floor",
        accessories ? `holding accessories: ${accessories}` : "holding a traditional fabric pouch handbag (túi vải gấm) or traditional folding bamboo fan",
        "authentic 19th-century Vietnamese cultural costume, historical Vietnamese tailoring",
      ].filter(Boolean).join(", ");
    } else if (garmentId === "ao_tu_than") {
      garmentDescription = [
        "authentic traditional Northern Vietnamese four-panel dress (Áo Tứ Thân)",
        "open flowing outer robe with two front panels tied loosely into a bow at the waist",
        "worn over an embroidered silk halter-neck bodice (áo yếm) and long flowing dark silk skirt",
        "colorful silk waist sash ribbons (dây bao thắt lưng)",
        "wearing traditional black kerchief (khăn mỏ quạ) on head and holding a large round flat woven palm hat with silk ribbons (nón quai thao)",
        "wearing traditional hand-carved wooden clogs (guốc mộc) clearly visible standing on the floor",
        accessories ? `holding accessories: ${accessories}` : "carrying a traditional embroidered cloth pouch (túi gấm quai thao)",
        "traditional Vietnamese folk festival cultural attire (Quan Họ cultural heritage)",
      ].join(", ");
    } else {
      garmentDescription = [
        "authentic traditional Vietnamese Ao Dai (Áo Dài)",
        "featuring high stand-up Mandarin collar, form-fitting bodice, two long elegant split panels flowing down to ankles",
        "side slits starting from waistline, worn over wide-leg flowing silk trousers",
        "wearing an ornate matching circular fabric headband crown (mấn đội đầu / khăn vấn) on sleek hairstyle",
        "wearing elegant traditional embroidered silk shoes (hài thêu) or heels clearly visible on feet standing on the floor",
        accessories ? `holding accessories: ${accessories}` : "holding an elegant embroidered silk clutch handbag (túi xách thêu gấm) or silk folding fan",
        "timeless Vietnamese traditional national dress",
      ].join(", ");
    }

    return [
      "Full body head-to-toe standing wide shot fashion photography of a young Vietnamese model in clean studio lighting",
      "entire figure completely visible from top of headwear down to feet and shoes, standing pose with ample margins above head and below shoes, zero cropping, full length view",
      `wearing ${garmentDescription}`,
      `color palette: ${colors}`,
      items ? `specific garment items: ${items}` : "",
      accessories ? `accessories and handbag: ${accessories}` : "",
      `style mood: ${style}`,
      "photorealistic editorial fashion photography, high resolution 8k, authentic Vietnamese cultural heritage, sharp focus, full length view, visible footwear and shoes on floor, visible headdress and headwear on head, museum-grade textile details, natural fabric texture, uncropped full body shot",
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

