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
- **Cultural Retrieval:** chỉ chọn garment/source `approved` và record `verified` + `reviewed`; dữ liệu `needs_review` không được đưa vào prompt.
- **Gemini Stylist:** tạo đúng ba đề xuất có cấu trúc và bám context truy xuất.
- **Cultural Critic:** áp dụng preserve rules, phát hiện cảnh báo và yêu cầu sửa.
- **Image Generator:** chỉ chạy sau khi kết quả vượt ngưỡng validation.
- **Result UI:** hiển thị bản phối, cảnh báo và Cultural Passport có nguồn.

`POST /api/parse-intent` gọi Gemini bằng structured output và validate lại ở server.

`POST /api/recommend` chạy Cultural Retrieval → Gemini Stylist → runtime validation → Rule Retrieval + Cultural Critic cho từng look → response. Retrieval Stylist fail-closed, giới hạn 6 records và 8 sources, giữ thứ tự ổn định, lọc theo garment/input và không fallback sang fixture. Với `garment: auto`, context chỉ gồm các ứng viên đã approved, ưu tiên ứng viên khớp occasion. Output bị từ chối nếu không có đúng 3 looks khác nhau hoặc dùng source ngoài context/không liên quan garment.

KB tích hợp hiện có bốn garment profile, sáu source và 14 record đạt policy retrieval. Hai source còn `needs_review` được giữ trong catalog nhưng bị loại khỏi prompt. Automated tests dùng chính dữ liệu repository và hạ trạng thái trên bản sao cô lập để kiểm tra fail-closed; test không tự nâng trạng thái dữ liệu.

Cultural Critic được gọi độc lập qua `POST /api/validate` hoặc qua orchestration của recommendation. Request validation nhận một look hoàn chỉnh và recommendationInput; không nhận rule/source payload để client tự xác lập provenance. Validation/imageUrl cũ bị bỏ trước prompt.

Rule Retrieval dùng toàn bộ records verified + reviewed của garment, có tất cả nguồn approved và đúng garment, không tái dùng context bị giới hạn của Stylist. Context/occasion rules vẫn được giữ để phát hiện tuyên bố universal sai phạm vi; điều kiện áp dụng được Critic đánh giá cùng occasion/style/remix và nội dung look.

Critic structured output được kiểm tra lại: JSON/schema, rule IDs duy nhất và thuộc tập retrieved, garment/provenance đúng, status khớp severity. Advisory không được nâng thành high/revise. Không có context/rules thì trả lỗi fail-closed. Ba Critic calls chạy song song sau Stylist; kết quả pending nội bộ bị thay hoàn toàn trước response. Một call lỗi làm toàn recommendation trả failure envelope. Timeout áp dụng cho từng Gemini request theo client hiện tại (có retry), không phải deadline tổng của pipeline; team cần tính cả hai giai đoạn khi đặt timeout UI/deployment.

## Image/remix — Meeting 04

`POST /api/generate-image` dùng input giống validation: schema → bỏ verdict/image client → dựng visual JSON phía server → full Rule Retrieval → fresh Critic → runtime verdict validation → Gemini image provider. Không có persistence/trusted look token, nên mỗi lần gọi phải recheck; validationId chỉ là ID execution, không dùng để xác thực client.

`POST /api/remix` chỉ patch palette/accessories trên bản sao. Tạo look ID mới, giữ garment/source/rule scope và toàn bộ cấu trúc item, cập nhật input.colors khi đổi palette, rồi đi qua cùng pipeline. Không mở rộng sang virtual try-on hoặc rewrite cấu trúc. Look gốc không mutate; request lỗi không có partial success.

Critic kiểm tra chính visual JSON được provider dùng. Image instruction version `prompts/image/image-v1.md` cố định việc không tự thêm motif/rank/structure/cultural claims. Provider không nhận culturalNote/source payloads/validation hay imagePrompt tự do từ client. Prompt constraints không thay cultural review ảnh thực tế.

Provider Gemini `models.generateContent` dùng env riêng, một attempt, SDK timeout và Promise deadline/AbortController; map quota, timeout, safety, invalid image và upstream error thành fallback enum an toàn. Parser nhận một final non-thought inline PNG/JPEG/WebP, kiểm tra bounded base64 + MIME/signature/container, không chấp nhận URL/fileData/SVG. Không log key hoặc upstream response. Đáp ứng runtime representation không đồng nghĩa ảnh đúng văn hóa.

Pass/warning tạo ảnh và giữ cảnh báo. Revise bỏ qua provider, trả fallback cultural_revision_required. Provider thất bại trả fresh look/validation cùng fallback không có ảnh; Critic thất bại trả failure envelope, không fabricated verdict. Response có validationId/validatedAt mới và disclaimer AI illustration. Deadline toàn pipeline cần bao gồm Critic và image, không chỉ image call.

`scripts/evaluate-image-remix.ts` dùng 8 remix cases (mỗi garment có palette hợp lệ và claim mới có rủi ro trong accessory). Mặc định chỉ Critic thật, image được tắt rõ ràng; `--with-images` bật provider đã cấu hình và lưu ảnh local bị Git ignore, báo cáo chỉ chứa metadata/hash. Kiểm tra UI/retry và cultural review cuối thuộc Hiền/Linh; backend evaluation không thay các review này.
