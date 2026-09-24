# API contract

Mọi endpoint trả một trong hai envelope:

```ts
type Success<T> = { success: true; data: T };
type Failure = { success: false; error: { code: string; message: string } };
```

## Intent parser

`POST /api/parse-intent`

Request:

```json
{
  "description": "Đi Văn Miếu, thích nữ tính nhưng không quá cổ."
}
```

Response thành công chứa một `RecommendationInput` đã chuẩn hóa. Các ID hợp lệ trong MVP:

- `occasion`: `tet`, `cultural_visit`, `festival`, `photoshoot`, `casual`.
- `garment`: `auto`, `ao_dai`, `ao_ngu_than`, `ao_tu_than`, `nhat_binh`.
- `style`: `traditional`, `minimal`, `elegant`, `romantic`, `street`.
- `colors`: từ một đến bốn ID màu dạng ASCII `snake_case`.
- `remixLevel`: số nguyên từ `0` đến `100`.

Lỗi của endpoint:

| HTTP | Code | Ý nghĩa |
| --- | --- | --- |
| `400` | `INVALID_JSON` | Body không phải JSON hợp lệ. |
| `422` | `INVALID_INPUT` | `description` thiếu, sai kiểu hoặc ngoài giới hạn độ dài. |
| `502` | `GEMINI_UPSTREAM_ERROR` | Gemini không phản hồi thành công. |
| `502` | `INVALID_MODEL_OUTPUT` | Output không qua được validation phía server. |
| `503` | `GEMINI_NOT_CONFIGURED` | Server chưa có `GEMINI_API_KEY`. |
| `504` | `GEMINI_TIMEOUT` | Gemini vượt quá thời gian chờ. |

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

## Endpoints

| Method | Path | Hiện tại |
| --- | --- | --- |
| `POST` | `/api/parse-intent` | Gọi Gemini và validate structured intent |
| `POST` | `/api/recommend` | Validate input và trả fixture 3 looks |
| `POST` | `/api/validate` | Trả cảnh báo mock về nguồn chưa duyệt |
| `POST` | `/api/generate-image` | Trả trạng thái `not_integrated` và placeholder |

Input JSON không hợp lệ trả `400`; input sai schema trả `422`.
