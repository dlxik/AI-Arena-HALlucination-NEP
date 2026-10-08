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
  - Đổi màu sắc ở ô "Bảng màu" (ví dụ: đổi thành màu neon không phù hợp).
  - Bấm "Cập nhật & Chạy lại Critic".
  - Hiển thị trạng thái "Đang kiểm duyệt..." sau đó là "Đang tạo ảnh...".
  - Kết quả trả về từ Critic chuyển sang Warning/Revise do màu sắc không hợp lễ hội truyền thống.
- **Điểm nhấn:** Vòng lặp đóng (Closed loop) - người dùng sửa đổi thì hệ thống tự động kiểm duyệt lại để đảm bảo an toàn mọi lúc.
