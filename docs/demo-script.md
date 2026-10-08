# Demo Script & Shot List (2-3 phút)

## Mục tiêu Demo
Trình diễn core flow của AI Arena HALlucination: từ việc tạo bản phối (Create), kiểm duyệt (Validation), xem chi tiết (Cultural Passport) đến tinh chỉnh (Remix). Tập trung vào sự an toàn và tính đúng đắn văn hóa (Cultural Safeguards).

## Shot List & Flow chi tiết

### 1. Bước 1: Tạo bản phối (0:00 - 0:45)
- **Hành động:** 
  - Người dùng truy cập trang chủ và bấm "Khám phá ngay".
  - Tại trang `/create`, người dùng điền description: "Mình sắp đi Văn Miếu dịp Tết, thích phong cách nữ tính, nhẹ nhàng nhưng không quá cổ điển".
  - Bấm nút "✨ Tự động điền" để AI phân tích intent (hiển thị loading state).
  - Kiểm tra kết quả tự động điền: Dịp sử dụng (cultural_visit), Loại trang phục (áo dài), Phong cách, Màu sắc.
  - Bấm "Xem bản phối →".
- **Điểm nhấn:** Khả năng hiểu ngôn ngữ tự nhiên và map sang structured input (Intent Parsing).

### 2. Bước 2: Hiển thị và Kiểm duyệt bản phối (0:45 - 1:30)
- **Hành động:**
  - Chuyển sang màn hình `/generating` (Loading).
  - Hiển thị trang kết quả (`/results`) với 3 bản phối.
  - Khán giả có thể thấy các trạng thái validation: "Phù hợp văn hóa" (Pass), "Có điểm cần lưu ý" (Warning), hoặc "Cần điều chỉnh" (Revise).
  - Trạng thái tạo ảnh minh họa (Loading spinner -> Ảnh hoặc Fallback kèm Disclaimer).
- **Điểm nhấn:** Independent Cultural Critic hoạt động song song, đánh giá trên Cultural Knowledge Base. Fallback ảnh nếu không tạo được.

### 3. Bước 3: Xem chi tiết Cultural Passport (1:30 - 2:15)
- **Hành động:**
  - Click "Xem Cultural Passport ↗" ở một bản phối (ưu tiên case Warning hoặc Pass).
  - Chuyển sang trang `/looks/[id]`.
  - Cuộn xuống xem các thông tin: Thành phần trang phục, Ghi chú văn hóa, Lý do đề xuất.
  - Mở xem mục **Kết quả kiểm tra văn hóa** và **Nguồn tham khảo** (hiển thị ID tham chiếu minh bạch).
- **Điểm nhấn:** Tính minh bạch của nguồn gốc dữ liệu (Provenance) và hướng dẫn sửa lỗi (Suggested fix).

### 4. Bước 4: Tinh chỉnh (Remix) & Re-validate (2:15 - 3:00)
- **Hành động:**
  - Ở màn Cultural Passport, bấm "Chỉnh sửa" tại phần Remix.
  - Thêm vào ô "Phụ kiện": `thắt lưng kim loại rộng` (phụ kiện không phù hợp với áo dài truyền thống).
  - Bấm "Cập nhật & Chạy lại Critic".
  - Hiển thị trạng thái "Đang kiểm duyệt..." rồi "Đang tạo ảnh...".
  - Cultural Critic cảnh báo: phụ kiện làm biến dạng cấu trúc áo dài cổ điển, vi phạm nguyên tắc bảo tồn dáng trang phục truyền thống.
- **Điểm nhấn:** Vòng lặp đóng (Closed loop) — mọi thay đổi đều bị Critic kiểm tra lại từ đầu dựa trên Cultural Knowledge Base, không dùng kết quả validation cũ. Look gốc được bảo toàn nếu remix thất bại.
- **Ví dụ thực từ evaluation:** Nhật Bình khái quát "trang phục lễ hội phổ quát" — Critic phát hiện vi phạm rule `nhb-motif-01` về tính đặc thù vùng miền. Hoặc áo tứ thân "áp phong cách Kinh Bắc" — Critic cảnh báo sai scope theo rule `at-scope-01`.
