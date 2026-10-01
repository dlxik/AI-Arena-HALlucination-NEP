# Prompt evaluation

- `intent-cases.json` chứa 5 golden cases tiếng Việt cho intent parser, gồm dữ liệu đầy đủ, thiếu trường, giá trị mặc định và prompt injection.
- `recommendation-cultural-cases.json` chứa 5 acceptance cases do Linh sở hữu, bao phủ 4 trang phục và `auto`, kèm expected record/source IDs và baseline cultural review.
- `critic-cultural-cases.json` chứa 8 backend evaluation inputs đầy đủ do Lan Anh chuẩn bị để handoff Linh, gồm valid/advisory mỗi garment và hồi quy Nhật Bình thiếu cổ. Không thay cho cultural approval của Linh.

- `npm test` dùng response Gemini giả lập để kiểm tra contract mà không gọi mạng.
- `npm run evaluate:intent` gọi model thật và so kết quả với golden cases. Lệnh này cần `GEMINI_API_KEY` trong `.env.local` và có thể phát sinh quota/chi phí API.
- `npm run evaluate:critic` chạy 8 Critic inputs qua handler `/api/validate` thật; thêm `-- --recommend` chạy cả 5 recommendation inputs qua handler `/api/recommend`. Dùng model/key/timeout từ `.env.local`, chỉ lưu validation/looks, provenance và error codes an toàn vào `docs/meeting-03-critic-evaluation.json`; không log key hay raw upstream error. Đây là backend evaluation, chưa có UI hoặc cultural reviewer approval.
- Thêm `--retry-failed` chỉ chạy lại case chưa pass trong báo cáo hiện tại với cùng model/prompt hash, giữ các kết quả pass và lịch sử lần lỗi. Nếu thay model/prompt thì phải chạy full evaluation.
- `npm run validate:data` kiểm tra source/record references, review metadata và coverage của 5 recommendation cultural cases mà không gọi API.

Baseline của recommendation cases ngày 2026-09-27 được đánh giá bằng fixture hiện tại vì `/api/recommend` chưa nối Retrieval + Stylist. Cả 5 case đều `fail` do `SOURCE_PLACEHOLDER`; phải cập nhật `baseline_review` bằng output thực sau khi endpoint được tích hợp.

Không đưa dữ liệu người dùng thật hoặc dữ liệu nhạy cảm vào golden cases đã commit.
