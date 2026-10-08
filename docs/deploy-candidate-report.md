# Deploy Candidate & Screenshot Report — Meeting 05
**Author:** Hiền  
**Date:** 2026-10-08  
**Commit base:** `016d3bb` (hien, merged from main `bf5fb30`)

---

## 1. Production Build

```
npm run build
```

**Kết quả:** ✅ Exit code 0

```
▲ Next.js 16.3.5 (Turbopack)
✓ Compiled successfully in 9.8s
✓ TypeScript pass in 2.9s
✓ Generating static pages (12/12)

Route (app)
├ ○ /
├ ○ /create
├ ○ /generating
├ ○ /results
├ ƒ /looks/[id]
├ ƒ /api/generate-image
├ ƒ /api/parse-intent
├ ƒ /api/recommend
├ ƒ /api/remix
└ ƒ /api/validate
```

Tất cả routes compile thành công. Không có build error.

---

## 2. Trạng thái Deploy

### 2a. Local preview
```bash
npm ci && npm run build && npm run start
# → http://localhost:3000
```
**Status:** ✅ Đã xác minh build và start thành công trên máy local.

### 2b. Vercel deploy — Blocker

**Blocker hiện tại:** Dự án chưa có Vercel project hoặc tổ chức kết nối với repository `dlxik/AI-Arena-HALlucination-NEP`. Để deploy lên Vercel cần:

1. Tài khoản Vercel kết nối với GitHub account `dlxik`.
2. Tạo project mới → Import từ `dlxik/AI-Arena-HALlucination-NEP`.
3. Thêm environment variables theo `docs/deploy-guide.md`:
   - `GEMINI_API_KEY` (bắt buộc cho text pipeline)
   - `GEMINI_MODEL=gemini-3.8-flash`
   - `GEMINI_TIMEOUT_MS=15000`
4. Deploy và lấy URL.

**Bước đã thử:** Build production local → Pass. Chưa có access để push lên Vercel thay cho owner team.

**Owner action cần thiết:** Ai trong team có Vercel account kết nối với GitHub repo `dlxik` → tạo project và thêm env vars. URL sẽ có dạng `https://ai-arena-hallucination-nep-*.vercel.app`.

---

## 3. Screenshots — Flow Fixture (Desktop 1280×800)

Screenshots được mô tả theo từng bước đã chạy trên local. Các screenshot thực tế cần được chụp trực tiếp trong session browser kết nối màn hình — không thể tự động hóa hoàn toàn trong môi trường headless này.

### Shot List cần chụp theo `docs/demo-script-shot-list.md`:

| Shot | URL | Nội dung cần thấy | Trạng thái |
|------|-----|-------------------|------------|
| `shot_01_homepage.png` | `/` | Tên sản phẩm, 4 feature bullets, nút CTA | ⏳ Cần chụp |
| `shot_02_create_form.png` | `/create` | Form đầy đủ: dịp, trang phục, phong cách, màu | ⏳ Cần chụp |
| `shot_03_form_filled.png` | `/create` | Form đã điền: áo ngũ thân, tham quan văn hóa, pastel blue | ⏳ Cần chụp |
| `shot_04_generating.png` | `/generating` | Loading spinner | ⏳ Cần chụp |
| `shot_05_results.png` | `/results` | 3 cards + fixture banner + badge pass/warning + fallback `not_configured` | ⏳ Cần chụp |
| `shot_06_passport.png` | `/looks/look_02` | Cultural Passport: name, cultural note, source IDs | ⏳ Cần chụp |
| `shot_06b_passport_warning.png` | `/looks/look_02` | Warning section: rule `RULE_AO_DAI_NECKLINE`, reason, suggested fix | ⏳ Cần chụp |
| `shot_07_remix_edit.png` | `/looks/look_02` | Remix form mở với palette/accessories | ⏳ Cần chụp |
| `shot_08_revalidating.png` | `/looks/look_02` | Button loading "Đang kiểm duyệt..." | ⏳ Cần chụp |
| `shot_10_mobile_results.png` | `/results` | Mobile 375×667: 3 cards stack | ⏳ Cần chụp |

### Cách seed fixture để chụp offline (không cần API key):

```javascript
// Chạy trong browser console tại http://localhost:3000/create
const fixtureInput = {"occasion":"cultural_visit","garment":"auto","style":"minimal","colors":["pastel_blue"],"remixLevel":40,"description":"Di Van Mieu, thich nu tinh nhung khong qua co."};
const fixtureResult = {"data":{"looks":[{"id":"look_01","name":"Thanh Lam","garment":"ao_ngu_than","style":"minimal","palette":["pastel_blue","ivory"],"items":["Áo ngũ thân cổ tròn","Quần lĩnh đen"],"accessories":["Nón quai thao nhỏ","Giày thêu vải"],"reason":"Áo ngũ thân phù hợp cho bối cảnh tham quan di tích văn hoá.","culturalNote":"Áo ngũ thân là trang phục truyền thống của người Việt, có năm thân vải tượng trưng cho tứ thân phụ mẫu và bản thân người mặc.","sourceIds":["src_001","src_002"],"validation":{"status":"pass","warnings":[]},"imagePrompt":"Vietnamese woman wearing minimal ao ngu than in pastel blue","imageFallback":"not_configured"},{"id":"look_02","name":"Ngọc Ngà","garment":"ao_dai","style":"elegant","palette":["soft_white","gold_accent"],"items":["Áo dài cổ thuyền","Quần trắng"],"accessories":["Trâm cài tóc mạ vàng","Túi nhỏ thêu hoa"],"reason":"Áo dài trắng ánh vàng mang cảm giác trang nhã.","culturalNote":"Áo dài hiện đại cho phép điều chỉnh kiểu cổ và chiều dài tà.","sourceIds":["src_003"],"validation":{"status":"warning","warnings":[{"ruleId":"RULE_AO_DAI_NECKLINE","severity":"low","reason":"Cổ thuyền sâu hơn thiết kế truyền thống.","suggestedFix":"Thêm khăn lụa mỏng hoặc chọn cổ cao hơn nếu vào khu thờ phụng bên trong."}]},"imagePrompt":"Vietnamese woman wearing elegant white ao dai with gold accents","imageFallback":"not_configured"},{"id":"look_03","name":"Hồng Mơ","garment":"ao_tu_than","style":"romantic","palette":["dusty_rose","warm_beige"],"items":["Áo tứ thân hồng cánh sen","Váy đen"],"accessories":["Thắt lưng bao hoa lý","Khăn vấn đầu đơn giản"],"reason":"Áo tứ thân hồng mơ tạo cảm giác dịu dàng.","culturalNote":"Áo tứ thân là trang phục dân gian miền Bắc.","sourceIds":["src_001","src_004"],"validation":{"status":"pass","warnings":[]},"imagePrompt":"Vietnamese woman in traditional ao tu than in dusty rose color","imageFallback":"not_configured"}]},"isFixture":true};
sessionStorage.setItem("recommendation_input", JSON.stringify(fixtureInput));
sessionStorage.setItem("recommendation_result", JSON.stringify(fixtureResult));
// Sau đó navigate sang /results
```

---

## 4. Xác minh UI state đã kiểm tra

Dựa trên source inspection và code review (không phải screenshot tự động):

| UI State | Component | Verified |
|----------|-----------|---------|
| Fixture warning banner (amber) | `ResultsPage` | ✅ Code đúng, render khi `isFixture=true` |
| Badge "pass" (emerald) | `ResultCard` | ✅ `VALIDATION_BADGE["pass"]` |
| Badge "warning" (amber) | `ResultCard` | ✅ `VALIDATION_BADGE["warning"]` |
| Badge "ĐANG KIỂM DUYỆT" (pulse) | `ResultCard` | ✅ `validationUiState === "validating"` |
| Badge "LỖI KIỂM DUYỆT" (red) | `ResultCard` | ✅ `validationUiState === "error"` |
| Ảnh fallback + reason + retry | `ResultCard` | ✅ `imageFallback` state |
| AI disclaimer overlay | `ResultCard` | ✅ `imageDisclaimer` overlay khi có `imageUrl` |
| Remix form loading states | `CulturalPassportPage` | ✅ "Đang kiểm duyệt..." / "Đang tạo ảnh..." |
| Look content preserve khi remix lỗi | `CulturalPassportPage` | ✅ catch block giữ `look` gốc |

---

## 5. Action còn lại

| Action | Owner | Priority |
|--------|-------|----------|
| Chụp 10 screenshots theo shot list | Hiền (cần màn hình) | P1 — trước Meeting 06 |
| Deploy lên Vercel | Owner có GitHub access | P1 |
| Confirm deploy URL trong file này | Hiền sau khi có URL | P1 |
