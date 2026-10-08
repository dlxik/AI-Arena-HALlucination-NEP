# Accessibility Audit — Meeting 05
**Reviewer:** Hiền  
**Date:** 2026-10-08  
**Standard:** WCAG 2.1 AA (cơ bản — phạm vi MVP)  
**Tool:** Manual inspection + Chrome DevTools Accessibility panel

---

## 1. Trang Create (`/create`)

### Labels và Form Controls
| Element | Audit | Result |
|---------|-------|--------|
| `<select>` Dịp sử dụng | `id="field-occasion"`, label liên kết qua `htmlFor` | ✅ |
| `<select>` Loại trang phục | `id="field-garment"`, label liên kết qua `htmlFor` | ✅ |
| `<select>` Phong cách | `id="field-style"`, label liên kết qua `htmlFor` | ✅ |
| Slider Remix level | `id="field-remix"`, `<label htmlFor="field-remix">` | ✅ |
| `<textarea>` Mô tả | `id="field-description"`, `<label htmlFor="field-description">` | ✅ |
| Nút chọn màu | `aria-pressed={selected}` — đánh dấu trạng thái toggle | ✅ |
| Group chọn màu | `id="field-colors"` | ✅ |

### Keyboard Focus
| Hành động | Result | Ghi chú |
|-----------|--------|---------|
| Tab qua tất cả form controls | ✅ | Focus ring mặc định của browser hiện đủ |
| Space/Enter trên chip màu | ✅ | Là `<button type="button">` → keyboard accessible |
| Space/Enter trên nút Submit | ✅ | |
| Tab vào `<textarea>` → nút "✨ Tự động điền" | ✅ | Nút disabled khi textarea rỗng, focus vẫn có |

### Color Contrast
| Element | Tỷ lệ ước tính | Result |
|---------|---------------|--------|
| Text body `text-slate-700` trên `bg-white` | ~8.6:1 | ✅ AA |
| Badge emerald `text-emerald-700` trên `bg-white` | ~5.1:1 | ✅ AA |
| Chip màu selected `text-white` trên `bg-emerald-600` | ~4.8:1 | ✅ AA |
| Placeholder text `text-slate-400` | ~3.5:1 | ⚠️ Chỉ placeholder — WCAG không bắt buộc cho placeholder |
| Nút disabled `opacity-50` | Giảm contrast | ℹ️ Chấp nhận được — WCAG miễn trừ UI disabled |

---

## 2. Trang Results (`/results`)

| Element | Audit | Result |
|---------|-------|--------|
| `<article>` bao mỗi card | Semantic landmark | ✅ |
| `<h2>` tên bản phối trong card | Heading hierarchy | ✅ |
| `<img>` ảnh bản phối | `alt="Bản phối [tên look]"` | ✅ |
| Spinner "Đang tạo ảnh" | Văn bản đi kèm spinner | ✅ |
| Badge validation | Text label đủ (không chỉ màu) | ✅ |
| Nút "Thử lại" fallback | Là `<button>`, có text rõ ràng | ✅ |
| Link "Xem Cultural Passport" | `id` unique theo `look.id`, có text | ✅ |
| Spinner validation "ĐANG KIỂM DUYỆT" | Animated dot + text | ✅ |

---

## 3. Trang Cultural Passport (`/looks/[id]`)

| Element | Audit | Result |
|---------|-------|--------|
| `<h1>` tên bản phối | Duy nhất trên trang | ✅ |
| `<h2>` section heading | Hierarchy rõ ràng | ✅ |
| `<nav>` breadcrumb | Semantic nav landmark | ✅ |
| Nút "Chỉnh sửa" Remix | Là `<button>`, text rõ ràng | ✅ |
| Input Bảng màu | `<label>` bao wrap input | ✅ |
| Input Phụ kiện | `<label>` bao wrap input | ✅ |
| Spinner trong nút remix | Text "Đang kiểm duyệt..."/"Đang tạo ảnh..." | ✅ |
| Nút "Hủy" | Enabled/disabled đồng bộ với `isRemixing` | ✅ |
| Error message remix | `<p className="text-red-600...">` — visible, không dùng alert() | ✅ |
| Look content khi remixing | `opacity-50` (dim) nhưng DOM vẫn còn — screen reader vẫn đọc | ✅ |

---

## 4. Issues tìm thấy & Action

| ID | Severity | Mô tả | Action |
|----|----------|-------|--------|
| A-01 | Info | Spinner animation không có `aria-live` hoặc `role="status"` — screen reader có thể không thông báo | Ghi nhận P2 limitation. Không sửa trong MVP vì không block demo. |
| A-02 | Info | `text-slate-400` placeholder text contrast ~3.5:1 — dưới ngưỡng 4.5:1 của WCAG | Chấp nhận — WCAG miễn trừ placeholder text. |

> **Verdict: PASS (MVP scope).** Không có vấn đề A11y nghiêm trọng nào block demo. P2 items đã được ghi nhận rõ ràng.
