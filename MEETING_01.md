# Buổi 1 - Chốt bài toán và dựng nền

Thuộc dự án: **AI Arena HALlucination**  
Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu buổi 1

Kết thúc buổi họp, cả đội phải thống nhất được:

1. Bài toán và người dùng mục tiêu.
2. Phạm vi MVP.
3. User flow chính.
4. Input/output schema.
5. Kiến trúc tổng thể.
6. Quy trình Git và cách review.
7. Cách xây dựng Cultural Knowledge Base.
8. Cách lưu prompt, AI Log và Gemini conversation.
9. Phần việc của từng người trước buổi 2.

Buổi 1 chưa cần hoàn thiện tính năng AI hoặc giao diện. Mục tiêu là dựng nền đúng để ba người có thể làm song song mà không lệch contract.

## 2. Thời lượng đề xuất

Tổng thời lượng: **120-150 phút**.

| Thời gian | Nội dung |
|---|---|
| 15 phút | Kiểm tra repository và thống nhất cách làm việc |
| 20 phút | Chốt bài toán, người dùng và giá trị khác biệt |
| 20 phút | Chốt MVP và user flow |
| 30 phút | Chốt schema và kiến trúc |
| 20 phút | Chốt Cultural KB và nguồn |
| 15 phút | Tạo board, Gemini conversation và AI Log |
| 15-30 phút | Chia việc, xác nhận Definition of Done và blocker |

## 3. Chuẩn bị trước buổi họp

### Cả ba thành viên

- Có tài khoản GitHub và quyền truy cập repository.
- Cài Git, Node.js và trình soạn thảo/code assistant cần dùng.
- Đọc mô tả cuộc thi và các đầu mục cần nộp.
- Chuẩn bị câu hỏi hoặc điểm chưa thống nhất.

### Hiền

- Chuẩn bị phác thảo user flow và một vài màn hình chính.
- Xác định thông tin cần nhập trên form.
- Chuẩn bị ví dụ về một trải nghiệm người dùng hoàn chỉnh.

### Lan Anh

- Kiểm tra cách tạo Gemini API key và SDK phù hợp.
- Chuẩn bị một thử nghiệm structured output tối thiểu.
- Xem lại schema dự kiến cho recommendation output.

### Linh

- Chuẩn bị danh sách nguồn ban đầu cho 4 loại trang phục.
- Chuẩn bị cấu trúc Cultural KB Sheet.
- Liệt kê các nhóm rule dự kiến: `preserve`, `flexible`, `context`, `warning`.

## 4. Agenda chi tiết

### 4.1. Kiểm tra repository

Thực hiện cùng nhau:

- Clone repository trên máy ít nhất một thành viên.
- Kiểm tra branch, remote và các file hiện tại.
- Xác nhận project có thể cài dependency và chạy.
- Xác nhận `.env` và `.env.local` đã nằm trong `.gitignore`.
- Không để Gemini API key trong repository.

Branches dự kiến:

```text
main
dev
feature/frontend
feature/gemini
feature/data
```

Quyết định cần ghi lại:

- Ai có quyền merge?
- Có yêu cầu một người review hay hai người review?
- Khi nào được merge `dev` vào `main`?

### 4.2. Chốt bài toán

Problem statement đề xuất:

> Người dùng muốn tiếp cận và phối Việt phục theo phong cách cá nhân nhưng thường thiếu kiến thức về đặc trưng trang phục, phụ kiện, bối cảnh sử dụng và giới hạn remix. Sản phẩm sử dụng Gemini kết hợp Cultural Knowledge Base để tạo bản phối có giải thích, nguồn tham khảo và bước kiểm tra phù hợp văn hóa.

Giá trị khác biệt:

- Không chỉ sinh outfit đẹp.
- Có dữ liệu văn hóa được đội tuyển chọn.
- Có `Cultural Critic` độc lập kiểm tra đề xuất.
- Có `Cultural Passport` giải thích yếu tố giữ nguyên và yếu tố được remix.

Những điểm phải thống nhất:

- Người dùng chính là ai?
- Tình huống sử dụng quan trọng nhất là gì?
- Vì sao người dùng không chỉ hỏi một chatbot thông thường?
- Cultural Guardrail giúp giảm rủi ro nào?

### 4.3. Chốt phạm vi MVP

Trang phục:

- Áo dài.
- Áo ngũ thân.
- Áo tứ thân.
- Nhật Bình.

Bối cảnh ban đầu:

- Tết.
- Tham quan di tích hoặc không gian văn hóa.
- Lễ hội.
- Chụp ảnh hoặc kỷ yếu.
- Đi chơi.

Phong cách ban đầu:

- Traditional.
- Minimal.
- Elegant.
- Romantic.
- Street.

Không làm trong MVP:

- Virtual try-on.
- Authentication.
- Social sharing nâng cao.
- Weather API.
- Recommendation theo lịch sử người dùng.
- Animation phức tạp.

### 4.4. Chốt user flow

```text
Landing
    ↓
Create Look
    ↓
Nhập event, garment, style, color, remix level và mô tả
    ↓
Generating Pipeline
    ↓
3 Result Cards
    ↓
Look Detail + Cultural Passport
    ↓
Remix
    ↓
Cultural Critic kiểm tra lại
```

Thông báo loading dự kiến:

```text
Đang phân tích nhu cầu...
Đang tìm dữ liệu văn hóa phù hợp...
Đang phối Việt phục...
Đang kiểm tra mức độ phù hợp...
Đang tạo hình ảnh minh họa...
```

### 4.5. Chốt input schema

```json
{
  "occasion": "cultural_visit",
  "garment": "auto",
  "style": "minimal",
  "colors": ["pastel_blue"],
  "remixLevel": 40,
  "description": "Đi Văn Miếu, thích nữ tính nhưng không quá cổ."
}
```

Required fields:

- `occasion`
- `garment`
- `style`
- `colors`
- `remixLevel`

Optional field:

- `description`

### 4.6. Chốt output schema

```json
{
  "looks": [
    {
      "id": "look_01",
      "name": "Thanh Lam",
      "garment": "ao_ngu_than",
      "style": "minimal",
      "palette": ["pastel_blue", "ivory"],
      "items": [],
      "accessories": [],
      "reason": "",
      "culturalNote": "",
      "sourceIds": [],
      "validation": {
        "status": "pass",
        "warnings": []
      },
      "imagePrompt": "",
      "imageUrl": null
    }
  ]
}
```

Mỗi warning sử dụng cấu trúc:

```json
{
  "ruleId": "RULE_ID",
  "severity": "medium",
  "reason": "",
  "suggestedFix": ""
}
```

Các giá trị validation:

- `pass`
- `warning`
- `revise`

Quy tắc:

- Luôn trả đúng 3 looks khi recommendation thành công.
- Không cho Gemini tự tạo `sourceId` không tồn tại.
- Frontend, backend, fixtures và Cultural KB cùng dùng một contract.
- Nếu thay đổi schema sau buổi 1, phải cập nhật `docs/api-contract.md`.

### 4.7. Chốt kiến trúc

```text
Frontend Form
    ↓
Intent Parser
    ↓
Cultural Retrieval
    ↓
Gemini Stylist
    ↓
Cultural Critic
    ↓
Image Generator
    ↓
Frontend Result
```

Phân tách trách nhiệm:

- Intent Parser chỉ chuẩn hóa nhu cầu.
- Cultural Retrieval chỉ lấy knowledge liên quan.
- Stylist tạo proposal.
- Critic kiểm tra proposal dựa trên rule.
- Image Generator chỉ nhận proposal đã qua kiểm tra hoặc đã được sửa.

### 4.8. Chốt Cultural KB Sheet

Columns tối thiểu:

| Field | Ý nghĩa |
|---|---|
| garment | Loại trang phục |
| category | History, structure, accessory, occasion hoặc warning |
| fact | Nội dung được trích xuất |
| rule_type | Preserve, flexible, context hoặc note |
| source_id | ID nguồn |
| publisher | Đơn vị xuất bản |
| url | Đường dẫn nguồn |
| confidence | High, medium hoặc low |
| reviewed | Đã được thành viên khác kiểm tra hay chưa |
| notes | Ghi chú |

Quy tắc nguồn:

- Ưu tiên bảo tàng, cơ quan di sản và nghiên cứu học thuật.
- Không dùng shop hoặc Pinterest làm ground truth.
- Fact chưa chắc chắn chỉ được lưu dưới dạng note.
- Hard rule phải có nguồn đủ mạnh và được review.

### 4.9. Tạo Gemini conversation và AI Log

Tạo một Gemini conversation chính thức với tên gợi ý:

```text
AI Arena HALlucination - Product and Prompt Development
```

Nội dung nên lưu trong thread:

- Phân tích đề.
- Problem statement.
- Persona.
- Schema.
- Prompt iteration.
- Test cases.
- UX critique.
- Pitch critique.

Tạo `docs/ai-log.md` với bảng:

```text
Date | Owner | Tool | Goal | Artefact/Commit | Reviewer | Result
```

Không cần đưa mọi đoạn code vào Gemini conversation. Code được chứng minh bằng commit, Pull Request và tài liệu trong repository.

## 5. Phân công sau buổi 1

### Hiền - Product và Frontend

#### Công việc

- [ ] Vẽ wireframe cho Landing, Create Look, Results và Look Detail.
- [ ] Tạo form bằng mock data.
- [ ] Tạo result card đọc dữ liệu từ fixture.
- [ ] Kiểm tra UI có thể render toàn bộ field trong schema.
- [ ] Ghi các điểm schema chưa đủ hoặc gây khó cho UI.

#### Definition of Done

- Có đường dẫn hoặc ảnh wireframe.
- Form chứa đủ field MVP.
- Result card hiển thị fixture mà không hard-code từng giá trị.
- Project chạy được trên máy khác theo README.

### Lan Anh - AI và Backend

#### Công việc

- [ ] Thiết lập Gemini client đọc API key từ environment.
- [ ] Thử một Gemini API call tối thiểu.
- [ ] Tạo Intent Parser phiên bản đầu.
- [ ] Yêu cầu structured output đúng input schema.
- [ ] Tạo endpoint mock hoặc fixture để Hiền tích hợp trước.
- [ ] Ghi prompt version đầu tiên vào `prompts/intent/`.

#### Definition of Done

- Gemini API call chạy được mà không lộ API key.
- Ít nhất 5 câu tự nhiên được thử nghiệm.
- Output parse được thành JSON.
- Khi thiếu key hoặc API lỗi, hệ thống trả thông báo dễ hiểu.

### Linh - Cultural Data và Submission

#### Công việc

- [ ] Tạo Cultural KB Sheet với các cột đã thống nhất.
- [ ] Lập danh sách nguồn cho 4 loại trang phục.
- [ ] Bắt đầu nhập dữ liệu cho Áo ngũ thân và Áo tứ thân.
- [ ] Với mỗi fact, ghi `source_id`, publisher và URL.
- [ ] Đề xuất các rule type và confidence level.
- [ ] Tạo 3-5 test case đầu tiên cho cultural validation.

#### Definition of Done

- Sheet có cấu trúc dùng chung.
- Áo ngũ thân và Áo tứ thân có dữ liệu ban đầu.
- Không có hard rule thiếu nguồn.
- Mỗi nguồn có ID duy nhất.
- Có danh sách điểm cần hỏi hoặc cần review chéo.

## 6. Việc cần làm chung trước buổi 2

- [ ] Mọi người clone và chạy được repository.
- [ ] Schema được lưu vào repository.
- [ ] Có ít nhất một fixture input và một fixture output gồm 3 looks.
- [ ] Mỗi người có feature branch riêng.
- [ ] Mỗi thành viên mở ít nhất một Pull Request hoặc để lại artefact review được.
- [ ] Task board phản ánh đúng trạng thái.
- [ ] AI Log được cập nhật.
- [ ] Gemini conversation đã được tạo và lưu link.

## 7. Definition of Done của buổi 1

Buổi 1 chỉ được coi là hoàn thành khi có đủ:

- [ ] Problem statement đã chốt.
- [ ] Phạm vi MVP đã chốt.
- [ ] User flow đã chốt.
- [ ] Input/output schema đã chốt.
- [ ] Kiến trúc pipeline đã chốt.
- [ ] Repo và branch workflow đã thống nhất.
- [ ] Cultural KB Sheet đã được tạo.
- [ ] Gemini API call tối thiểu đã chạy hoặc có blocker rõ ràng.
- [ ] Gemini conversation đã được tạo.
- [ ] Task của Hiền, Lan Anh và Linh có deadline.
- [ ] Cả ba hiểu Definition of Done trước buổi 2.

## 8. Những quyết định cần ghi trong biên bản

Điền trong buổi họp:

```text
Ngày họp:
Thời gian:
Thành viên tham gia:

Framework/version:
Deployment platform:
Gemini model dự kiến:
Image generation approach:
Quy tắc merge:
Deadline checkpoint 2:

Quyết định khác:
-
-

Blocker:
-
-
```

## 9. Trạng thái checkpoint

- [ ] Chưa bắt đầu.
- [ ] Đang thực hiện.
- [ ] Hoàn thành.
- [ ] Có blocker cần xử lý.

