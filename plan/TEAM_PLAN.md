# AI Arena HALlucination - Kế hoạch phối hợp tổng

Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu dự án

Xây dựng một trợ lý phối Việt phục có khả năng:

- Nhận nhu cầu về dịp sử dụng, loại trang phục, phong cách, màu sắc và mức độ remix.
- Đề xuất 3 bản phối kèm hình ảnh minh họa.
- Giải thích lý do lựa chọn và thông tin văn hóa liên quan.
- Kiểm tra mức độ phù hợp văn hóa bằng `Cultural Critic`.
- Hiển thị nguồn tham khảo qua `Cultural Passport`.
- Cho phép người dùng thay đổi một số thành phần và kiểm tra lại.

## 2. Phạm vi MVP

### Trang phục

1. Áo dài.
2. Áo ngũ thân.
3. Áo tứ thân.
4. Nhật Bình.

### Input

- Dịp sử dụng.
- Loại trang phục hoặc chế độ tự động chọn.
- Phong cách.
- Màu sắc.
- Mức độ remix.
- Mô tả tự do.

### Output

- 3 bản phối.
- Tên và mô tả từng bản phối.
- Trang phục, bảng màu, phụ kiện và các thành phần chính.
- Lý do phù hợp với yêu cầu.
- Cultural note.
- Kết quả `PASS`, `WARNING` hoặc `REVISE`.
- Cảnh báo và gợi ý sửa nếu cần.
- Nguồn tham khảo.
- Hình ảnh minh họa hoặc placeholder khi tạo ảnh thất bại.

### Không thuộc MVP

- Virtual try-on.
- Đăng nhập và quản lý tài khoản.
- Mạng xã hội nội bộ.
- Gợi ý theo thời tiết thời gian thực.
- Thanh toán hoặc thương mại điện tử.
- Animation phức tạp.

## 3. Phân vai

| Thành viên | Owner chính | Trách nhiệm |
|---|---|---|
| Hiền | Product và Frontend | User flow, UX/UI, form, result cards, Cultural Passport UI, responsive, deploy |
| Lan Anh | AI và Backend | Gemini API, structured output, prompt, Stylist, Cultural Critic, image pipeline, error handling |
| Linh | Cultural Data và Submission | Cultural KB, nguồn, rule, test case, đánh giá cultural correctness, video, hồ sơ nộp |

`Cultural Guardrail` có hai owner:

- Lan Anh chịu trách nhiệm triển khai kỹ thuật.
- Linh chịu trách nhiệm tính đúng đắn văn hóa.

## 4. Kiến trúc dự kiến

```text
User Input
    ↓
Intent Parser
    ↓
Cultural Knowledge Retrieval
    ↓
Gemini Stylist
    ↓
Cultural Critic
    ↓
Image Generator
    ↓
Result UI + Cultural Passport
```

## 5. Sáu checkpoint làm việc

| Buổi | Checkpoint | Điều kiện hoàn thành |
|---|---|---|
| 1 | Chốt bài toán và dựng nền | Scope, user flow, schema, repo workflow, Gemini API thử nghiệm và Cultural KB Sheet đã có |
| 2 | Flow đề xuất đầu tiên | Input đi qua Gemini và trả 3 looks đúng schema để frontend hiển thị |
| 3 | Core flow hoàn chỉnh | Cultural Critic hoạt động độc lập; input đến validation chạy end-to-end |
| 4 | Hoàn thiện trải nghiệm chính | Có ảnh, Cultural Passport và remix được kiểm tra lại |
| 5 | Đánh giá và khóa scope | Chạy 15-20 test cases, khóa prompt, hoàn thiện tài liệu và bản nháp submission |
| 6 | Tổng duyệt và nộp | Deploy, video, repo, Gemini conversation và form submission đều sẵn sàng |

Chi tiết của từng buổi chỉ được viết khi chuẩn bị tới checkpoint tương ứng để kế hoạch phản ánh đúng tiến độ thực tế.

## 6. Quy trình Git

### Branches

```text
main
dev
feature/frontend
feature/gemini
feature/data
```

### Luồng làm việc

```text
feature branch
    ↓
Pull Request
    ↓
Ít nhất 1 thành viên khác review
    ↓
Merge vào dev
    ↓
Test tích hợp
    ↓
Merge main khi đạt checkpoint
```

Quy tắc:

- Không push trực tiếp lên `main`.
- Không giữ code nhiều ngày chỉ ở máy cá nhân.
- Không merge khi làm hỏng schema chung.
- Không commit `.env`, API key hoặc secret.
- Mỗi commit chỉ nên giải quyết một nhóm thay đổi rõ ràng.
- Mỗi Pull Request phải ghi cách kiểm tra và kết quả kiểm tra.

## 7. Quy trình phối hợp

### Mỗi ngày

Mỗi thành viên cập nhật ngắn:

```text
Đã hoàn thành:
Đang thực hiện:
Blocker:
PR/tài liệu liên quan:
```

Nếu bị block quá 4 giờ, báo ngay trong nhóm thay vì chờ tới buổi họp.

### Trước mỗi buổi họp

- Đẩy phần có thể chạy lên feature branch.
- Mở Pull Request nếu phần việc đủ để review.
- Cập nhật task board.
- Chuẩn bị demo trực tiếp.
- Ghi các quyết định đang cần cả đội thống nhất.

### Trong mỗi buổi họp

1. Mở demo hiện tại và chạy end-to-end.
2. So sánh kết quả với Definition of Done của checkpoint.
3. Review các lỗi và blocker.
4. Chốt quyết định chung.
5. Chia việc tới checkpoint tiếp theo.

Không coi việc trình bày bằng lời là bằng chứng hoàn thành. Mọi kết quả phải thể hiện bằng demo, commit, Pull Request, dữ liệu hoặc tài liệu.

## 8. Quản lý schema

Schema input/output phải được thống nhất từ buổi 1.

Khi muốn thay đổi schema:

1. Tạo đề xuất thay đổi.
2. Mô tả lý do và các thành phần bị ảnh hưởng.
3. Cả ba thành viên đồng ý.
4. Cập nhật type, fixture, API contract và tài liệu.
5. Sau đó mới sửa implementation.

## 9. Quản lý Cultural Knowledge Base

Mỗi fact văn hóa cần có tối thiểu:

```text
garment
category
fact
rule_type
source_id
publisher
url
confidence
reviewed
```

Quy tắc:

- Nguồn bảo tàng, cơ quan di sản và nghiên cứu học thuật được ưu tiên.
- Shop, blog và Pinterest không được dùng làm ground truth.
- Fact chưa có nguồn không được biến thành hard rule.
- Gemini không được tự tạo citation hoặc `source_id`.
- Mọi `source_id` trong output phải tồn tại trong `references.json`.

## 10. Quản lý prompt và AI tools

Prompt production phải được lưu trong repository:

```text
prompts/
├── intent/
├── stylist/
├── critic/
├── image/
└── final/
```

Mỗi lần sửa prompt quan trọng cần ghi:

```text
Case:
Expected:
Actual:
Problem:
Prompt change:
Result after change:
```

Đội có thể dùng Codex, Claude, Antigravity hoặc công cụ tương tự để hỗ trợ code nếu quy chế không cấm. Thành viên sử dụng vẫn phải hiểu, kiểm thử và review output trước khi merge.

Một Gemini conversation chính thức được duy trì từ đầu dự án để lưu:

- Phân tích đề.
- Persona và user need.
- Schema design.
- Prompt iteration.
- Test cases.
- UX và pitch critique.

Không tạo lịch sử hội thoại giả vào ngày cuối.

## 11. Definition of Done tổng

### Gemini Stylist

- Trả đúng 3 looks.
- JSON parse được.
- Không thiếu required fields.
- Sử dụng cultural context được cung cấp.
- Không tự tạo hard rule hoặc citation.

### Cultural Critic

- Chạy độc lập với Stylist.
- Trả `PASS`, `WARNING` hoặc `REVISE`.
- Chỉ ra `rule_id`, severity, reason và suggested fix.
- Bắt được các test case cố tình sai quan trọng.

### Cultural KB

- Có dữ liệu cho 4 loại trang phục MVP.
- Các fact quan trọng có nguồn.
- JSON validate được.
- Retrieval và Critic sử dụng được.

### Demo

- Người ngoài có thể mở URL không cần đăng nhập.
- Người dùng nhập nhu cầu và nhận được 3 bản phối.
- Có ảnh hoặc fallback.
- Có Cultural Passport.
- Có kết quả validation.
- Không lộ secret.

## 12. Artefact cuối cùng

- Demo URL.
- GitHub repository.
- Video demo.
- Gemini conversation URL.
- Prompt versions.
- Evaluation sheet.
- Cultural sources.
- Architecture document.
- Nội dung submission.
- Screenshot hoặc email xác nhận đã nộp.

## 13. Trạng thái hiện tại

- [x] Repository đã được tạo.
- [ ] Hoàn thành checkpoint buổi 1.
- [ ] Hoàn thành checkpoint buổi 2.
- [ ] Hoàn thành checkpoint buổi 3.
- [ ] Hoàn thành checkpoint buổi 4.
- [ ] Hoàn thành checkpoint buổi 5.
- [ ] Hoàn thành checkpoint buổi 6.
