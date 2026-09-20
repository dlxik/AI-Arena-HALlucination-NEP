# Prompting

Prompt được lưu theo vai trò và phiên bản trong `prompts/`. Khi tích hợp thật:

- Không đưa secret hoặc dữ liệu nhạy cảm vào prompt.
- Chỉ ground bằng cultural records có trạng thái `approved`.
- Yêu cầu structured output và kiểm tra lại bằng schema ở server.
- Tách stylist khỏi critic để cảnh báo không bị bỏ qua.
- Ghi prompt/model/evaluation thay đổi vào `docs/ai-log.md`.
