# Prompt evaluation

`intent-cases.json` chứa 5 golden cases tiếng Việt cho intent parser, gồm dữ liệu đầy đủ, thiếu trường, giá trị mặc định và prompt injection.

- `npm test` dùng response Gemini giả lập để kiểm tra contract mà không gọi mạng.
- `npm run evaluate:intent` gọi model thật và so kết quả với golden cases. Lệnh này cần `GEMINI_API_KEY` trong `.env.local` và có thể phát sinh quota/chi phí API.

Không đưa dữ liệu người dùng thật hoặc dữ liệu nhạy cảm vào golden cases đã commit.
