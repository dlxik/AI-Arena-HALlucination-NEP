export type ReviewStatus = "draft" | "needs_review" | "approved";
export type SourceReviewStatus = Exclude<ReviewStatus, "draft">;
export type CulturalConfidence = "low" | "medium" | "high";

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
  categories: string[];
  usable_knowledge: string[];
  reliability: CulturalConfidence;
  notes: string;
  status: SourceReviewStatus;
};

export type CulturalRuleType =
  | "preserve"
  | "flexible"
  | "context"
  | "warning";

export type CulturalKnowledgeRecord = {
  id: string;
  garment: string;
  category: "history" | "structure" | "accessory" | "occasion" | "warning";
  component: string;
  attribute: string;
  fact: string;
  rule_type: CulturalRuleType;
  condition: string;
  constraint: "allowed" | "discouraged" | "forbidden" | "contextual";
  action: string;
  explanation: string;
  source_ids: string[];
  publisher: string;
  url: string;
  confidence: CulturalConfidence;
  verification_status: "needs_review" | "verified";
  reviewed: boolean;
  enforcement: "advisory" | "hard";
  notes: string;
};

export type CulturalKnowledgeBase = {
  garments: CulturalGarment[];
  sources: CulturalSource[];
  records: CulturalKnowledgeRecord[];
};

export type CulturalGarmentCandidate = {
  garment: CulturalGarment;
  selectionReason: string;
};

export type CulturalContext = {
  garmentCandidates: CulturalGarmentCandidate[];
  records: CulturalKnowledgeRecord[];
  sources: CulturalSource[];
  policy: {
    eligibleGarmentStatuses: Array<"approved">;
    eligibleSourceStatuses: Array<"approved">;
    requiredRecordVerificationStatus: "verified";
    requireReviewedRecords: true;
    maxRecords: number;
    maxSources: number;
  };
};
