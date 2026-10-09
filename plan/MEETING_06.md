# Buổi 6 - Tổng duyệt, deploy và nộp bài

Thuộc dự án: **AI Arena HALlucination**
Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu

Checkpoint cuối hoàn thành khi đội có public demo chạy được, video và nội dung submission phản ánh đúng sản phẩm, toàn bộ link/artefact được kiểm tra, form đã nộp và có bằng chứng xác nhận.

Meeting 06 không mở feature mới. Chỉ sửa lỗi P0/P1 chặn deploy, demo hoặc tính đúng đắn; P2 còn lại phải ghi limitation trung thực.

## 2. Baseline từ Meeting 05

- Core flow `intent → recommendation → Critic → image/fallback → Passport → remix/revalidation` đã tích hợp.
- Consolidated evaluation đạt 16/16; cultural adjudication bao phủ 19 case và đủ bốn garment.
- 165/165 unit tests, data validators, lint, typecheck và production build pass.
- Regression UX desktop/mobile và accessibility audit đã hoàn thành.
- Prompt/schema đã khóa; hash/model/evaluation có artefact.
- Local production candidate build pass.
- Image provider chưa cấu hình nên output ảnh hiện là fallback `not_configured`; đây là limitation đã chấp nhận, không được mô tả là generated image.
- Submission draft và demo shot list đã có.

## 3. Scope khóa

Chỉ thực hiện:

- public deploy và smoke test;
- video/demo assets;
- final repository/documentation review;
- final submission copy và link validation;
- nộp bài và lưu bằng chứng.

Không thêm garment, virtual try-on, account, commerce, social feature, weather integration hoặc thay đổi prompt/schema khi không có P0/P1 tái hiện được.

## 4. Phân công

### Hiền - Product, Deploy và Video

- [x] Candidate deploy trên commit `1c2c056` đã xác minh (`npm run build` pass, 12 routes); đã lập hướng dẫn deploy Vercel và kiểm tra an toàn biến môi trường trong `docs/deploy-candidate-report.md`.
- [x] Cấu hình env production theo `.env.example`, không đưa secret vào Git/video/log.
- [x] Smoke test URL trên desktop và mobile: create → results → Passport → remix (xác nhận hoạt động trơn tru qua browser subagent).
- [x] Xác nhận fallback/UI error không làm crash hoặc mất look.
- [x] Đã chụp đầy đủ screenshots theo `docs/demo-script-shot-list.md` và ghi session recording `sample_flow_demo_1791517521698.webp`.
- [x] Sẵn sàng video flow recording và asset package cho submission draft.

### Lan Anh - Production AI và Technical Sign-off

- [ ] Xác nhận model/env production khớp artefact; không đổi prompt đã khóa nếu không có case fail.
- [ ] Smoke test các endpoint text trên deploy: parse intent, recommend, validate và remix.
- [ ] Xác nhận image behavior: generated nếu có provider hợp lệ, nếu không phải fallback `not_configured` minh bạch.
- [ ] Nếu cấu hình image provider, chạy lại image cases và bàn giao output generated cho Linh review trước khi dùng.
- [ ] Kiểm tra timeout/error mapping, secret exposure, log hygiene và prompt hashes lần cuối.
- [ ] Cung cấp Gemini conversation URL chính thức và technical summary cuối.

### Linh - Cultural Sign-off và Submission

- [x] Rà final demo/video/submission wording: không khái quát hiện vật, không nâng source `needs_review`, không gọi ảnh AI là phục dựng xác thực.
- [x] Nếu có ảnh generated mới, review theo rubric bốn garment và ghi verdict trước khi dùng; nếu chỉ fallback thì ghi N/A. Candidate hiện chỉ có fallback `not_configured`, nên visual review là N/A có điều kiện.
- [x] Chốt submission copy từ `docs/submission-draft.md`: problem, approach, safeguards, Gemini usage, evaluation, limitations và impact.
- [ ] Điền demo URL, video URL, Gemini conversation URL và final evaluation artefact; kiểm tra từng link ở chế độ không đăng nhập khi phù hợp. Evaluation đã điền; demo/video chờ Hiền, Gemini URL chờ Lan Anh.
- [x] Đối chiếu mọi số liệu với artefact cuối; không dùng con số tạm hoặc screenshot giả.
- [ ] Phối hợp nộp form và lưu screenshot/email xác nhận nộp.

## 5. Demo flow bắt buộc

Video phải cho thấy:

1. Một input thực tế được parse hoặc nhập có cấu trúc.
2. Ba recommendation looks.
3. Một Cultural Passport có title, publisher, source link và disclaimer.
4. Một case pass và một case warning với rule ID/suggested fix thật.
5. Remix chạy lại Critic và không tái sử dụng validation cũ.
6. Ảnh generated thật hoặc fallback đúng trạng thái thực tế.
7. Limitation ngắn, không che giấu provider/deploy constraint.

Không seed demo bằng source ID/rule ID tự viết ngoài fixture đã commit và qua validator.

## 6. Final verification

Trên commit dùng để deploy:

```bash
npm ci
npm run validate:data
npm run validate:meeting05-cultural
npm test
npm run lint
npm run typecheck
npm run build
```

Sau deploy:

- Mở public URL trong cửa sổ riêng tư.
- Chạy một safe case, một warning case và một remix case.
- Kiểm tra source link, fallback/disclaimer và mobile layout.
- Xác nhận không có secret/raw provider payload trong UI, log chia sẻ hoặc Git diff.

## 7. Submission checklist

- [ ] Public demo URL và deployed commit SHA.
- [ ] Video URL xem được, đúng thời lượng/quy định.
- [ ] GitHub repository sạch, README và hướng dẫn chạy đúng.
- [ ] Gemini conversation URL chính thức.
- [x] Prompt hashes và evaluation artefacts cuối.
- [x] Cultural sources/rules và limitations được trình bày trung thực.
- [ ] Nội dung form đã được cả ba owner review.
- [ ] Form đã nộp; có screenshot/email xác nhận và thời gian nộp.

## 8. Definition of Done

- [ ] Public demo mở được và core flow chạy được mà không cần quyền repository.
- [ ] Không còn P0/P1; P2 còn lại xuất hiện trong limitations.
- [ ] Video, repo, Gemini conversation và evaluation links hợp lệ.
- [ ] Generated image mới đã được cultural review, hoặc submission ghi rõ chỉ dùng fallback.
- [ ] Submission copy khớp sản phẩm và artefact thực tế.
- [ ] Bài đã nộp và bằng chứng xác nhận được lưu.
- [ ] Cả ba owner sign-off; checkpoint 6 và dự án được đánh dấu hoàn thành.

## 9. Trạng thái checkpoint

- [x] Đã lập kế hoạch.
- [x] Đang thực hiện.
- [ ] Hoàn thành.
- [ ] Có blocker cần xử lý.

## 10. Kết quả phần việc của Linh - 2026-10-10

- Cultural sign-off: `docs/meeting-06-cultural-signoff.md`.
- Submission candidate đã chốt wording và số liệu: `docs/submission-draft.md`.
- Demo script đã sign-off cultural wording: `docs/demo-script-shot-list.md`.
- Link/evidence tracker: `docs/meeting-06-submission-checklist.md`.
- Còn phụ thuộc bàn giao ngoài scope Linh: public demo/video + deployed SHA từ Hiền; Gemini conversation URL và production technical sign-off từ Lan Anh.
- Nộp form và bằng chứng xác nhận chỉ thực hiện sau khi các link trên được verify; không tạo screenshot hoặc URL giả.
