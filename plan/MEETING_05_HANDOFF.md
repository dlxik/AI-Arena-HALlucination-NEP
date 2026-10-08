# 📋 Việc còn lại — Buổi 5 (gửi Hiền & Linh)

> **Lan Anh đã xong phần AI & Backend.**
> Dưới đây là những việc hai bạn cần làm để đóng checkpoint Meeting 05.

---

## ✅ Context từ Lan Anh (đã xong — 2026-10-08)

- **165/165 unit tests** pass, lint ✓, typecheck ✓, build ✓
- **16/16 evaluation cases pass** (intent 3, recommendation 4, critic 4, image 2, remix 3)
  - Artefact: `docs/meeting-05-ai-evaluation.json`
  - Intent cases: `docs/meeting-05-intent-evaluation.json`
- Prompt đã **khóa** — không thay đổi thêm trừ khi có case thất bại
  - `prompts/intent/intent-v1.md` SHA-256: `e1db57e7...`
  - `prompts/critic/critic-v1.md` SHA-256: `6fcd7d3d...`
  - `prompts/image/image-v1.md` SHA-256: `ef2f9343...`
- **Blocker P2** (cần Hiền note vào demo): `GEMINI_IMAGE_MODEL` chưa cấu hình →
  image luôn `fallback/not_configured`; không có ảnh generated. Ghi limitation rõ.

---

## 🟡 Hiền — Product & Frontend

Cần hoàn thành trước khi đóng checkpoint:

- [ ] **Regression UX** — chạy flow đầy đủ: `create → results → Passport → remix`
  ở **cả desktop và mobile**
- [ ] Kiểm tra từng trạng thái:
  - Loading / retry / error
  - Generated image (hiện là fallback vì chưa có provider) — ghi rõ fallback UI
  - Không mất look gốc sau remix
- [ ] **Accessibility cơ bản**: label, keyboard focus, contrast, alt text
- [ ] **Chốt demo flow 2-3 phút** — screenshot/shot list đúng UI hiện tại
  - Phối hợp với Linh để chọn case pass + warning + fallback minh bạch
- [ ] **Preview/deploy candidate**: ghi rõ cấu hình cần thiết (`.env.example`),
  **không đưa secret vào repo**

> 💡 **Note cho Hiền**: Image hiện trả `fallback` (`not_configured`) — đây là behavior đúng,
> không phải lỗi. Demo cần trình bày fallback UI là một tính năng minh bạch, không phải bug.

---

## 🟡 Linh — Cultural Data & Submission

Cần hoàn thành trước khi đóng checkpoint:

- [ ] **Adjudicate cultural correctness** cho toàn bộ **16 cases** trong
  `docs/meeting-05-ai-evaluation.json`
  - Ghi: expected / actual / verdict / lý do cho từng case
  - Bốn garment cần có coverage: áo dài, áo ngũ thân, áo tứ thân, nhật bình
  - Cần có đủ 3 loại verdict: pass ✓, warning ⚠, failure/fallback ✗
- [ ] **Review ảnh thật** theo rubric bốn garment
  - **Không dùng ảnh AI làm bằng chứng lịch sử**
- [ ] Kiểm tra **citation/source link**, garment scope,
  các source còn `needs_review` — không nâng trạng thái nếu chưa đối chiếu thực tế
- [ ] **Soạn bản nháp submission** gồm:
  - Problem statement
  - Approach (pipeline: intent → recommend → Critic → image/fallback → remix)
  - Cultural safeguards
  - Gemini usage (model, prompts, structured output)
  - Evaluation results (16/16 pass — backend; cần Linh xác nhận cultural)
  - Limitation (image provider chưa cấu hình; ảnh AI không phải bằng chứng lịch sử)
  - Impact
- [ ] **Soạn demo script / shot list** cùng Hiền
  - Chọn ít nhất 1 case pass, 1 warning, 1 fallback minh bạch

> 💡 **Note cho Linh**: Artefact evaluation của Lan Anh (`docs/meeting-05-ai-evaluation.json`)
> ghi rõ: *"backend verdicts are not cultural approval"* — Linh cần review độc lập,
> không lấy verdict backend làm cultural sign-off.

---

## 🔴 Definition of Done (cả nhóm phải xong)

- [ ] Artefact 16 cases có expected / actual / verdict / **reviewer Linh**
- [ ] Bốn garment có cultural coverage; pass + warning + fallback đều được chứng minh
- [ ] Không còn lỗi P0/P1; P2 (image provider) có owner + limitation rõ ràng ← **đã ghi**
- [ ] Preview/demo candidate chạy được bằng hướng dẫn trong repo
- [ ] Bản nháp submission, demo script và shot list sẵn sàng cho Meeting 06
- [ ] **Cả ba owner** review artefact và đồng ý khóa scope

---

*Cập nhật lần cuối: 2026-10-08 11:23 — Lan Anh*
