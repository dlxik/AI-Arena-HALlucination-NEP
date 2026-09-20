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
  status: "needs_review" | "approved";
};
