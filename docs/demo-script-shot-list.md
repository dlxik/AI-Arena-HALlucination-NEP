# Demo script và shot list - Draft Meeting 05

Owner nội dung cultural/submission: **Diệu Linh**
Trạng thái: chờ Hiền xác nhận UI, viewport, deploy URL và thời lượng quay thực tế.

## Mục tiêu video

Trong khoảng **2 phút 30 giây**, chứng minh ba điểm: gợi ý có nguồn, Critic bắt rủi ro văn hóa và remix luôn được kiểm tra lại. Không cắt dựng khiến fallback hoặc warning trông như success.

## Script

| Mốc | Hình cần quay | Lời thoại chính | Bằng chứng |
| --- | --- | --- | --- |
| 00:00-00:15 | Trang mở đầu + create form | “AI Arena hỗ trợ phối bốn loại Việt phục nhưng tách sáng tạo khỏi kiểm tra văn hóa.” | Tên sản phẩm, bốn garment MVP |
| 00:15-00:35 | Nhập một yêu cầu safe, ưu tiên áo ngũ thân hoặc áo tứ thân | “Nhu cầu được chuẩn hóa trước khi retrieval lấy dữ liệu đã duyệt.” | Input và trạng thái loading thật |
| 00:35-01:00 | Results có ba looks | “Stylist trả ba lựa chọn; Cultural Critic độc lập đánh giá từng look.” | Ba cards, badge pass/warning, ảnh hoặc fallback thật |
| 01:00-01:20 | Mở Cultural Passport | “Passport giải thích cultural note, rule warning và provenance.” | Source title, publisher, link; AI-image disclaimer |
| 01:20-01:50 | Remix bằng risky claim đã định nghĩa | “Sau thay đổi, validation cũ không được tái sử dụng; Critic chạy lại trước image pipeline.” | Loading revalidation, warning mới, rule ID và suggested fix |
| 01:50-02:10 | Chuyển sang case fallback hoặc provider error | “Nếu ảnh không khả dụng, hệ thống giữ nội dung và báo fallback thay vì tạo fake success.” | `not_configured`/fallback UI đúng thực tế |
| 02:10-02:30 | Slide evaluation + limitation | “Tập cultural review có 18 case trên bốn garment. Ảnh AI chỉ là minh họa và KB vẫn có phạm vi giới hạn.” | Số liệu từ artefact cuối, limitation ngắn |

## Case đề xuất

1. **Pass:** `RC_02_AO_NGU_THAN_CULTURAL_VISIT` — năm cúc vạt phải, tay hẹp, nguồn bảo tàng.
2. **Warning:** `IR_08_NHAT_BINH_RISK` — không khái quát motif/phẩm cấp từ một hiện vật.
3. **Fallback:** `IR_01_AO_DAI_PALETTE` — validation pass nhưng ảnh `not_configured`, nội dung vẫn còn.

Nếu dữ liệu live không tái hiện đúng case, dùng case khác trong artefact và sửa lời thoại; không dựng lại UI để giả kết quả.

## Shot checklist

- [ ] URL/branch/deploy candidate xuất hiện ở slate đầu hoặc cuối.
- [ ] Form input đọc được; không quay `.env.local`, terminal có key hoặc network payload nhạy cảm.
- [ ] Cả ba result cards xuất hiện ít nhất một lần.
- [ ] Passport quay rõ source title, publisher, link và disclaimer.
- [ ] Warning quay rõ rule ID, reason và suggested fix.
- [ ] Remix cho thấy trạng thái đang revalidate/regenerate.
- [ ] Fallback giữ nguyên text và validation của look.
- [ ] Evaluation slide dùng số liệu từ artefact cuối, không dùng con số tạm nếu Lan Anh rerun.
- [ ] Phụ đề không gọi ảnh AI là “phục dựng chính xác”.
- [ ] Hiền xác nhận responsive/visual; Lan Anh xác nhận model/evaluation wording; Linh xác nhận cultural wording.

## Asset handoff

| Asset | Owner | Trạng thái |
| --- | --- | --- |
| Deploy URL và screen recording | Hiền | TODO |
| Final model/prompt/evaluation metrics | Lan Anh | TODO |
| Cultural wording, case selection, limitation | Linh | Draft hoàn tất |
| Final edit và submission links | Cả đội | Meeting 06 |
