# Architecture

Pipeline mục tiêu:

```text
User Input
→ Intent Parser
→ Cultural Retrieval
→ Gemini Stylist
→ Cultural Critic
→ Image Generator
→ Result UI
```

## Trách nhiệm

- **Intent Parser:** chuẩn hóa input tự do thành `RecommendationInput`.
- **Cultural Retrieval:** chỉ chọn garment/source `approved` và record `verified` + `reviewed`; dữ liệu `needs_review` không được đưa vào prompt.
- **Gemini Stylist:** tạo đúng ba đề xuất có cấu trúc và bám context truy xuất.
- **Cultural Critic:** áp dụng preserve rules, phát hiện cảnh báo và yêu cầu sửa.
- **Image Generator:** chỉ chạy sau khi kết quả vượt ngưỡng validation.
- **Result UI:** hiển thị bản phối, cảnh báo và Cultural Passport có nguồn.

`POST /api/parse-intent` gọi Gemini bằng structured output và validate lại ở server.

`POST /api/recommend` chạy Cultural Retrieval → Gemini Stylist → runtime validation. Retrieval fail-closed, giới hạn 6 records và 8 sources, giữ thứ tự ổn định, lọc theo garment/input và không fallback sang fixture. Với `garment: auto`, context chỉ gồm các ứng viên đã approved, ưu tiên ứng viên khớp occasion. Output bị từ chối nếu không có đúng 3 looks khác nhau hoặc dùng source ngoài context/không liên quan garment.

KB tích hợp hiện có bốn garment profile, sáu source và 14 record đạt policy retrieval. Hai source còn `needs_review` được giữ trong catalog nhưng bị loại khỏi prompt. Automated tests dùng chính dữ liệu repository và hạ trạng thái trên bản sao cô lập để kiểm tra fail-closed; test không tự nâng trạng thái dữ liệu.

Cultural Critic và image generator vẫn là scaffold. Do đó recommendation hiện trả cảnh báo `CULTURAL_CRITIC_PENDING`, không tuyên bố `pass` hoặc kết quả guardrail hoàn chỉnh.
