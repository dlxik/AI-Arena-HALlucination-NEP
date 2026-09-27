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

`POST /api/recommend` chỉ trả thành công sau khi output của Gemini qua runtime validation. Các ràng buộc checkpoint 2:

- `looks` có đúng 3 phần tử, ID và tên không trùng.
- `garment` và `style` là ID hợp lệ từ input/context đã retrieval.
- Mỗi palette có ít nhất một màu người dùng yêu cầu.
- Mỗi `sourceId` phải thuộc context approved đã retrieval và liên quan đến garment của look.
- Ba looks phải khác nhau về nội dung phối đồ.
- Vì Cultural Critic chưa được tích hợp, `validation` luôn là cảnh báo tạm `CULTURAL_CRITIC_PENDING`, không phải kết quả kiểm duyệt hoàn chỉnh.

Lỗi của endpoint recommendation:

| HTTP | Code | Ý nghĩa |
| --- | --- | --- |
| `400` | `INVALID_JSON` | Body không phải JSON hợp lệ. |
| `422` | `INVALID_INPUT` | Request không đúng `RecommendationInput` hoặc dùng ID không hỗ trợ. |
| `422` | `NO_CULTURAL_CONTEXT` | Không có garment/source approved hoặc record verified/reviewed đủ điều kiện; không fallback sang fixture. |
| `500` | `CULTURAL_DATA_ERROR` | Cultural KB không tải/validate an toàn được. |
| `500` | `INTERNAL_ERROR` | Lỗi nội bộ không thuộc các trường hợp đã phân loại. |
| `502` | `GEMINI_UPSTREAM_ERROR` | Gemini không phản hồi thành công. |
| `502` | `INVALID_MODEL_OUTPUT` | Output không qua runtime validation phía server. |
| `503` | `GEMINI_NOT_CONFIGURED` | Server chưa có `GEMINI_API_KEY`. |
| `504` | `GEMINI_TIMEOUT` | Gemini vượt quá thời gian chờ. |

## Endpoints

| Method | Path | Hiện tại |
| --- | --- | --- |
| `POST` | `/api/parse-intent` | Gọi Gemini và validate structured intent |
| `POST` | `/api/recommend` | Retrieval context, gọi Gemini Stylist và runtime-validate đúng 3 looks |
| `POST` | `/api/validate` | Trả cảnh báo mock về nguồn chưa duyệt |
| `POST` | `/api/generate-image` | Trả trạng thái `not_integrated` và placeholder |

Input JSON không hợp lệ trả `400`; input sai schema trả `422`.
