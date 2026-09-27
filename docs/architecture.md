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
- **Cultural Retrieval:** chọn garment/source `approved` hoặc `needs_review`; record chưa review chỉ được truyền dưới dạng advisory và không được nâng thành hard rule.
- **Gemini Stylist:** tạo đúng ba đề xuất có cấu trúc và bám context truy xuất.
- **Cultural Critic:** áp dụng preserve rules, phát hiện cảnh báo và yêu cầu sửa.
- **Image Generator:** chỉ chạy sau khi kết quả vượt ngưỡng validation.
- **Result UI:** hiển thị bản phối, cảnh báo và Cultural Passport có nguồn.

`POST /api/parse-intent` gọi Gemini bằng structured output và validate lại ở server.

`POST /api/recommend` đã chạy Cultural Retrieval → Gemini Stylist → runtime validation. Retrieval giới hạn 6 records và 8 sources, giữ thứ tự ổn định, lọc theo garment/input và không fallback sang fixture. Với `garment: auto`, context gồm các ứng viên MVP đủ điều kiện, ưu tiên ứng viên khớp occasion. Output bị từ chối nếu không có đúng 3 looks khác nhau hoặc dùng source ngoài context/không liên quan garment.

Cultural Critic và image generator vẫn là scaffold. Do đó recommendation hiện trả cảnh báo `CULTURAL_CRITIC_PENDING`, không tuyên bố `pass` hoặc kết quả guardrail hoàn chỉnh.
