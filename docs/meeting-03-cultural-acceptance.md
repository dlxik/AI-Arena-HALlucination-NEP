# Meeting 03 - Cultural Critic acceptance review

Owner: **Diệu Linh**
Ngày chuẩn bị: **2026-10-01**

## Artefact

File máy đọc được: `tests/fixtures/cultural-validation-cases.json`.

Artefact gồm:

- Ma trận đủ **14/14 knowledge records**: garment, trigger, expected status/severity, suggested action và approved source.
- **8 cultural acceptance cases**: mỗi garment có một case đúng (`pass`) và một case cần cảnh báo (`warning`).
- `case_review` ghi kết quả Linh review expected behavior.
- Expected cases của Linh được giữ riêng với backend evaluation inputs của Lan Anh để tránh biến expected fixture thành bằng chứng runtime.
- Live output đã được Linh review trong `docs/meeting-03-critic-evaluation.json` ngày 2026-10-02.

## Quyết định severity và status

Hiện tại toàn bộ record trong `data/knowledge/records.json` có `enforcement: advisory`.

| Tình huống | Expected status | Severity |
| --- | --- | --- |
| Look tuân thủ rule flexible/context/preserve đúng phạm vi | `pass` | Không có warning |
| Khái quát sai context hoặc hiện vật cụ thể | `warning` | `low` hoặc `medium` theo ma trận |
| Làm mất đặc điểm preserve nhưng rule vẫn advisory | `warning` | `medium` |
| Vi phạm hard rule đã được đội phê duyệt | `revise` | Chưa có case hợp lệ trong KB hiện tại |
| Model tạo rule/source ID không tồn tại | Reject output bằng runtime validation | Không biến thành cultural verdict |

Không được nâng một advisory rule thành `revise` chỉ để đủ ba nhãn. Nếu Meeting 03 cần case `revise`, đội phải phê duyệt hard rule/technical invariant và cập nhật KB, contract, validator cùng lúc.

## Coverage

| Case | Garment | Expected | Rule chính | Cultural review |
| --- | --- | --- | --- | --- |
| `CV_M03_01_AO_DAI_VALID_VARIATION` | Áo dài | Pass | Flexible variation | Pass |
| `CV_M03_02_AO_DAI_SINGLE_FORM` | Áo dài | Warning | `AD_WARNING_SINGLE_FORM_GENERALIZATION` | Pass |
| `CV_M03_03_NGU_THAN_TAY_CHEN_VALID` | Áo ngũ thân | Pass | Tay chẽn đúng phạm vi | Pass |
| `CV_M03_04_NGU_THAN_TAY_CHEN_CONFLICT` | Áo ngũ thân | Warning | Năm cúc + tay hẹp | Pass |
| `CV_M03_05_TU_THAN_VALID_CONTEXT` | Áo tứ thân | Pass | Bốn thân + context Kinh Bắc | Pass |
| `CV_M03_06_TU_THAN_CONTEXT_UNIVERSALIZED` | Áo tứ thân | Warning | `ATT_CONTEXT_KINH_BAC_FESTIVAL` | Pass |
| `CV_M03_07_NHAT_BINH_VALID_CONTEMPORARY` | Nhật Bình | Pass | Cổ chữ nhật + contemporary variation | Pass |
| `CV_M03_08_NHAT_BINH_COLLAR_REGRESSION` | Nhật Bình | Warning | `NB_STRUCTURE_RECTANGULAR_COLLAR` | Pass |

`Cultural review: Pass` nghĩa là expected status, rule, severity và suggested fix đã được Linh đối chiếu với Cultural KB. Nó không phải kết quả chạy Gemini Critic.

## Live cultural review ngày 2026-10-02

| Backend case | Actual | Rule IDs | Review |
| --- | --- | --- | --- |
| `CC_01_AO_DAI_VALID` | Pass | Không có | Pass |
| `CC_02_AO_DAI_GENERALIZATION` | Warning | `AD_WARNING_SINGLE_FORM_GENERALIZATION` | Pass |
| `CC_03_NGU_THAN_VALID` | Pass | Không có | Pass |
| `CC_04_NGU_THAN_BUTTONS` | Warning | `ANT_STRUCTURE_FIVE_BUTTONS` | Pass |
| `CC_05_TU_THAN_VALID` | Pass | Không có | Pass |
| `CC_06_TU_THAN_UNIVERSAL_ENSEMBLE` | Warning | `ATT_CONTEXT_KINH_BAC_FESTIVAL` | Pass |
| `CC_07_NHAT_BINH_VALID` | Pass | Không có | Pass |
| `CC_08_RC04_NHAT_BINH_MISSING_COLLAR` | Warning | `NB_STRUCTURE_RECTANGULAR_COLLAR` | Pass |

Kết luận: **8/8 output khớp expected status và rule IDs**. Severity phù hợp với enforcement `advisory`; suggested fix thu hẹp claim/context hoặc khôi phục đặc điểm nhận diện mà không tuyệt đối hóa. Runtime validation đã chặn rule/source không tồn tại, sai garment hoặc chưa approved qua automated tests.

## Review wording

- Suggested fix phải sửa đúng vấn đề và đưa ra lựa chọn thu hẹp nhãn/context khi phù hợp.
- Không dùng từ như “cấm”, “sai hoàn toàn” hoặc “bắt buộc” nếu record chỉ `advisory`.
- Rule về một hiện vật không được diễn đạt thành chuẩn của toàn bộ garment.
- Flexible rule cho phép thay đổi trong condition, không phải cho phép mọi thay đổi ở mọi bối cảnh.
- Context rule cần nêu rõ thời kỳ, khu vực, sự kiện hoặc nhóm hiện vật mà nguồn hỗ trợ.

## Provenance review

- Tất cả rule ID trong ma trận/case phải tồn tại trong `records.json`, đúng garment, `verified` và `reviewed: true`.
- Tất cả source ID phải tồn tại trong `references.json`, đúng garment và có `status: approved`.
- `VWM_AO_DAI` và `HMCC_NHAT_BINH_2022` vẫn `needs_review`, không xuất hiện trong Critic fixture.
- Validator yêu cầu ma trận phủ đủ mọi knowledge record và mỗi garment có cả pass/warning case.

## Handoff đã hoàn thành

1. Rule Retrieval và Critic dùng record đủ điều kiện, không hard-code verdict từ expected fixture.
2. Tám backend cases đã chạy live và được lưu cùng provenance an toàn.
3. Regression Nhật Bình bắt đúng `NB_STRUCTURE_RECTANGULAR_COLLAR`.
4. Runtime validation từ chối rule/source bịa hoặc không đủ điều kiện.

## TODO chuyển sang checkpoint sau

- **Cả đội:** chỉ tạo `revise` cultural case sau khi thống nhất hard-rule policy; hiện chưa có hard rule đủ điều kiện.
- Hai source `VWM_AO_DAI` và `HMCC_NHAT_BINH_2022` vẫn cần review thủ công và tiếp tục bị loại khỏi production retrieval.
