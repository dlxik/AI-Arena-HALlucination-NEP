import cases from "../prompt-evaluation/critic-cultural-cases.json";
import { loadCulturalKnowledgeBase } from "../../src/lib/cultural/loader";
import type { ValidationInput } from "../../src/types/api";

export const criticCases = cases;

export function makeCriticInput(testCase = criticCases[0]): ValidationInput {
  const sources = loadCulturalKnowledgeBase().sources.filter((source) =>
    source.status === "approved" && source.garment_ids.includes(testCase.garment));
  return {
    recommendationInput: {
      garment: testCase.garment, occasion: testCase.occasion, style: "elegant",
      colors: ["pastel_blue", "soft_white"], remixLevel: 20,
    },
    look: {
      id: testCase.id.toLowerCase().replaceAll("_", "-"), name: `Bản phối ${testCase.garment}`,
      garment: testCase.garment, style: "elegant", palette: ["pastel_blue", "soft_white"],
      items: [...testCase.items], accessories: [], reason: "Bản phối cho dịp được yêu cầu.",
      culturalNote: testCase.culturalNote, imagePrompt: testCase.imagePrompt,
      sourceIds: sources.map(({ id }) => id).slice(0, 4),
    },
  };
}
