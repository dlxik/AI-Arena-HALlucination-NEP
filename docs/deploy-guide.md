# Hướng dẫn deploy và preview candidate

## 1. Yêu cầu hệ thống

- Node.js `>=20.9.0` theo package Next.js đang cài.
- npm và lockfile của repository.

## 2. Các biến môi trường (.env.local)
Không bao giờ commit file `.env.local` vào repo. Bạn cần các biến sau:
```env
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.8-flash
GEMINI_TIMEOUT_MS=15000

# Image generation là tùy chọn. Để trống để nhận fallback not_configured.
IMAGE_PROVIDER=
GEMINI_IMAGE_MODEL=
GEMINI_IMAGE_TIMEOUT_MS=60000
```

## 3. Khởi chạy Local Preview
```bash
npm ci
npm run build
npm run start
```
Dự án sẽ chạy tại `http://localhost:3000`.

## 4. Triển khai lên Vercel (Recommended)
Dự án là một ứng dụng Next.js tiêu chuẩn, tối ưu tốt nhất trên nền tảng Vercel:
1. Kết nối repository GitHub với Vercel.
2. Framework preset: **Next.js**.
3. Environment Variables: thêm các biến đúng theo `.env.example`; tối thiểu cần `GEMINI_API_KEY`, `GEMINI_MODEL` và `GEMINI_TIMEOUT_MS` cho text pipeline.
4. Chỉ bật ảnh khi có cả `IMAGE_PROVIDER=gemini` và `GEMINI_IMAGE_MODEL` hợp lệ.
5. Bấm **Deploy** và lưu URL/commit của preview candidate.

## 5. Security & Fallback
- Project không lưu trữ bất cứ user secret nào.
- Nếu thiếu `GEMINI_API_KEY`, các endpoint text trả lỗi cấu hình an toàn; đây không phải image fallback.
- Nếu image provider/model chưa cấu hình, image pipeline trả fallback `not_configured` và giữ nguyên nội dung look/validation.
- Không ghi `.env.local`, API key hoặc raw provider payload vào log, screenshot hay Git.

## 6. Trạng thái Meeting 05

Hướng dẫn đã được đối chiếu với `.env.example`, nhưng repository chưa có URL preview/deploy candidate hoặc artefact regression desktop/mobile. Hiền cần bổ sung các bằng chứng này trước khi tick hoàn thành task deploy/regression.
