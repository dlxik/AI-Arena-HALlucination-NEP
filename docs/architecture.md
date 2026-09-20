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
- **Cultural Retrieval:** chỉ chọn record và nguồn đã được phê duyệt.
- **Gemini Stylist:** tạo đúng ba đề xuất có cấu trúc và bám context truy xuất.
- **Cultural Critic:** áp dụng preserve rules, phát hiện cảnh báo và yêu cầu sửa.
- **Image Generator:** chỉ chạy sau khi kết quả vượt ngưỡng validation.
- **Result UI:** hiển thị bản phối, cảnh báo và Cultural Passport có nguồn.

Scaffold hiện dừng ở contract và deterministic mock. Không route nào gọi Gemini.
