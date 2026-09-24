# AI Arena — HALlucination

AI Arena là nền tảng thử nghiệm gợi ý bản phối trang phục văn hóa Việt. Người dùng mô tả dịp, loại trang phục, phong cách, màu sắc và mức độ remix; pipeline dự kiến truy xuất tri thức có nguồn, tạo đề xuất, kiểm tra văn hóa rồi mới tạo hình ảnh.

> Trạng thái: scaffold + mock contracts. Chưa tích hợp Gemini và chưa có dữ liệu văn hóa đã được phê duyệt.

## Bài toán sản phẩm

Các công cụ tạo ảnh có thể tạo ra kết quả hấp dẫn nhưng thiếu căn cứ văn hóa. MVP tách rõ bước tạo ý tưởng và bước kiểm tra, đồng thời gắn kết quả với nguồn để người dùng biết thông tin nào đã được rà soát.

## MVP

- Nhập dịp, trang phục, phong cách, bảng màu và mức remix.
- Trả ba bản phối có cấu trúc để frontend phát triển độc lập với AI.
- Hiển thị Cultural Passport và cảnh báo kiểm chứng.
- Cung cấp API contract cho intent, recommendation, validation và image generation.
- Chuẩn bị Cultural Knowledge Base dạng JSON, chỉ dùng record được duyệt khi tích hợp thật.

## Tech stack

- Next.js 16 App Router
- React 19
- TypeScript strict mode
- Tailwind CSS 4
- ESLint 9

## Cấu trúc chính

```text
src/app/          Pages và Route Handlers
src/components/   UI theo feature
src/lib/          Gemini stubs, cultural retrieval, validation
src/types/        Data contracts
data/             Cultural Knowledge Base dạng JSON
prompts/          Prompt versioning
tests/fixtures/   Mock input/output
docs/             Kiến trúc, API và quy trình
scripts/          Kiểm tra dữ liệu cục bộ
```

## Chạy local

Yêu cầu Node.js phiên bản được Next.js 16 hỗ trợ và npm.

```bash
npm install
Copy-Item .env.example .env.local # PowerShell
npm run dev
```

Mở `http://localhost:3000`. Scaffold hiện tại không cần Gemini key để chạy. Khi tích hợp Gemini, điền key chỉ trong `.env.local`:

```env
GEMINI_API_KEY=
```

Không commit `.env`, `.env.local`, API key hay secret dưới bất kỳ hình thức nào.

## Scripts

| Script | Mục đích |
| --- | --- |
| `npm run dev` | Chạy development server |
| `npm run lint` | Chạy ESLint |
| `npm run typecheck` | Kiểm tra TypeScript, không emit |
| `npm run build` | Tạo production build |
| `npm run start` | Chạy production server đã build |
| `npm run validate:data` | Kiểm tra cấu trúc garment JSON tối thiểu |

Xem thêm [kế hoạch dự án](docs/planning/README.md), [API contract](docs/api-contract.md), [kiến trúc](docs/architecture.md) và [quy tắc đóng góp](CONTRIBUTING.md).
