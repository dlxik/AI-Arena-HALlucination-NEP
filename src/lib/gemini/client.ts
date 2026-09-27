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

function isTimeoutError(error: unknown): boolean {
  if (error instanceof ApiError && [408, 504].includes(error.status)) {
    return true;
  }

  if (!(error instanceof Error)) return false;

  return (
    ["RequestTimeoutError", "TimeoutError", "AbortError"].includes(error.name) ||
    ("cause" in error && isTimeoutError(error.cause))
  );
}

export const generateStructuredJson: StructuredJsonGenerator = async ({
  systemInstruction,
  input,
  responseSchema,
  maxOutputTokens = 256,
}) => {
  try {
    const response = await createGeminiClient().interactions.create(
      {
        model: getGeminiModel(),
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

    return response.output_text;
  } catch (error) {
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
