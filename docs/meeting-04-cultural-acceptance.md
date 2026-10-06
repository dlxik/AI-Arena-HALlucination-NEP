# Meeting 04 - Image, Passport và remix cultural acceptance

Owner: **Diệu Linh**
Ngày chuẩn bị: **2026-10-05**

## Artefact

File máy đọc được: `tests/fixtures/image-remix-cultural-cases.json`.

Artefact gồm:

- Rubric cho đủ bốn garment, phủ 14/14 knowledge rules.
- Yêu cầu provenance của Cultural Passport.
- Yêu cầu revalidation/regeneration sau remix.
- 8 cases: mỗi garment có một safe image case và một risky remix case.
- `case_review` là review expected behavior của Linh; `runtime_review` giữ `pending` cho tới khi image/remix implementation chạy được.

## Nguyên tắc review ảnh

Ảnh AI chỉ là **minh họa styling**, không phải:

- hiện vật lịch sử;
- bản phục dựng đã được cơ quan chuyên môn xác thực;
- nguồn để tạo thêm fact, rule, niên đại, phẩm cấp hoặc ý nghĩa motif;
- bằng chứng thay thế cho source trong Cultural KB.

### Mức đánh giá

| Verdict | Dùng khi |
| --- | --- |
| `pass` | Visual prompt/output giữ cue nhận diện trong phạm vi nguồn, context được ghi rõ và không tạo claim mới |
| `warning` | Có nguy cơ mất cue nhận diện, khái quát hiện vật/context, hoặc hình và text không thống nhất |
| `fail` | Sai garment rõ ràng, dùng source/rule không hợp lệ, gắn nhãn hiện vật/phục dựng xác thực sai, hoặc tái sử dụng validation cũ sau remix |
| `pending` | Chưa có output ảnh/remix thật để review |

Lỗi chất lượng ảnh như méo tay, bố cục xấu hoặc ảnh không tải được phải được ghi riêng với lỗi cultural fact. Một ảnh đẹp không thể làm cultural claim sai trở thành `pass`.

## Coverage

| Case | Garment | Loại | Expected | Rule chính |
| --- | --- | --- | --- | --- |
| `IR_M04_01_AO_DAI_IMAGE_SAFE` | Áo dài | Image | Pass | Flexible contemporary variation |
| `IR_M04_02_AO_DAI_REMIX_GENERALIZATION` | Áo dài | Remix | Warning | `AD_WARNING_SINGLE_FORM_GENERALIZATION` |
| `IR_M04_03_NGU_THAN_IMAGE_SAFE` | Áo ngũ thân | Image | Pass | Năm cúc phải + tay hẹp |
| `IR_M04_04_NGU_THAN_REMIX_STRUCTURE` | Áo ngũ thân | Remix | Warning | `ANT_STRUCTURE_FIVE_BUTTONS`, `ANT_STRUCTURE_NARROW_SLEEVES` |
| `IR_M04_05_TU_THAN_IMAGE_SAFE` | Áo tứ thân | Image | Pass | Bốn thân + context Kinh Bắc |
| `IR_M04_06_TU_THAN_REMIX_CONTEXT` | Áo tứ thân | Remix | Warning | `ATT_STRUCTURE_FOUR_PANELS`, `ATT_CONTEXT_KINH_BAC_FESTIVAL` |
| `IR_M04_07_NHAT_BINH_IMAGE_SAFE` | Nhật Bình | Image | Pass | Cổ đối khâm + contemporary variation |
| `IR_M04_08_NHAT_BINH_REMIX_RANK` | Nhật Bình | Remix | Warning | `NB_STRUCTURE_RECTANGULAR_COLLAR`, `NB_WARNING_ARTIFACT_MOTIF_GENERALIZATION` |

## Cultural Passport audit ngày 2026-10-05

File review: `src/components/cultural-passport/CulturalPassport.tsx`.

| Tiêu chí | Kết quả | Nhận xét |
| --- | --- | --- |
| Cultural note | Pass | Có section riêng và giữ nguyên nội dung look |
| Validation status/warnings | Pass | Có status, severity, rule ID, reason và suggested fix |
| Source ID | Pass | Hiển thị danh sách `sourceIds` |
| Source title | Pass | Resolve theo `sourceIds` từ `references.json` |
| Publisher | Pass | Hiển thị publisher của source đã duyệt |
| Safe clickable URL | Pass | Link mở tab mới với `noreferrer` |
| Garment/source approval | Pass | UI chỉ resolve source `approved` đúng garment; retrieval/runtime validation vẫn fail-closed |
| End-user content | Pass | Không còn hiển thị raw `imagePrompt` |
| AI-image disclaimer | Pass | Result card và Passport ghi rõ ảnh AI không phải hiện vật/phục dựng xác thực |

Kết luận sau integration review ngày 2026-10-06: Passport **đạt Definition of Done Meeting 04**. Source chưa duyệt hoặc sai garment không được trình bày như provenance hợp lệ.

## Remix/revalidation policy

Mỗi remix thay đổi `items`, `culturalNote`, `sourceIds`, `imagePrompt`, palette hoặc accessory phải tạo một look revision mới và:

1. Không mang theo verdict/warnings cũ như kết quả hợp lệ.
2. Chạy runtime input validation và Rule Retrieval đúng garment.
3. Chạy lại Cultural Critic; lưu actual status/rule IDs/suggested fixes mới.
4. Chỉ sau đó mới tạo lại ảnh hoặc fallback.
5. Nếu bất kỳ bước nào lỗi, giữ look gốc và không tạo fake success.

Artefact yêu cầu `must_revalidate: true`, `must_regenerate: true` và `reuse_previous_validation: false` cho mọi risky remix case.

## Provenance review

- Rubric và cases chỉ dùng source `approved` đúng garment.
- Mọi rule dùng trong expected warning đều `verified`, `reviewed: true` và đúng garment.
- `VWM_AO_DAI` và `HMCC_NHAT_BINH_2022` vẫn `needs_review`; không xuất hiện trong fixture Meeting 04.
- Source title/publisher/URL phải lấy từ server-side source catalog; client không được tự suy ra URL từ source ID.

## Runtime review ngày 2026-10-06

- 8/8 remix executions trả HTTP 200 và actual Critic status/rule IDs khớp expected outcome.
- Mỗi execution có `validationId` và `validatedAt` mới; orchestration chạy Critic trước bước ảnh.
- Bốn safe palette cases trả `pass`; bốn risky claim cases trả đúng `warning` và rule theo garment.
- Cả 8 image executions trả fallback `not_configured`. Đây là fallback minh bạch, không phải lỗi văn hóa và không có visual output để chấm thẩm mỹ/cấu trúc.
- UI gọi đúng `/api/remix`, không mang validation/image cũ vào payload và lưu validation/disclaimer mới từ server.

## Handoff

### Cho Hiền

- Meeting 05 cần regression test UX cho generated/fallback/remix và chụp screenshot luồng demo.

### Cho Lan Anh

- Meeting 05 cần chạy provider thật khi có cấu hình, nhưng vẫn giữ fallback và nguyên tắc không dùng ảnh làm nguồn cultural fact.

## Trạng thái runtime

- Image generation: `pass_with_fallback` — endpoint production có guardrails; artefact hiện dùng `not_configured`, chưa có ảnh thật để visual review.
- Remix/revalidation: `pass` — 8/8 case khớp expected status/rule IDs và có validation revision mới.
- Cultural Passport provenance: `pass` — metadata/link approved source và disclaimer đã hiển thị.
- Expected case design/provenance: `pass` — validator và cultural review hoàn tất.
