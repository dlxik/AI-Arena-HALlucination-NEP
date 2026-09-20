export function getGeminiApiKey(): string {
  const apiKey = process.env.GEMINI_API_KEY;

  if (!apiKey) {
    throw new Error(
      "GEMINI_API_KEY is not configured. Copy .env.example to .env.local and add a key before enabling Gemini.",
    );
  }

  return apiKey;
}

export function createGeminiClient(): never {
  getGeminiApiKey();
  // TODO: Instantiate the approved Gemini SDK client without logging the key.
  throw new Error("Gemini client integration is not implemented yet.");
}
