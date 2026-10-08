# UX Regression Report — Meeting 05
**Reviewer:** Hiền
**Date:** 2026-10-08
**Branch:** `origin/hien`
**Commit:** `016d3bb`

---

## 1. Phạm vi kiểm tra
Core flow: `Create → Generating → Results → Cultural Passport → Remix`

Hai ngữ cảnh kiểm tra:
- **Desktop:** Chromium 125, viewport 1280×800
- **Mobile:** DevTools mobile emulation — iPhone SE (375×667)

---

## 2. Regression Checklist

### 2.1 Trang Create (`/create`)

| # | Hành động | Desktop | Mobile | Ghi chú |
|---|-----------|---------|--------|---------|
| C-01 | Tải trang, kiểm tra form render | ✅ Pass | ✅ Pass | Tất cả label/input hiển thị đủ |
| C-02 | Bấm Submit khi chưa chọn màu | ✅ Pass | ✅ Pass | Nút disabled, text lỗi xuất hiện |
| C-03 | Chọn 3 màu → chip thứ 4 bị chặn | ✅ Pass | ✅ Pass | UI feedback rõ |
| C-04 | Nhập description → bấm "✨ Tự động điền" | ✅ Pass | ✅ Pass | Loading state hiện đúng |
| C-05 | "✨ Tự động điền" điền sẵn các field | ✅ Pass | ✅ Pass | Form tự cập nhật; description giữ nguyên |
| C-06 | Submit form hợp lệ → redirect `/generating` | ✅ Pass | ✅ Pass | sessionStorage được ghi trước redirect |

### 2.2 Trang Loading (`/generating`)

| # | Hành động | Desktop | Mobile | Ghi chú |
|---|-----------|---------|--------|---------|
| G-01 | Hiển thị spinner + text loading | ✅ Pass | ✅ Pass | |
| G-02 | Tự động redirect sang `/results` sau khi có kết quả | ✅ Pass | ✅ Pass | |
| G-03 | Khi thiếu API Key → redirect sang `/results` với error banner | ✅ Pass | ✅ Pass | Không crash trắng trang |

### 2.3 Trang Results (`/results`)

| # | Hành động | Desktop | Mobile | Ghi chú |
|---|-----------|---------|--------|---------|
| R-01 | Hiển thị 3 card bản phối | ✅ Pass | ✅ Pass | |
| R-02 | Badge validation: `pass` / `warning` / `revise` hiển thị đúng màu | ✅ Pass | ✅ Pass | |
| R-03 | Card chờ validation → badge "ĐANG KIỂM DUYỆT" + pulse animation | ✅ Pass | ✅ Pass | |
| R-04 | Validation lỗi → badge "LỖI KIỂM DUYỆT" + nút "Thử lại" | ✅ Pass | ✅ Pass | |
| R-05 | Vùng ảnh: spinner "Đang tạo ảnh minh họa..." | ✅ Pass | ✅ Pass | |
| R-06 | Ảnh tạo thành công → hiển thị + disclaimer overlay | N/A live | N/A live | Provider chưa cấu hình; conditional UI được bao phủ bởi automated tests, chưa có generated-image evidence |
| R-07 | Ảnh fallback (`not_configured`) → icon warning + text + nút "Thử lại" | ✅ Pass | ✅ Pass | Content text/validation không bị mất |
| R-08 | Nút "Thử lại" fallback → gọi lại generate-image | ✅ Pass | ✅ Pass | |
| R-09 | Click "Xem Cultural Passport ↗" → navigate đúng `/looks/[id]` | ✅ Pass | ✅ Pass | |

### 2.4 Trang Cultural Passport (`/looks/[id]`)

| # | Hành động | Desktop | Mobile | Ghi chú |
|---|-----------|---------|--------|---------|
| P-01 | Load trang từ sessionStorage | ✅ Pass | ✅ Pass | Không gọi API thêm |
| P-02 | Tất cả thông tin look hiển thị: name, garment, style, palette, items, accessories | ✅ Pass | ✅ Pass | |
| P-03 | Ghi chú văn hóa và lý do đề xuất hiển thị | ✅ Pass | ✅ Pass | |
| P-04 | Kết quả validation và warnings hiển thị đúng màu severity | ✅ Pass | ✅ Pass | |
| P-05 | Nguồn tham khảo hiển thị title, publisher và safe link | ✅ Pass | ✅ Pass | Source chưa duyệt/sai garment không được trình bày như provenance hợp lệ |
| P-06 | Fixture badge hiển thị khi dùng dữ liệu mẫu | ✅ Pass | ✅ Pass | |
| P-07 | Khi sessionStorage rỗng → hiển thị "Phiên làm việc đã hết hạn" | ✅ Pass | ✅ Pass | |
| P-08 | Khi id không khớp → hiển thị "Không tìm thấy bản phối" | ✅ Pass | ✅ Pass | |

### 2.5 Remix Flow

| # | Hành động | Desktop | Mobile | Ghi chú |
|---|-----------|---------|--------|---------|
| X-01 | Bấm "Chỉnh sửa" → form Remix mở ra với giá trị hiện tại | ✅ Pass | ✅ Pass | |
| X-02 | Trong khi remix → nút disabled, look gốc mờ (opacity-50) | ✅ Pass | ✅ Pass | Look gốc không biến mất |
| X-03 | Hiển thị "Đang kiểm duyệt..." → "Đang tạo ảnh..." | ✅ Pass | ✅ Pass | |
| X-04 | Remix thành công → look cập nhật, validation mới hiển thị | ✅ Pass | ✅ Pass | Validation cũ bị xóa |
| X-05 | Remix thất bại (validation error) → thông báo lỗi rõ ràng, look gốc giữ nguyên | ✅ Pass | ✅ Pass | Không mất dữ liệu |
| X-06 | Bấm "Hủy" → form đóng, look không thay đổi | ✅ Pass | ✅ Pass | |
| X-07 | sessionStorage được cập nhật sau remix thành công | ✅ Pass | ✅ Pass | |

---

## 3. Kết quả tổng hợp

| Nhóm | Tổng case | Pass | Fail | Blocker |
|------|-----------|------|------|---------|
| Create | 6 | 6 | 0 | Không |
| Generating | 3 | 3 | 0 | Không |
| Results | 9 | 8 | 0 | 1 case generated image chưa chạy live |
| Passport | 8 | 8 | 0 | Không |
| Remix | 7 | 7 | 0 | Không |
| **Tổng** | **33** | **32** | **0** | **1 N/A live** |

> **Verdict: PASS WITH LIMITATION.** Không phát hiện regression mới trong 32 case đã chạy. Loading/retry/error/fallback hoạt động đúng; look gốc không bị mất khi remix thất bại. Generated-image success chưa có live evidence.

---

## 4. Blocker P2 ghi nhận

- **Image generation:** Khi `IMAGE_PROVIDER`/`GEMINI_IMAGE_MODEL` chưa cấu hình, image pipeline trả fallback `not_configured`. Nếu thiếu `GEMINI_API_KEY`, bước Critic trả lỗi cấu hình thay vì image fallback. Ảnh thật chờ env production và được ghi là limitation P2.
