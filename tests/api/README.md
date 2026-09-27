# API tests

Các test dùng test runner tích hợp của Node thông qua `tsx`.

`parse-intent.test.ts` kiểm tra:

- 5 structured intent cases.
- JSON từ model bị lỗi hoặc có field lạ.
- HTTP `400`, `422` và `503` của Route Handler.

`recommend.test.ts` và `../cultural/retrieval.test.ts` kiểm tra:

- Retrieval cho garment cụ thể và `auto`, thứ tự ổn định, giới hạn context và advisory policy.
- Gemini Stylist success path, đúng 3 looks và chặn source ID bịa.
- HTTP `400`, `422`, `502`, `503`, `504` cùng error envelope không lộ raw upstream detail.

Chạy bằng `npm test`; test không gọi Gemini thật.
