# Meeting 03 - Cultural Critic acceptance review

Owner: **Diệu Linh**
Ngày chuẩn bị: **2026-10-01**

## Artefact

File máy đọc được: `tests/fixtures/cultural-validation-cases.json`.

Artefact gồm:

- Ma trận đủ **14/14 knowledge records**: garment, trigger, expected status/severity, suggested action và approved source.
- **8 cultural acceptance cases**: mỗi garment có một case đúng (`pass`) và một case cần cảnh báo (`warning`).
- `case_review` ghi kết quả Linh review expected behavior.
- `runtime_review` giữ `pending` cho tới khi Cultural Critic độc lập của Lan Anh chạy được.

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

## Handoff cho Lan Anh

1. Dùng `rule_matrix` làm expected policy, không hard-code wording vào model output.
2. Chạy 8 cases sau khi `/api/validate` và Critic độc lập hoàn thành.
3. Lưu actual status, warning/rule IDs và suggested fix; Linh cập nhật `runtime_review` thành pass/warning/fail.
4. Đặc biệt xác nhận `CV_M03_08` bắt được `NB_STRUCTURE_RECTANGULAR_COLLAR`.
5. Reject rule/source bịa ở runtime validation trước khi trả response.

## TODO cần teammate

- **Lan Anh:** triển khai Rule Retrieval/Critic và tạo actual output cho 8 cases.
- **Hiền:** xác nhận UI hiển thị warning dài, reason, rule ID và suggested fix.
- **Cả đội:** chỉ tạo `revise` cultural case sau khi thống nhất hard-rule policy; hiện chưa có hard rule đủ điều kiện.
