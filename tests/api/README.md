# API tests

Các test dùng test runner tích hợp của Node thông qua `tsx`. `parse-intent.test.ts` kiểm tra:

- 5 structured intent cases.
- JSON từ model bị lỗi hoặc có field lạ.
- HTTP `400`, `422` và `503` của Route Handler.

Chạy bằng `npm test`; test không gọi Gemini thật.
