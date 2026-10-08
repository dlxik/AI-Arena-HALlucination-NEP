# AI Arena HALlucination - Submission draft

Trạng thái: **Bản nháp Meeting 05 — chưa phải nội dung nộp cuối**
Owner nội dung: **Diệu Linh**

## Project summary

AI Arena HALlucination là trợ lý phối Việt phục có nguồn tham khảo. Người dùng nhập dịp sử dụng, loại trang phục, phong cách, màu sắc và mức độ remix; hệ thống trả ba gợi ý, chạy một Cultural Critic độc lập, tạo ảnh minh họa hoặc fallback minh bạch và cung cấp Cultural Passport.

## Problem

Một gợi ý thời trang do AI tạo ra có thể trông thuyết phục nhưng vẫn trộn sai cấu trúc trang phục, khái quát một hiện vật thành quy tắc phổ quát hoặc bịa nguồn. Với trang phục văn hóa, lỗi này không chỉ là lỗi thẩm mỹ mà còn làm người dùng hiểu sai về lịch sử và bối cảnh sử dụng.

## Approach

Pipeline tách bước sáng tạo và bước kiểm tra:

1. Parse nhu cầu người dùng thành structured intent.
2. Retrieval chỉ lấy garment/source đã duyệt và knowledge record đã verify.
3. Gemini Stylist tạo đúng ba looks có cấu trúc.
4. Gemini Cultural Critic chạy độc lập và trả `pass`, `warning` hoặc `revise` cùng rule ID, lý do và gợi ý sửa.
5. Image pipeline chỉ chạy sau validation; lỗi provider trả fallback rõ ràng.
6. Cultural Passport hiển thị cultural note, validation và provenance.
7. Mọi remix trong whitelist phải chạy lại Critic trước khi tạo ảnh mới.

## Cultural safeguards

- KB giới hạn ở bốn garment MVP: áo dài, áo ngũ thân, áo tứ thân và Nhật Bình.
- Production retrieval chỉ dùng source `approved`; source `needs_review` bị loại khỏi prompt.
- Model không được tạo `source_id` hoặc hard rule mới.
- Claim về hiện vật, motif, phẩm cấp và context phải giữ đúng phạm vi nguồn.
- Mọi record hiện là advisory; dự án không tạo `revise` giả chỉ để đủ nhãn.
- Ảnh AI luôn được ghi là minh họa, không phải hiện vật hay phục dựng xác thực.

## Gemini usage

- Structured intent parsing.
- Grounded recommendation generation.
- Independent Cultural Critic with runtime-validated structured output.
- Image generation adapter có timeout, safety mapping và validation; cấu hình provider/model lấy từ environment.

Model, prompt hash và kết quả chạy cuối phải lấy từ artefact evaluation của Lan Anh; không điền từ trí nhớ vào bản nộp.

## Evaluation

Artefact cultural Meeting 05 hiện có 19 case, bao phủ toàn bộ 16 case consolidated và ba regression case bổ sung:

- 3 intent;
- 4 recommendation;
- 4 Critic;
- 3 image/fallback;
- 5 remix.

Bốn garment đều có coverage. Recommendation 4/4, Critic 4/4 và remix 5/5 khớp expected cultural outcome. Ba image cases trả fallback `not_configured` minh bạch; chưa có ảnh thật để chấm visual. Ba intent cases có raw actual output và khớp expected structured fields/range.

## Impact

Prototype giúp người dùng khám phá cách phối Việt phục trong khi vẫn nhìn thấy giới hạn, cảnh báo và nguồn của đề xuất. Kiến trúc retrieval + independent Critic + provenance có thể tái sử dụng cho những miền sáng tạo khác cần cân bằng giữa thử nghiệm và trách nhiệm văn hóa.

## Limitations

- KB nhỏ và chưa đại diện cho mọi vùng, thời kỳ hoặc biến thể.
- Hai nguồn vẫn `needs_review` và không được dùng ở production.
- Không có hard cultural rule được phê duyệt; `revise` chỉ hợp lệ khi policy này thay đổi có review.
- Chất lượng/correctness của ảnh thật chưa được đánh giá vì provider chưa cấu hình trong artefact hiện tại.
- Hệ thống hỗ trợ ra quyết định, không thay thế chuyên gia hoặc xác thực hiện vật.

## Links cần điền trước khi nộp

- Demo URL: `TODO_MEETING_06`
- Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>
- Video URL: `TODO_MEETING_06`
- Gemini conversation URL: `TODO_TEAM`
- Final evaluation artefact: `TODO_LAN_ANH`
- Screenshot/email xác nhận nộp: `TODO_MEETING_06`

## Final-copy checklist

- [ ] Số liệu khớp artefact evaluation cuối.
- [ ] Không tuyên bố có ảnh thật nếu demo chỉ dùng fallback.
- [ ] Không gọi ảnh AI là phục dựng hoặc hiện vật.
- [ ] Không đưa source `needs_review` vào phần bằng chứng.
- [ ] Mọi URL công khai mở được mà không cần tài khoản ngoài yêu cầu cuộc thi.
- [ ] Hiền và Lan Anh review nội dung thuộc phần của mình.
