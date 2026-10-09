# Meeting 06 - Cultural sign-off

Owner: **Diệu Linh**  
Ngày rà soát: **2026-10-10**  
Trạng thái: **Pass với limitation image provider đã chấp nhận**

## Phạm vi đã rà soát

- Submission copy trong `docs/submission-draft.md`.
- Kịch bản và case demo trong `docs/demo-script-shot-list.md`.
- Artefact tổng hợp `docs/meeting-05-ai-evaluation.json` và cultural adjudication `docs/meeting-05-cultural-adjudication.json`.
- Catalog nguồn `data/sources/references.json` và quy tắc production đã review.

## Kết luận

Nội dung hiện tại đủ điều kiện cultural sign-off cho submission candidate. Wording giữ đúng phạm vi nguồn, không nâng hai nguồn `needs_review` thành bằng chứng production và không mô tả fallback như ảnh generated. Nếu team tạo ảnh mới sau mốc review này, sign-off ảnh phải được mở lại trước khi ảnh xuất hiện trong video hoặc submission.

## Số liệu và provenance đã khóa

| Hạng mục | Giá trị đã đối chiếu | Artefact |
| --- | --- | --- |
| Consolidated evaluation | 16/16 pass | `docs/meeting-05-ai-evaluation.json` |
| Cultural adjudication | 19 case; đủ 4 garment | `docs/meeting-05-cultural-adjudication.json` |
| Source production | 6 `approved`; 2 `needs_review` bị loại khỏi retrieval | `data/sources/references.json` |
| Image provider | Chưa cấu hình; mode `disabled_for_critic_only_evaluation` | `docs/meeting-05-ai-evaluation.json` |
| Intent prompt SHA-256 | `e1db57e798e86952510d399103d176b2874a11d4dee8fb46ab00d461ece4cb89` | `prompts/intent/intent-v1.md` |
| Critic prompt SHA-256 | `6fcd7d3d595b94a799e17a50e1f3bd123e60ae92269f82c9bbd5dbda6b9ae0fa` | `prompts/critic/critic-v1.md` |
| Image prompt SHA-256 | `ef2f9343cfb58376fa4be8e7d046baec6b11f3759ecc3eff0d86b010df059697` | `prompts/image/image-v1.md` |

Hai source còn `needs_review` là `VWM_AO_DAI` và `HMCC_NHAT_BINH_2022`. Không dùng hai source này để chứng minh cultural claim trong demo/submission cho tới khi có review riêng.

## Quyết định về ảnh

- Artefact hiện tại không có ảnh generated; ba cultural image cases ghi fallback `not_configured`.
- Review visual theo rubric bốn garment: **N/A cho candidate hiện tại**.
- Nếu production có provider hợp lệ và sinh ảnh mới: Lan Anh bàn giao output, Linh review từng ảnh và ghi verdict trước khi Hiền quay/chèn vào video.
- Được gọi output hiện tại là “fallback minh bạch”; không được gọi là “ảnh AI đã tạo”, “hiện vật” hoặc “phục dựng xác thực”.

## Wording được phép và không được phép

Được phép:

- “Nguồn mô tả hiện vật/biến thể này…”
- “Critic cảnh báo claim vượt quá phạm vi nguồn…”
- “Prototype bao phủ bốn garment MVP trong KB đã review.”

Không được phép:

- Khái quát màu, motif, phẩm cấp hoặc bối cảnh của một hiện vật thành quy tắc cho mọi biến thể.
- Dùng source `needs_review` như bằng chứng đã xác minh.
- Tuyên bố ảnh fallback là output generated hoặc phục dựng lịch sử chính xác.
- Nói hệ thống thay thế chuyên gia/xác thực hiện vật.

## Link readiness

| Link/evidence | Owner | Trạng thái tại thời điểm sign-off |
| --- | --- | --- |
| Repository | Team | Đã ghi URL trong submission candidate |
| Final evaluation artefact | Lan Anh | Đã có file local, 16/16 pass |
| Cultural sign-off | Linh | Hoàn tất tại file này |
| Public demo URL + deployed SHA | Hiền | Chờ bàn giao |
| Video URL | Hiền | Chờ bàn giao |
| Gemini conversation URL | Lan Anh | Chờ bàn giao |
| Submission confirmation | Cả đội | Chờ nộp form |

Các link public phải được mở thử ở chế độ không đăng nhập khi phù hợp. Chưa có link thì giữ trạng thái pending; không dùng URL mẫu hoặc screenshot giả.
