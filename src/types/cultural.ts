export type ReviewStatus = "draft" | "needs_review" | "approved";

export type CulturalGarment = {
  id: string;
  name: string;
  summary: string;
  recognizable_features: string[];
  preserve_rules: string[];
  flexible_elements: string[];
  compatible_occasions: string[];
  source_ids: string[];
  status: ReviewStatus;
};

export type CulturalSource = {
  id: string;
  publisher: string;
  title: string;
  url: string;
  accessed_at: string;
  source_type: "museum" | "heritage_authority" | "academic_journal";
  garment_ids: string[];
  status: "needs_review" | "approved";
};

export type CulturalRuleType = "preserve" | "flexible" | "context" | "note";
export type CulturalConfidence = "low" | "medium" | "high";

export type CulturalKnowledgeRecord = {
  id: string;
  garment: string;
  category: "history" | "structure" | "accessory" | "occasion" | "warning";
  fact: string;
  rule_type: CulturalRuleType;
  source_id: string;
  publisher: string;
  url: string;
  confidence: CulturalConfidence;
  reviewed: boolean;
  enforcement: "advisory" | "hard";
  notes: string;
};
