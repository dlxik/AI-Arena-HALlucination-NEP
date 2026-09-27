# Meeting 02 - Cultural acceptance review

Owner: **Diệu Linh**  
Ngày đánh giá baseline: **2026-09-27**

## Phạm vi

Artefact máy đọc được: `tests/prompt-evaluation/recommendation-cultural-cases.json`.

Năm case bao phủ Áo dài, Áo ngũ thân, Áo tứ thân, Nhật Bình và chế độ `auto`. Mỗi case kiểm tra ba lớp:

1. Garment/input có được tôn trọng hay không.
2. Cultural note có nằm trong phạm vi knowledge record hay không.
3. Mọi `sourceIds` có tồn tại và hỗ trợ claim liên quan hay không.

## Kết quả baseline

Baseline lịch sử được đánh giá ngày 2026-09-27 khi `POST /api/recommend` còn trả cùng `tests/fixtures/recommendation-output.json` cho mọi input. Đây không phải kết quả Gemini live và không phản ánh implementation đã tích hợp ngày 2026-09-28.

| Case | Garment | Cultural note | Source IDs | Overall | Lý do chính |
| --- | --- | --- | --- | --- | --- |
| `RC_01_AO_DAI_FESTIVAL` | Áo dài | Warning | Fail | **Fail** | Fixture trả Áo ngũ thân và `SOURCE_PLACEHOLDER` |
| `RC_02_AO_NGU_THAN_CULTURAL_VISIT` | Áo ngũ thân | Warning | Fail | **Fail** | Đúng nhãn garment nhưng cultural note chung chung, không có source thật |
| `RC_03_AO_TU_THAN_FESTIVAL` | Áo tứ thân | Warning | Fail | **Fail** | Fixture bỏ qua garment/context Kinh Bắc |
| `RC_04_NHAT_BINH_PHOTOSHOOT` | Nhật Bình | Warning | Fail | **Fail** | Fixture bỏ qua garment và không có context cung đình/đương đại |
| `RC_05_AUTO_TET` | Auto | Warning | Fail | **Fail** | Không giải thích lựa chọn garment; cả ba look dùng source không tồn tại |

`Warning` ở cột Cultural note nghĩa là fixture tự thừa nhận nội dung chưa được kiểm chứng; không đồng nghĩa cultural note đã đạt acceptance.

## Trạng thái rerun ngày 2026-09-28

- Retrieval + Gemini Stylist + runtime validation đã thay fixture trong `/api/recommend`.
- Automated tests dùng KB thật đã pass và xác nhận chặn source ID bịa, output thiếu look và context chưa approved.
- Đã chạy lại cả 5 case qua Gemini thật bằng `POST /api/recommend` với cấu hình local; cả 5 request trả HTTP 200 và đúng 3 looks.
- Kết quả review có cấu trúc được lưu trong `live_review` của từng case và được `npm run validate:data` kiểm tra.

| Case | Garment trả về | Cultural note | Source IDs | Overall | Nhận xét |
| --- | --- | --- | --- | --- | --- |
| `RC_01_AO_DAI_FESTIVAL` | Áo dài | Pass | Pass | **Pass** | Biến thể được đặt trong tiến trình lịch sử, không biến một kiểu cổ/tay thành chuẩn duy nhất |
| `RC_02_AO_NGU_THAN_CULTURAL_VISIT` | Áo ngũ thân | Pass | Pass | **Pass** | Claim năm khuy, tay hẹp được giới hạn ở biến thể tay chẽn |
| `RC_03_AO_TU_THAN_FESTIVAL` | Áo tứ thân | Pass | Pass | **Pass** | Giữ cấu trúc bốn thân và giới hạn tổ hợp yếm/váy/khăn ở bối cảnh lễ hội Kinh Bắc phục dựng |
| `RC_04_NHAT_BINH_PHOTOSHOOT` | Nhật Bình | Warning | Pass | **Warning** | Hai look chưa nói rõ cấu trúc cổ đối khâm hình chữ nhật; không có lỗi nguồn hay suy diễn phẩm cấp |
| `RC_05_AUTO_TET` | Áo ngũ thân, Nhật Bình, Áo dài | Pass | Pass | **Pass** | Mỗi lựa chọn được giải thích riêng và chỉ dùng source thuộc garment tương ứng |

Kết luận: **4 pass, 1 warning, 0 fail**. Warning `RC_04` có owner và hướng xử lý: Lan Anh nối rule `NB_STRUCTURE_RECTANGULAR_COLLAR` vào Cultural Critic ở Meeting 03; Linh review severity và suggested fix. Vì không còn source ID lỗi, sai garment hoặc output thiếu look, checkpoint cultural grounding của Meeting 02 đạt điều kiện chuyển tiếp.

## Thang đánh giá đã dùng

Linh đánh giá theo thang:

- `pass`: claim nằm trong record được retrieval và source hỗ trợ đúng phạm vi.
- `warning`: có nguồn thật nhưng diễn đạt rộng hơn condition, thiếu context hoặc dùng record advisory như quy tắc chắc chắn.
- `fail`: sai garment, source ID không tồn tại, citation không hỗ trợ claim, hoặc bịa fact/rule.

Meeting 02 chỉ đạt phần cultural grounding khi cả 5 case không còn lỗi source ID; mọi `warning` còn lại phải có owner và hướng sửa trước Meeting 03.
