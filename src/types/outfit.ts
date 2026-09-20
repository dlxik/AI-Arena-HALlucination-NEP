export type ValidationWarning = {
  ruleId: string;
  severity: "low" | "medium" | "high";
  reason: string;
  suggestedFix: string;
};

export type OutfitLook = {
  id: string;
  name: string;
  garment: string;
  style: string;
  palette: string[];
  items: string[];
  accessories: string[];
  reason: string;
  culturalNote: string;
  sourceIds: string[];
  validation: {
    status: "pass" | "warning" | "revise";
    warnings: ValidationWarning[];
  };
  imagePrompt: string;
  imageUrl?: string;
};
