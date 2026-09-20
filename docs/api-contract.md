# API contract

Mọi endpoint trả một trong hai envelope:

```ts
type Success<T> = { success: true; data: T };
type Failure = { success: false; error: { code: string; message: string } };
```

## Recommendation input

```ts
type RecommendationInput = {
  occasion: string;
  garment: string | "auto";
  style: string;
  colors: string[];
  remixLevel: number; // 0..100
  description?: string;
};
```

## Recommendation output

```ts
type RecommendationOutput = { looks: OutfitLook[] };

type OutfitLook = {
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

type ValidationWarning = {
  ruleId: string;
  severity: "low" | "medium" | "high";
  reason: string;
  suggestedFix: string;
};
```

## Placeholder endpoints

| Method | Path | Hiện tại |
| --- | --- | --- |
| `POST` | `/api/parse-intent` | Trả structured intent cố định |
| `POST` | `/api/recommend` | Validate input và trả fixture 3 looks |
| `POST` | `/api/validate` | Trả cảnh báo mock về nguồn chưa duyệt |
| `POST` | `/api/generate-image` | Trả trạng thái `not_integrated` và placeholder |

Input JSON không hợp lệ trả `400`; recommendation input sai schema trả `422`.
