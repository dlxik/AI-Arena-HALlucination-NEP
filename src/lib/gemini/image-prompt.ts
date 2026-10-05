import { readFile } from "node:fs/promises";
import path from "node:path";
import type { ValidationLook } from "@/types/api";

export async function loadImagePrompt(): Promise<string> {
  return readFile(path.join(process.cwd(), "prompts", "image", "image-v1.md"), "utf8");
}

// Critic checks the identical visual specification sent to the image provider.
// Never forward client imagePrompt, culturalNote, source payloads, verdicts or credentials.
export function buildImagePrompt(look: ValidationLook): string {
  return JSON.stringify({ garment: look.garment, style: look.style,
    palette: look.palette, items: look.items, accessories: look.accessories });
}
