# Deploy candidate report — Meeting 06

Owner: **Hiền**

Review date: **2026-10-09**
Source commit: `1c2c056` (merged with main)

---

## 1. Candidate đã xác minh (Meeting 06)

Toàn bộ verification suite đã chạy thành công trên commit khóa:

```text
npm run validate:data              -> PASS (tất cả records hợp lệ)
npm run validate:meeting05-cultural -> PASS (19/19 cultural cases hợp lệ)
npm test                           -> PASS (165/165 tests pass)
npm run lint                       -> PASS (clean)
npm run typecheck                  -> PASS (clean)
npm run build                      -> PASS (Exit code 0, 12 static/dynamic routes)
```

Next.js 16.3.5 production build output:
```text
▲ Next.js 16.3.5 (Turbopack)
Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/generate-image
├ ƒ /api/parse-intent
├ ƒ /api/recommend
├ ƒ /api/remix
├ ƒ /api/validate
├ ○ /create
├ ○ /generating
├ ƒ /looks/[id]
└ ○ /results
```

Lệnh chạy production:
```bash
npm ci
npm run build
npm run start
```
Ứng dụng phục vụ tại `http://localhost:3000`.

---

## 2. Kết quả Smoke Test UI & End-to-End Flow

Smoke test đã chạy trực tiếp trên browser phiên làm việc Meeting 06 với các bước thực tế:

1. **Trang chủ (`/`)**:
   - Tiêu đề sản phẩm, 4 điểm nhấn tính năng, nút CTA **Tạo bản phối →** và **Xem bản phối mẫu**.
   - Bấm **Xem bản phối mẫu** điều hướng trực tiếp sang `/results?sample=1`.
2. **Trang kết quả (`/results?sample=1`)**:
   - Banner cảnh báo fixture minh bạch hiển thị: `📋 Đây là bản phối mẫu (fixture)...`.
   - Đủ 3 cards:
     - Look 1: **Thanh Lam** (Áo ngũ thân, badge PASS).
     - Look 2: **Ngọc Ngà** (Áo dài, badge WARNING).
     - Look 3: **Hồng Mơ** (Áo tứ thân, badge PASS).
3. **Cultural Passport (`/looks/look_02`)**:
   - Hiển thị đầy đủ thông tin trang phục, cultural note, source citations.
   - Hộp cảnh báo Critic độc lập hiển thị rõ `RULE_AO_DAI_NECKLINE`, severity `low`, lý do và gợi ý sửa.
   - Nút **Chỉnh sửa** mở form Remix cho phép sửa bảng màu và phụ kiện.
4. **Form tạo bản phối (`/create`)**:
   - Đủ các trường: dịp sử dụng, loại trang phục, phong cách, slider mức độ remix (0–100), bảng màu và mô tả tự do.
5. **Khả năng chịu lỗi (Fallback & Error Invariants)**:
   - Khi API gặp sự cố hoặc rate limit, hệ thống trả mã lỗi chuẩn `GEMINI_UPSTREAM_ERROR` mà không crash frontend.
   - Khi chưa cấu hình image provider, hệ thống trả fallback `not_configured` minh bạch và giữ nguyên nội dung look/validation.
   - Khi truy cập trực tiếp URL look mẫu `/looks/look_02`, hệ thống tự động tải fixture hợp lệ thay vì báo hết phiên.

---

## 3. Bằng chứng Screenshots & Browser Recording

Các screenshot và video recording đã được chụp trực tiếp từ browser engine:

| Shot | File Artifact | Mô tả nội dung |
|---|---|---|
| `shot_01_homepage` | `shot_01_homepage_1791517539343.png` | Banner, 4 highlight bullets, nút CTA |
| `shot_02_create_form` | `shot_02_create_form_1791517793459.png` | Form tạo bản phối với đầy đủ inputs |
| `shot_05_results` | `shot_05_results_1791517578557.png` | 3 cards (Thanh Lam, Ngọc Ngà, Hồng Mơ) + fixture warning banner |
| `shot_06_passport` | `shot_06_passport_1791517719011.png` | Cultural Passport: Ngọc Ngà, warning `RULE_AO_DAI_NECKLINE`, source links |
| `shot_07_remix_edit` | `shot_07_remix_edit_1791517762075.png` | Form chỉnh sửa Remix mở tại Look 2 |
| **Session Recording** | `sample_flow_demo_1791517521698.webp` | Toàn bộ phiên tương tác thực tế từ `/` qua `/results` tới Passport và Remix |

---

## 4. Hướng dẫn Deploy lên Vercel (Dành cho Repo Owner)

Vì việc tạo public deployment trên Vercel yêu cầu tài khoản GitHub của owner (`dlxik`) kết nối Vercel dashboard:

1. Đăng nhập [vercel.com](https://vercel.com) với tài khoản có quyền truy cập repo `dlxik/AI-Arena-HALlucination-NEP`.
2. Bấm **Add New...** → **Project** → chọn `AI-Arena-HALlucination-NEP`.
3. Giữ nguyên preset **Next.js**.
4. Cấu hình biến môi trường theo `.env.example`:
   - `GEMINI_API_KEY`: API key chính thức của cuộc thi.
   - `GEMINI_MODEL`: `gemini-3.8-flash`.
   - `GEMINI_TIMEOUT_MS`: `15000`.
   - *(Tùy chọn)* `IMAGE_PROVIDER=gemini` và `GEMINI_IMAGE_MODEL` nếu bật tạo ảnh.
5. Bấm **Deploy**.
6. Điền URL nhận được vào `docs/submission-draft.md` và `plan/MEETING_06.md`.

---

## 5. Kết luận

- Production build & test suite: **100% PASS** (165/165 tests, lint clean, typecheck clean).
- Smoke test UI & Cultural Passport flow: **Hoàn tất và xác nhận**.
- Demo assets & recording: **Đã chụp và lưu artifact**.
- Bảo mật: Không đưa API key hay secret vào Git diff hay log.
