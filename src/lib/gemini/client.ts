import { ApiError, GoogleGenAI } from "@google/genai";
import {
  DEFAULT_GEMINI_MODEL,
  DEFAULT_GEMINI_TIMEOUT_MS,
} from "@/lib/constants";

export class GeminiConfigurationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "GeminiConfigurationError";
  }
}

export type GeminiRequestErrorKind = "timeout" | "upstream";

export class GeminiRequestError extends Error {
  constructor(
    public readonly kind: GeminiRequestErrorKind,
    public readonly upstreamStatus?: number,
    options?: ErrorOptions,
  ) {
    super(
      kind === "timeout"
        ? "Gemini request timed out."
        : "Gemini request failed.",
      options,
    );
    this.name = "GeminiRequestError";
  }
}

export type StructuredJsonRequest = {
  systemInstruction: string;
  input: string;
  responseSchema: Record<string, unknown>;
  maxOutputTokens?: number;
};

export type StructuredJsonGenerator = (
  request: StructuredJsonRequest,
) => Promise<string>;

let cachedClient: GoogleGenAI | undefined;
let cachedApiKey: string | undefined;

export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY?.trim();

  if (!apiKey) {
    throw new GeminiConfigurationError(
      "GEMINI_API_KEY is not configured. Copy .env.example to .env.local and add a key before enabling Gemini.",
    );
  }

  return apiKey;
}

export function getGeminiModel(): string {
  return process.env.GEMINI_MODEL?.trim() || DEFAULT_GEMINI_MODEL;
}

export function getGeminiTimeoutMs(): number {
  const configured = Number(process.env.GEMINI_TIMEOUT_MS);
  if (
    Number.isInteger(configured) &&
    configured >= 1_000 &&
    configured <= 60_000
  ) {
    return configured;
  }

  return DEFAULT_GEMINI_TIMEOUT_MS;
}

export function createGeminiClient(): GoogleGenAI {
  const apiKey = getGeminiApiKey();
  if (!cachedClient || cachedApiKey !== apiKey) {
    cachedClient = new GoogleGenAI({ apiKey });
    cachedApiKey = apiKey;
  }

  return cachedClient;
}

function stripMarkdownFences(text: string): string {
  let cleaned = text.trim();
  if (cleaned.startsWith("```")) {
    cleaned = cleaned.replace(/^```[a-zA-Z0-9_-]*\r?\n?/, "");
  }
  if (cleaned.endsWith("```")) {
    cleaned = cleaned.replace(/\r?\n?```$/, "");
  }
  return cleaned.trim();
}

function isTimeoutError(error: unknown): boolean {
  if (error instanceof ApiError && [408, 504].includes(error.status)) {
    return true;
  }

  if (!(error instanceof Error)) return false;

  const isNamedTimeout =
    [
      "RequestTimeoutError",
      "TimeoutError",
      "AbortError",
      "APIConnectionTimeoutError",
    ].includes(error.name) || error.name.includes("Timeout");

  const isMessageTimeout = /timed out|timeout/i.test(error.message);

  return (
    isNamedTimeout ||
    isMessageTimeout ||
    ("cause" in error && isTimeoutError(error.cause))
  );
}

function isServiceUnavailableError(error: unknown): boolean {
  if (error instanceof ApiError && [503, 429].includes(error.status)) {
    return true;
  }
  if (typeof error === "object" && error !== null) {
    const errObj = error as Record<string, unknown>;
    const status =
      (errObj.status as number | undefined) ??
      (errObj.statusCode as number | undefined);
    if (status === 503 || status === 429) return true;
    const msg = (errObj.message as string | undefined) ?? "";
    if (/high demand|unavailable|overloaded|rate limit/i.test(msg)) return true;
  }
  return false;
}

export const generateStructuredJson: StructuredJsonGenerator = async ({
  systemInstruction,
  input,
  responseSchema,
  maxOutputTokens = 256,
}) => {
  const primaryModel = getGeminiModel();
  const fallbackModel =
    primaryModel === "gemini-3.8-flash" ? "gemini-2.5-flash" : undefined;

  const executeCall = async (model: string) => {
    const response = await createGeminiClient().interactions.create(
      {
        model,
        input,
        system_instruction: systemInstruction,
        response_format: {
          type: "text",
          mime_type: "application/json",
          schema: responseSchema,
        },
        generation_config: {
          max_output_tokens: maxOutputTokens,
        },
        store: false,
      },
      {
        timeout: getGeminiTimeoutMs(),
        maxRetries: 1,
      },
    );

    if (!response.output_text?.trim()) {
      throw new GeminiRequestError("upstream");
    }

    return stripMarkdownFences(response.output_text);
  };

  try {
    return await executeCall(primaryModel);
  } catch (error) {
    if (
      fallbackModel &&
      (isServiceUnavailableError(error) ||
        (error instanceof Error &&
          "cause" in error &&
          isServiceUnavailableError(error.cause)))
    ) {
      console.warn(
        `Primary model ${primaryModel} rate-limited or unavailable, falling back to ${fallbackModel}...`,
      );
      try {
        return await executeCall(fallbackModel);
      } catch (fallbackError) {
        error = fallbackError;
      }
    }

    if (
      error instanceof GeminiConfigurationError ||
      error instanceof GeminiRequestError
    ) {
      throw error;
    }

    if (isTimeoutError(error)) {
      throw new GeminiRequestError("timeout", undefined, { cause: error });
    }

    throw new GeminiRequestError(
      "upstream",
      error instanceof ApiError ? error.status : undefined,
      { cause: error },
    );
  }
};
