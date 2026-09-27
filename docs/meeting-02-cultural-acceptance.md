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

Baseline được đánh giá bằng kiểm tra tĩnh implementation hiện tại: `POST /api/recommend` trả cùng `tests/fixtures/recommendation-output.json` cho mọi input. Đây không phải kết quả Gemini live.

| Case | Garment | Cultural note | Source IDs | Overall | Lý do chính |
| --- | --- | --- | --- | --- | --- |
| `RC_01_AO_DAI_FESTIVAL` | Áo dài | Warning | Fail | **Fail** | Fixture trả Áo ngũ thân và `SOURCE_PLACEHOLDER` |
| `RC_02_AO_NGU_THAN_CULTURAL_VISIT` | Áo ngũ thân | Warning | Fail | **Fail** | Đúng nhãn garment nhưng cultural note chung chung, không có source thật |
| `RC_03_AO_TU_THAN_FESTIVAL` | Áo tứ thân | Warning | Fail | **Fail** | Fixture bỏ qua garment/context Kinh Bắc |
| `RC_04_NHAT_BINH_PHOTOSHOOT` | Nhật Bình | Warning | Fail | **Fail** | Fixture bỏ qua garment và không có context cung đình/đương đại |
| `RC_05_AUTO_TET` | Auto | Warning | Fail | **Fail** | Không giải thích lựa chọn garment; cả ba look dùng source không tồn tại |

`Warning` ở cột Cultural note nghĩa là fixture tự thừa nhận nội dung chưa được kiểm chứng; không đồng nghĩa cultural note đã đạt acceptance.

## Điều kiện rerun

Lan Anh rerun sau khi `/api/recommend` đã thay fixture bằng Cultural Retrieval + Gemini Stylist và lưu output của từng case. Linh cập nhật đánh giá theo thang:

- `pass`: claim nằm trong record được retrieval và source hỗ trợ đúng phạm vi.
- `warning`: có nguồn thật nhưng diễn đạt rộng hơn condition, thiếu context hoặc dùng record advisory như quy tắc chắc chắn.
- `fail`: sai garment, source ID không tồn tại, citation không hỗ trợ claim, hoặc bịa fact/rule.

Meeting 02 chỉ đạt phần cultural grounding khi cả 5 case không còn lỗi source ID; mọi `warning` còn lại phải có owner và hướng sửa trước Meeting 03.
