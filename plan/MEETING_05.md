# Buổi 5 - Đánh giá, khóa scope và chuẩn bị submission

Thuộc dự án: **AI Arena HALlucination**
Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu

Checkpoint 5 hoàn thành khi core flow được đánh giá bằng bộ 15-20 case có thể tái chạy, prompt/contract production được khóa, lỗi còn lại được phân loại và đội có bản nháp submission cùng demo script. Không thêm feature mới ngoài sửa lỗi ảnh hưởng demo hoặc tính đúng đắn văn hóa.

## 2. Baseline từ Meeting 04

- Recommendation → Critic → image/fallback → Passport → remix → Critic recheck đã nối end-to-end.
- Passport hiển thị approved provenance và disclaimer; raw image prompt không xuất hiện ở UI người dùng.
- Image provider có timeout, safety/error mapping và fallback; ảnh thật còn phụ thuộc cấu hình provider.
- 165/165 unit tests, data validation, targeted lint và typecheck pass tại integration review.
- 8/8 live remix/Critic cases khớp expected outcome; image calls trong artefact trả `not_configured` minh bạch.

## 3. Scope khóa

Trong Meeting 05 chỉ làm:

- regression và evaluation;
- sửa blocker của core flow;
- khóa prompt, schema và fallback policy;
- hoàn thiện tài liệu, demo script và nội dung submission.

Không làm virtual try-on, account, commerce, social, weather, animation phức tạp hoặc mở rộng garment ngoài bốn loại MVP.

## 4. Phân công

### Hiền - Product và Frontend

- [x] Chạy regression UX trên create → results → Passport → remix ở desktop và mobile.
- [x] Kiểm tra loading, retry, error, generated/fallback và không mất look gốc.
- [x] Kiểm tra accessibility cơ bản: label, keyboard focus, contrast và alt text.
- [ ] Chốt demo flow 2-3 phút; chuẩn bị screenshot/shot list theo đúng UI hiện tại.
- [ ] Chuẩn bị preview/deploy candidate và ghi rõ cấu hình cần thiết, không đưa secret vào repo.

Tiến độ Hiền ngày 2026-10-08: `docs/ux-regression-report.md` ghi 32/32 case live pass và một generated-image case N/A; `docs/accessibility-audit.md` đã được đối chiếu với code và các issue label/live-region/contrast được sửa khi integration. Chưa có screenshot hoặc URL preview nên demo-flow confirmation và deploy candidate vẫn chưa hoàn tất. Shot list chuẩn dùng `docs/demo-script-shot-list.md`; không dùng giả định palette/phụ kiện tự động tạo warning ngoài rule đã evaluation.

### Lan Anh - AI và Backend

- [x] Hợp nhất bộ evaluation thành 15-20 case phủ intent, recommendation, Critic, image và remix.
- [x] Chạy evaluation với env hợp lệ; ghi model, prompt hash, thời gian, kết quả và fallback.
- [x] Nếu image provider được cấu hình, chạy tối thiểu một success case và các failure path an toàn; nếu chưa có, ghi blocker rõ ràng. → **Blocker P2**: `GEMINI_IMAGE_MODEL` chưa cấu hình; fallback `not_configured` minh bạch; không có generated-image evidence.
- [x] Khóa prompt/schema production; chỉ sửa khi có case thất bại và ghi lý do trong `docs/ai-log.md`.
- [x] Kiểm tra timeout, latency, error mapping, secret exposure và log hygiene.

### Linh - Cultural Data và Submission

- [x] Adjudicate cultural correctness cho toàn bộ 15-20 case; ghi expected/actual/verdict và lý do.
- [x] Review riêng mọi ảnh thật theo rubric bốn garment — N/A: artefact có 0 ảnh generated và chỉ có fallback `not_configured`; gate tự mở lại nếu có ảnh thật. Không dùng ảnh AI làm bằng chứng lịch sử.
- [x] Kiểm tra citation/source link, garment scope và các source còn `needs_review`; không nâng trạng thái nếu chưa đối chiếu.
- [x] Soạn bản nháp submission: problem, approach, cultural safeguards, Gemini usage, evaluation, limitation và impact.
- [x] Soạn demo script/shot list cùng Hiền; chọn case pass, warning và fallback minh bạch.

Kết quả Linh, cập nhật ngày 2026-10-08:

- `docs/meeting-05-cultural-adjudication.json`: 19 case có expected/actual/verdict/rationale và evidence; bao phủ toàn bộ 16 case consolidated cùng ba regression case bổ sung.
- `scripts/validate-meeting-05-cultural-review.ts`: kiểm tra coverage, duplicate ID, source/rule approval và garment scope.
- `docs/meeting-05-cultural-review.md`: cultural/source audit; không có P0/P1, còn một P2 về image provider/live visual review.
- `docs/submission-draft.md` và `docs/demo-script-shot-list.md`: bản nháp handoff cho Meeting 06.
- Image review được đóng N/A cho artefact hiện tại vì có 0 ảnh generated; nếu provider tạo ảnh thật, Linh phải review bổ sung trước khi dùng ảnh trong demo/submission.

## 5. Evaluation matrix tối thiểu

| Nhóm | Số case tối thiểu | Điều cần chứng minh |
| --- | ---: | --- |
| Intent | 3 | Parse đúng, input thiếu/độc hại fail an toàn |
| Recommendation | 4 | Đúng ba looks, source hợp lệ, đủ bốn garment |
| Cultural Critic | 4 | Pass/warning/revise và rule provenance đúng |
| Image | 2 | Generated hoặc fallback minh bạch; không lộ secret |
| Remix | 3 | Whitelist, validation mới, lỗi không làm mất look gốc |

Tổng bộ chính thức: **15-20 case**, không đếm unit test kỹ thuật như evaluation case sản phẩm.

## 6. Gate sửa lỗi và khóa prompt

- `P0`: lộ secret, citation giả, bỏ qua Critic hoặc fake success — phải sửa trước demo.
- `P1`: core flow hỏng, provenance sai, remix dùng validation cũ — phải sửa trong Meeting 05.
- `P2`: lỗi UX nhỏ hoặc chất lượng ảnh không chặn demo — ghi limitation, chỉ sửa nếu rủi ro thấp.
- Sau khi evaluation pass, ghi prompt hash/version; thay đổi tiếp theo phải kèm case tái hiện và chạy lại tập liên quan.

## 7. Kiểm tra trước khi đóng checkpoint

```bash
npm run validate:data
npm test
npm run lint
npm run typecheck
npm run build
```

Các lệnh live evaluation cần `.env.local`; không commit key, raw provider payload hoặc ảnh có dữ liệu nhạy cảm.

## 8. Definition of Done

- [x] Có artefact 15-20 case với expected, actual, verdict và reviewer.
- [x] Bốn garment đều có cultural coverage; pass, warning và failure/fallback đều được chứng minh.
- [x] Không còn lỗi P0/P1; P2 còn lại có owner và limitation rõ ràng.
- [x] Prompt/schema production có version/hash và không còn thay đổi chưa đánh giá.
- [ ] Preview/demo candidate chạy được bằng hướng dẫn trong repo.
- [x] Bản nháp submission, demo script và shot list đã sẵn sàng cho Meeting 06.
- [ ] Cả ba owner review artefact và đồng ý khóa scope.

## 9. Handoff sang Meeting 06

- Demo URL và cấu hình deploy đã xác minh.
- Evaluation artefact cuối, prompt versions và cultural review.
- Video script, shot list, screenshots và bản nháp submission.
- Danh sách limitation/fallback được trình bày trung thực.
- Checklist repo, Gemini conversation và bằng chứng nộp bài.

## 10. Trạng thái checkpoint

- [x] Đã lập kế hoạch.
- [x] Đang thực hiện (Lan Anh hoàn thành phần AI & Backend — 2026-10-08).
- [ ] Chưa hoàn thành (chờ Hiền chốt screenshot/demo flow, preview URL và cả đội sign-off).
- [ ] Hoàn thành.
- [x] Có blocker cần xử lý: **P2** — `GEMINI_IMAGE_MODEL` chưa cấu hình; generated-image success case không thể chứng minh. Ghi rõ limitation trong `docs/ai-log.md` và `docs/meeting-05-ai-evaluation.json`.
