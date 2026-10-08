# Deploy candidate report - Meeting 05

Owner: **Hiền**
Integration review: **2026-10-08**
Source commit: `26448ea`

## Candidate đã xác minh

Production build đã chạy thành công trên Next.js 16.3.5:

```text
npm run build
Compiled successfully
TypeScript passed
Generated static pages: 12/12
Exit code: 0
```

Các route chính đã được build:

- `/`, `/create`, `/generating`, `/results`;
- `/looks/[id]`;
- `/api/parse-intent`, `/api/recommend`, `/api/validate`;
- `/api/generate-image`, `/api/remix`.

Lệnh preview local:

```bash
npm ci
npm run build
npm run start
```

Mở `http://localhost:3000`.

## Deploy công khai

Meeting 05 chưa có quyền/tài khoản Vercel kết nối repository, nên chưa tạo URL công khai. Đây là external-access task chuyển sang Meeting 06, không phải lỗi code.

Người deploy cần:

1. Import `dlxik/AI-Arena-HALlucination-NEP` vào Vercel.
2. Cấu hình biến theo `.env.example`; không commit `.env.local` hoặc secret.
3. Tối thiểu cấu hình `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_TIMEOUT_MS` cho text pipeline.
4. Chỉ bật ảnh khi có `IMAGE_PROVIDER=gemini` và `GEMINI_IMAGE_MODEL` hợp lệ.
5. Chạy smoke test rồi lưu URL và commit SHA trong Meeting 06.

## Screenshot policy

Screenshot không phải điều kiện merge hoặc đóng Meeting 05. Nếu video/submission cần ảnh tĩnh, đội chụp từ deploy candidate thật trong Meeting 06.

Không seed browser bằng fixture tự viết hoặc source/rule ID giả. Demo chỉ dùng output thật hoặc fixture đã commit và qua validator của repository.

## Kết luận

- Local production candidate: **pass**.
- Public deploy URL: **deferred to Meeting 06 due to account access**.
- Screenshot: **optional asset for Meeting 06, not a Meeting 05 blocker**.
