# Buổi 2 - Flow đề xuất đầu tiên

Thuộc dự án: **AI Arena HALlucination**  
Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu buổi 2

Checkpoint 2 hoàn thành khi một input hợp lệ từ form đi qua Cultural Retrieval và Gemini Stylist, sau đó frontend hiển thị được **đúng 3 bản phối theo schema chung**.

Luồng cần chứng minh:

```text
Create Look form
    ↓ RecommendationInput
POST /api/recommend
    ↓
Cultural Retrieval
    ↓ reviewed cultural context
Gemini Stylist
    ↓ RecommendationOutput đã validate
Results UI
```

Buổi 2 tập trung vào recommendation flow đầu tiên. Cultural Critic độc lập, image generation thật, remix và guardrail hoàn chỉnh thuộc các checkpoint sau.

## 2. Trạng thái đầu vào

Đã có từ Meeting 01:

- Form chứa đủ trường của `RecommendationInput`.
- Results UI và Cultural Passport render được fixture ba looks.
- `POST /api/parse-intent` gọi Gemini và validate structured output.
- `POST /api/recommend` validate request nhưng vẫn trả fixture cố định.
- Cultural KB có source, knowledge record, rule mẫu và script validation.
- Prompt Stylist, retrieval và Gemini Stylist mới ở mức scaffold.

Việc hành chính Meeting 01 còn phải chốt ở đầu buổi:

- Cả ba thành viên xác nhận clone/cài/chạy được repository.
- Ghi link Gemini conversation chính thức.
- Xác nhận branch/PR review workflow, task board và deadline checkpoint 2.

Các mục này không được dùng để che lấp blocker kỹ thuật của flow Meeting 02.

## 3. Thời lượng đề xuất

Tổng thời lượng: **120-150 phút**.

| Thời gian | Nội dung |
|---|---|
| 15 phút | Đóng các quyết định còn thiếu của Meeting 01 |
| 20 phút | Demo baseline và xác nhận contract không đổi |
| 25 phút | Review Cultural Retrieval và context đưa vào Stylist |
| 25 phút | Review Gemini Stylist, validation và error handling |
| 25 phút | Nối frontend với `/api/recommend` và chạy flow chung |
| 10-25 phút | Ghi lỗi, chốt owner, deadline và tiêu chí sang Meeting 03 |

## 4. Chuẩn bị trước buổi họp

### Cả ba thành viên

- Pull `main`, cài dependency và chạy phần mình sở hữu.
- Đẩy artefact lên branch cá nhân, không push trực tiếp vào `main`.
- Chuẩn bị một demo ngắn và ghi rõ command kiểm tra.
- Ghi blocker, thay đổi schema đề xuất và các case thất bại đã thấy.
- Không đưa API key, secret hoặc dữ liệu nhạy cảm vào commit/log.

### Hiền

- Chuẩn bị nhánh nối form với `POST /api/recommend`.
- Chuẩn bị trạng thái loading, lỗi và retry cho flow thật.
- Kiểm tra Results UI không còn phụ thuộc fixture khi API thành công.

### Lan Anh

- Chuẩn bị Cultural Retrieval cho input đã chuẩn hóa.
- Hoàn thiện Stylist prompt và structured output schema.
- Chuẩn bị error mapping khi thiếu key, timeout, upstream error hoặc model trả sai schema.

### Linh

- Rà soát dữ liệu nào đủ điều kiện được retrieval dùng ở checkpoint này.
- Chuẩn bị context có nguồn cho cả 4 trang phục hoặc ghi rõ khoảng trống dữ liệu.
- Chuẩn bị test case kiểm tra output có bám source/context, không tự tạo citation.

## 5. Agenda chi tiết

### 5.1. Đóng Meeting 01

Điền và xác nhận:

```text
Gemini conversation URL:
Quy tắc merge/reviewer:
Task board URL:
Deadline checkpoint 2:
Môi trường đã chạy được của Hiền: yes/no
Môi trường đã chạy được của Lan Anh: yes/no
Môi trường đã chạy được của Linh: yes/no
```

Sau khi xác nhận, cập nhật trạng thái Meeting 01 và checkpoint 1 trong `TEAM_PLAN.md`.

### 5.2. Demo baseline

Chạy và ghi kết quả:

```bash
npm run validate:data
npm test
npm run typecheck
```

Demo riêng:

1. Form tạo đúng `RecommendationInput`.
2. `/api/parse-intent` trả input có cấu trúc khi có Gemini key.
3. `/api/recommend` hiện vẫn trả fixture để cả đội thấy chính xác phần cần thay thế.
4. Results UI render đủ ba cards và Cultural Passport.

Không cần build toàn project trong từng vòng sửa. Chỉ chạy build khi chuẩn bị merge checkpoint.

### 5.3. Khóa contract cho checkpoint 2

Sử dụng contract hiện có trong `src/types/api.ts`, `src/types/outfit.ts` và `docs/api-contract.md`.

Quy tắc bắt buộc:

- Request là `RecommendationInput` đã validate.
- Response thành công là envelope chứa `RecommendationOutput`.
- `looks` có đúng 3 phần tử, ID không trùng.
- Mọi look có đủ `name`, `garment`, `style`, `palette`, `items`, `accessories`, `reason`, `culturalNote`, `sourceIds`, `validation` và `imagePrompt`.
- Mọi `sourceId` phải tồn tại trong `data/sources/references.json`.
- Chưa có Cultural Critic thật thì không được mô tả `validation` như kết quả kiểm duyệt hoàn chỉnh; dùng trạng thái/cảnh báo tạm đã thống nhất và ghi rõ giới hạn.
- Mọi thay đổi contract phải được cả ba đồng ý rồi cập nhật type, validation, fixture, API docs và UI trong cùng PR.

### 5.4. Chốt Cultural Retrieval

Retrieval tối thiểu nhận:

```text
garment
occasion
style
remixLevel
```

Context trả cho Stylist phải:

- Chỉ lấy record/source đủ điều kiện theo trạng thái review đã thống nhất.
- Ưu tiên garment được chọn; với `auto`, cung cấp tập ứng viên có lý do chọn rõ ràng.
- Giữ nguyên `record.id`, `rule_type`, `condition`, `action`, `source_ids` và mức confidence.
- Phân biệt fact, advisory rule và hard rule; dữ liệu chưa review không được nâng thành hard constraint.
- Có giới hạn kích thước và thứ tự ổn định để prompt/test tái lập được.
- Không trả source không tồn tại hoặc record không liên quan.

Các quyết định cần ghi:

```text
Record status được phép retrieval:
Cách xử lý garment = auto:
Giới hạn số record/context:
Cách xử lý khi không có context phù hợp:
```

### 5.5. Chốt Gemini Stylist

Stylist nhận input người dùng và cultural context đã retrieval. Prompt phải yêu cầu:

- Trả đúng 3 looks khác nhau nhưng đều bám input.
- Chỉ dùng garment ID, style ID và source ID hợp lệ.
- Giải thích lý do chọn, cultural note và nguồn cho từng look.
- Không tự tạo fact, citation, hard rule hoặc kết quả Cultural Critic.
- Trả JSON đúng schema, không kèm Markdown.

Server phải validate model output trước khi trả cho frontend. Output sai schema không được cast thẳng thành `RecommendationOutput`.

Các case lỗi tối thiểu:

| Tình huống | Kết quả mong đợi |
|---|---|
| Thiếu `GEMINI_API_KEY` | `503 GEMINI_NOT_CONFIGURED` |
| Gemini timeout | `504 GEMINI_TIMEOUT` |
| Upstream lỗi | `502 GEMINI_UPSTREAM_ERROR` |
| JSON/model output sai schema | `502 INVALID_MODEL_OUTPUT` |
| Request sai schema | `422 INVALID_INPUT` |
| Không có cultural context đủ điều kiện | Lỗi/fallback minh bạch theo quyết định của đội, không bịa nguồn |

### 5.6. Nối frontend với flow thật

Frontend cần:

1. Gửi form tới `POST /api/recommend`.
2. Hiển thị loading trong lúc chờ.
3. Lưu hoặc truyền response sang Results page mà không dùng fixture làm dữ liệu thành công.
4. Render đúng ba looks và các `sourceIds` do API trả về.
5. Hiển thị thông báo dễ hiểu khi API lỗi; cho phép thử lại hoặc quay lại form.
6. Không hiển thị `imagePrompt` như nội dung dành cho người dùng cuối.

Fixture vẫn được giữ cho automated test và phát triển offline, nhưng phải được nhận diện rõ là fixture, không âm thầm thay cho response production.

### 5.7. Chạy acceptance cases

Tối thiểu chạy 5 input, bao phủ:

1. Chọn cụ thể Áo dài.
2. Chọn cụ thể Áo ngũ thân.
3. Chọn cụ thể Áo tứ thân.
4. Chọn cụ thể Nhật Bình.
5. `garment: auto` với mô tả tự do.

Với mỗi case ghi:

```text
Input:
Context IDs được retrieval:
Output parse/validate: pass/fail
Đủ 3 looks: yes/no
Source IDs tồn tại: yes/no
Bám occasion/style/colors: pass/warning/fail
Nhận xét văn hóa của Linh:
Lỗi cần sửa:
```

Không đánh giá chất lượng chỉ bằng việc JSON parse được. Linh phải kiểm tra cultural note và cách dùng nguồn; Hiền kiểm tra khả năng hiển thị; Lan Anh kiểm tra pipeline và schema.

## 6. Phân công sau buổi 2

### Hiền - Product và Frontend

#### Công việc

- [ ] Nối form với `POST /api/recommend`.
- [ ] Hoàn thiện loading, error, retry và back-to-form states.
- [ ] Render response thật trên Results page, không import fixture trong production flow.
- [ ] Hiển thị source/cultural note rõ ràng trên card hoặc Cultural Passport.
- [ ] Kiểm tra responsive và ba cards không vỡ layout với nội dung dài.
- [ ] Bổ sung kiểm tra frontend phù hợp cho success/error flow.

#### Definition of Done

- Submit một input hợp lệ mở được Results page với đúng dữ liệu API trả về.
- Người dùng nhìn thấy lỗi có thể hành động khi API thất bại.
- Không có fake success âm thầm từ fixture.
- UI không phụ thuộc nội dung hard-code của ba look mẫu.

### Lan Anh - AI và Backend

#### Công việc

- [ ] Hoàn thiện loader/retrieval cho cultural context liên quan.
- [ ] Hoàn thiện `prompts/stylist/stylist-v1.md` và `recommendWithGemini`.
- [ ] Thêm runtime validation cho `RecommendationOutput`, gồm đúng 3 looks và source ID hợp lệ.
- [ ] Thay fixture trong `POST /api/recommend` bằng retrieval + Gemini Stylist.
- [ ] Chuẩn hóa timeout/error envelope theo API contract.
- [ ] Viết test cho success path, invalid model output, missing key và upstream failure.
- [ ] Ghi prompt iteration/evaluation vào `docs/ai-log.md`.

#### Definition of Done

- Endpoint nhận input hợp lệ và trả đúng 3 looks từ Gemini.
- Model output luôn qua runtime validation trước khi trả ra ngoài.
- Không có source ID do model tự bịa lọt qua validation.
- Các lỗi chính trả đúng HTTP status/code, không lộ secret hoặc raw upstream payload.

### Linh - Cultural Data và Submission

#### Công việc

- [ ] Rà soát source/record đủ điều kiện dùng cho retrieval; ghi rõ record nào vẫn `needs_review`.
- [ ] Bổ sung knowledge context tối thiểu cho Áo dài và Nhật Bình để cân bằng 4 trang phục MVP.
- [ ] Đối chiếu record của Áo ngũ thân và Áo tứ thân với nguồn gốc; sửa phạm vi condition nếu đang khái quát quá mức.
- [ ] Tạo 5 acceptance cases cho recommendation flow, bao phủ 4 trang phục và `auto`.
- [ ] Kiểm tra cultural note/source IDs trong output thử nghiệm; ghi pass/warning/fail và lý do.
- [ ] Cập nhật `docs/cultural-sources.md`, `docs/cultural-kb-schema.md` nếu trạng thái review hoặc cách retrieval thay đổi.

#### Definition of Done

- Cả 4 trang phục có context thật để retrieval thử nghiệm hoặc có TODO/blocker cụ thể, không có dữ liệu bịa.
- Mọi source ID trong acceptance output tồn tại và hỗ trợ đúng claim liên quan.
- Record chưa đủ bằng chứng vẫn là advisory/needs review, không bị nâng thành hard rule.
- Có artefact đánh giá 5 cases để cả đội review trước Meeting 03.

Linh không triển khai Gemini, backend endpoint, frontend hoặc Cultural Guardrail trong checkpoint này.

## 7. Việc chung trước Meeting 03

- [ ] Các PR của ba thành viên đã được ít nhất một người khác review.
- [ ] `main` hoặc branch tích hợp chạy được flow input → 3 looks.
- [ ] `npm run validate:data` pass.
- [ ] Test liên quan recommendation/retrieval pass.
- [ ] `npm run lint` và `npm run typecheck` pass.
- [ ] Production build pass trước khi merge checkpoint.
- [ ] API contract và architecture phản ánh implementation thực tế.
- [ ] AI Log có prompt version, test result và reviewer.
- [ ] Không có API key/secret trong Git diff hoặc log.

## 8. Definition of Done của Meeting 02

- [ ] Form gửi một `RecommendationInput` hợp lệ vào `/api/recommend`.
- [ ] Retrieval cung cấp context văn hóa có provenance cho Stylist.
- [ ] Gemini Stylist trả đúng 3 looks khác nhau.
- [ ] Response qua runtime schema validation.
- [ ] Mọi source ID tồn tại trong Cultural KB.
- [ ] Results UI hiển thị được response thật.
- [ ] Loading và lỗi chính có trạng thái rõ ràng.
- [ ] Năm acceptance cases đã chạy và có kết quả lưu trong repo.
- [ ] Không tuyên bố Cultural Critic/guardrail đã hoàn thành ở checkpoint này.
- [ ] Cả ba owner demo phần mình và đồng ý điều kiện chuyển sang Meeting 03.

## 9. Quyết định cần ghi trong biên bản

```text
Ngày họp:
Thời gian:
Thành viên tham gia:

Gemini model cho Stylist:
Giới hạn context:
Policy record/source được retrieval:
Cách xử lý garment = auto:
Cách xử lý khi thiếu cultural context:
Cách truyền API response sang Results page:
Reviewer từng PR:
Deadline checkpoint 2:

Quyết định khác:
-
-

Blocker:
-
-
```

## 10. Handoff sang Meeting 03

Meeting 03 sẽ tập trung vào core flow hoàn chỉnh:

- Cultural Critic chạy độc lập với Stylist.
- Rule retrieval phục vụ validation, không chỉ generation.
- Output được kiểm tra thành `PASS`, `WARNING` hoặc `REVISE` với `ruleId` và suggested fix.
- Flow input → recommendation → cultural validation chạy end-to-end.

Không bắt đầu image generation hoặc remix nâng cao trước khi flow Meeting 02 ổn định và artefact đánh giá đã được review.

## 11. Trạng thái checkpoint

- [x] Đã lập kế hoạch.
- [ ] Chưa bắt đầu triển khai.
- [ ] Đang thực hiện.
- [ ] Hoàn thành.
- [ ] Có blocker cần xử lý.
