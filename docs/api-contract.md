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

`POST /api/recommend` chỉ trả thành công sau khi output Stylist và cả ba kết quả Cultural Critic qua runtime validation. Các ràng buộc:

- `looks` có đúng 3 phần tử, ID và tên không trùng.
- `garment` và `style` là ID hợp lệ từ input/context đã retrieval.
- Mỗi palette có ít nhất một màu người dùng yêu cầu.
- Mỗi `sourceId` phải thuộc context approved đã retrieval và liên quan đến garment của look.
- Ba looks phải khác nhau về nội dung phối đồ.
- Mỗi look có validation thật theo rule retrieved. `CULTURAL_CRITIC_PENDING` chỉ tồn tại ở output nội bộ của Stylist, được thay trước response thành công.
- Ba Critic calls chạy đồng thời sau Stylist và dùng retrieval riêng theo garment. Khi một bước lỗi, toàn request trả failure envelope, không trả partial looks/pending/pass giả.

Lỗi của endpoint recommendation:

| HTTP | Code | Ý nghĩa |
| --- | --- | --- |
| `400` | `INVALID_JSON` | Body không phải JSON hợp lệ. |
| `422` | `INVALID_INPUT` | Request không đúng `RecommendationInput` hoặc dùng ID không hỗ trợ. |
| `422` | `NO_CULTURAL_CONTEXT` | Không có garment/source approved hoặc record verified/reviewed đủ điều kiện; không fallback sang fixture. |
| `422` | `NO_CULTURAL_RULES` | Không có rule verified + reviewed với toàn bộ source approved cho garment. |
| `422` | `INVALID_LOOK_SOURCE` | Look dùng source không approved hoặc sai garment. |
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
| `POST` | `/api/recommend` | Cultural Retrieval → Stylist → Rule Retrieval/Critic cho từng look → runtime validation |
| `POST` | `/api/validate` | Rule Retrieval và Gemini Critic độc lập cho một look hoàn chỉnh |
| `POST` | `/api/generate-image` | Trả trạng thái `not_integrated` và placeholder |

Input JSON không hợp lệ trả `400`; input sai schema trả `422`.

## Cultural validation — Meeting 03

`POST /api/validate` nhận:

```ts
type ValidationInput = {
  look: Omit<OutfitLook, "validation" | "imageUrl">;
  recommendationInput: RecommendationInput;
};
```

Có thể gửi nguyên `OutfitLook`: hai field `validation`/`imageUrl` cũ bị bỏ trước Critic. Mọi field khác phải đúng schema; không nhận rules, sources hoặc trusted context từ client. `sourceIds` trong look là citation cần kiểm tra, không phải nguồn đáng tin tự động. API tự retrieval KB phía server.

- Look bắt buộc có id kebab-case ≤64 ký tự, name ≤120, garment cụ thể (không `auto`), style hợp lệ, palette 1–4, items 1–8, accessories 0–6, sourceIds 1–4, reason/culturalNote ≤1000 và imagePrompt ≤1500. Các chuỗi không rỗng; phần tử mảng duy nhất và ≤200 ký tự.
- `recommendationInput` dùng cùng parser recommendation. Garment cụ thể phải khớp look (input `auto` được phép), style phải khớp và palette chứa ít nhất một màu yêu cầu.
- Rule Retrieval giữ toàn bộ records của garment `verified` + `reviewed`, có tất cả sources `approved` và đúng garment. Giữ conditional/context rules để phát hiện khái quát hóa sai ngay cả ở occasion khác. Critic đánh giá applicability bằng input và đầy đủ nội dung look.
- Source ID không tồn tại, chưa approved hoặc sai garment trả `422 INVALID_LOOK_SOURCE` trước model call; không dùng pseudo rule ID để biến lỗi citation thành cultural verdict.

Response thành công:

```json
{
  "success": true,
  "data": {
    "status": "warning",
    "warnings": [{
      "ruleId": "NB_STRUCTURE_RECTANGULAR_COLLAR",
      "severity": "medium",
      "reason": "Look được gọi là Nhật Bình nhưng chưa mô tả cổ đối khâm hình chữ nhật.",
      "suggestedFix": "Bổ sung mô tả cổ đối khâm hình chữ nhật và cúc cài chính giữa."
    }]
  }
}
```

Mapping runtime bắt buộc:

| Status | Warnings | Enforcement |
| --- | --- | --- |
| `pass` | Rỗng | Không có vi phạm đủ căn cứ trong rules retrieved |
| `warning` | Ít nhất một `low`/`medium`, không có `high` | Advisory mismatch hoặc thiếu context/chi tiết nhận diện |
| `revise` | Ít nhất một `high` | High chỉ được dùng cho rule `hard` có vi phạm rõ điều kiện |

Mỗi warning có ruleId duy nhất, đúng garment và thuộc tập retrieved; reason/suggestedFix không rỗng và ≤1000 ký tự. Extra fields, rule bịa, rule sai garment, severity/status mâu thuẫn hoặc advisory bị nâng high đều trả `502 INVALID_MODEL_OUTPUT`. KB hiện tại chỉ có advisory; test revise dùng KB snapshot riêng, không nâng enforcement production.

Validation dùng cùng bảng lỗi recommendation: `400 INVALID_JSON`, `422 INVALID_INPUT/NO_CULTURAL_CONTEXT/NO_CULTURAL_RULES/INVALID_LOOK_SOURCE`, `500 CULTURAL_DATA_ERROR/INTERNAL_ERROR`, `502 GEMINI_UPSTREAM_ERROR/INVALID_MODEL_OUTPUT`, `503 GEMINI_NOT_CONFIGURED`, `504 GEMINI_TIMEOUT`. Response không chứa prompt, raw upstream payload/status hay secret.
