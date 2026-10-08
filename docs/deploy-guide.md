# Hướng dẫn Deploy & Preview Candidate

## 1. Yêu cầu hệ thống
- Node.js >= 18
- NPM >= 9

## 2. Các biến môi trường (.env.local)
Không bao giờ commit file `.env.local` vào repo. Bạn cần các biến sau:
```env
# Google Gemini API Key để chạy Intent, Recommendation, Critic và Image Generation
GEMINI_API_KEY="your_api_key_here"

# (Tuỳ chọn) Nếu dùng model khác cho từng luồng
GEMINI_MODEL_RECOMMEND="gemini-1.5-flash-8b"
GEMINI_MODEL_CRITIC="gemini-1.5-flash-8b"
```

## 3. Khởi chạy Local Preview
```bash
npm install
npm run build
npm run start
```
Dự án sẽ chạy tại `http://localhost:3000`.

## 4. Triển khai lên Vercel (Recommended)
Dự án là một ứng dụng Next.js tiêu chuẩn, tối ưu tốt nhất trên nền tảng Vercel:
1. Kết nối repository GitHub với Vercel.
2. Framework preset: **Next.js**.
3. Environment Variables: Thêm `GEMINI_API_KEY` vào cấu hình môi trường của Vercel (không lưu ở dạng code).
4. Bấm **Deploy**.
5. Đợi quá trình build hoàn tất và cấp URL công khai.

## 5. Security & Fallback
- Project không lưu trữ bất cứ user secret nào.
- Nếu không có API Key, mọi request `/api/` sẽ fail-safe và trả về mã lỗi HTTP minh bạch (ví dụ `503 Service Unavailable`). UI frontend sẽ hiển thị empty state/fallback state hợp lý thay vì crash trắng trang.
- Chức năng tạo ảnh có timeout fallback mặc định để tránh treo request trên production (Vercel hobby tier giới hạn execution time rất ngắn).
