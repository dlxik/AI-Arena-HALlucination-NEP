# Prompt evaluation

- `intent-cases.json` chứa 5 golden cases tiếng Việt cho intent parser, gồm dữ liệu đầy đủ, thiếu trường, giá trị mặc định và prompt injection.
- `recommendation-cultural-cases.json` chứa 5 acceptance cases do Linh sở hữu, bao phủ 4 trang phục và `auto`, kèm expected record/source IDs và baseline cultural review.
- `../fixtures/cultural-validation-cases.json` chứa ma trận 14 rules và 8 acceptance cases cho Cultural Critic Meeting 03; expected review không thay cho kết quả runtime.
- `../fixtures/image-remix-cultural-cases.json` chứa rubric 14 rules và 8 image/remix cultural cases Meeting 04; runtime review giữ `pending` tới khi image/remix flow hoàn thành.
- `critic-cultural-cases.json` chứa 8 backend evaluation inputs đầy đủ do Lan Anh chuẩn bị để handoff Linh, gồm valid/advisory mỗi garment và hồi quy Nhật Bình thiếu cổ. Không thay cho cultural approval của Linh.
- `image-remix-cases.json` chứa 8 cases Meeting 04: palette hợp lệ và accessory có claim mới rủi ro cho từng garment. Base look đều là valid Meeting 03; kỳ vọng warning phải đến từ nội dung mới, không verdict cũ. Hypotheses này vẫn cần Linh review.

- `npm test` dùng response Gemini giả lập để kiểm tra contract mà không gọi mạng.
- `npm run evaluate:intent` gọi model thật và so kết quả với golden cases. Lệnh này cần `GEMINI_API_KEY` trong `.env.local` và có thể phát sinh quota/chi phí API.
- `npm run evaluate:critic` chạy 8 Critic inputs qua handler `/api/validate` thật; thêm `-- --recommend` chạy cả 5 recommendation inputs qua handler `/api/recommend`. Dùng model/key/timeout từ `.env.local`, chỉ lưu validation/looks, provenance và error codes an toàn vào `docs/meeting-03-critic-evaluation.json`; không log key hay raw upstream error. Đây là backend evaluation, chưa có UI hoặc cultural reviewer approval.
- Thêm `--retry-failed` chỉ chạy lại case chưa pass trong báo cáo hiện tại với cùng model/prompt hash, giữ các kết quả pass và lịch sử lần lỗi. Nếu thay model/prompt thì phải chạy full evaluation.
- `npm run validate:data` kiểm tra source/record references, review metadata, ma trận/case Cultural Critic, image/remix rubric và coverage của 5 recommendation cultural cases mà không gọi API.
- `npm run evaluate:image-remix` gọi Critic thật qua remix handler, cố tình tắt ảnh và trả fallback/not_configured; ghi rõ chế độ vào `docs/meeting-04-image-remix-evaluation.json`. Thêm `-- --with-images` để gọi image provider theo `.env.local` (có quota/chi phí) và lưu ảnh vào `artifacts/meeting-04/` được Git ignore. Report chỉ lưu verdict, IDs, provenance, MIME/byte length/hash/path hoặc fallback reason, không key/base64/raw upstream payload. Full image run cần cả 8 ảnh generated để exit thành công; API orchestration vẫn chấp nhận fallback đúng contract. Live evidence không thay cultural review ảnh.

Baseline fixture của recommendation cases ngày 2026-09-27 được giữ để so sánh; kết quả live Meeting 02 nằm trong `live_review` của từng case. Cultural Critic cases giữ `runtime_review: pending` cho tới khi endpoint Critic được tích hợp.

Không đưa dữ liệu người dùng thật hoặc dữ liệu nhạy cảm vào golden cases đã commit.
