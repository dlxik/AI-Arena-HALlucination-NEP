# Meeting 05 - Cultural adjudication report

Owner: **Diệu Linh**
Ngày review: **2026-10-06**
Artefact máy đọc được: `docs/meeting-05-cultural-adjudication.json`

## Kết quả

Linh đã adjudicate **19 case** từ bằng chứng runtime đã commit. Tập này bao phủ toàn bộ 16 case consolidated của Lan Anh và giữ thêm ba regression case văn hóa:

| Nhóm | Số case | Kết quả cultural review |
| --- | ---: | --- |
| Intent | 3 | 3/3 pass với actual output theo từng case |
| Recommendation | 4 | 4/4 pass, đủ bốn garment và chỉ dùng source đúng scope |
| Cultural Critic | 4 | 4/4 actual status/rule ID khớp expected |
| Image | 3 | Fallback contract pass; chưa có ảnh thật để visual review |
| Remix | 5 | 5/5 có validation mới, status/rule đúng và fallback minh bạch |

Không phát hiện P0/P1 trong tập bằng chứng hiện tại. Một P2 được giữ mở:

1. Image provider chưa trả ảnh thật; Linh phải review lại mọi ảnh generated trước khi dùng trong demo/submission.

## Cultural findings

- Áo dài: variation đương đại được chấp nhận khi không biến một dạng cổ/tay thành chuẩn duy nhất.
- Áo ngũ thân: case phục dựng tay chẽn giữ scope năm cúc vạt phải và tay hẹp; claim từ một hiện vật không được suy rộng.
- Áo tứ thân: cấu trúc bốn thân và tổ hợp lễ hội Kinh Bắc được phân biệt rõ; tổ hợp sự kiện không phải đồng phục phổ quát.
- Nhật Bình: Critic bắt được thiếu cổ đối khâm hình chữ nhật và claim motif/phẩm cấp không có đủ căn cứ.
- Mọi warning trong KB hiện là advisory; không tự nâng thành `revise` khi chưa có hard rule được đội phê duyệt.

## Source audit

| Source | Status | Garment scope | Quyết định Meeting 05 |
| --- | --- | --- | --- |
| `VNMH_AO_NGU_THAN_2021` | approved | `ao_ngu_than` | Được dùng |
| `VHTT_AO_TU_THAN_KINH_BAC` | approved | `ao_tu_than` | Được dùng |
| `VNMH_AO_TU_THAN_CONTEXT_2016` | approved | `ao_tu_than` | Được dùng |
| `VNMH_AO_DAI_2015` | approved | `ao_dai` | Được dùng |
| `VHNT_NHAT_BINH_MOTIF_2025` | approved | `nhat_binh` | Được dùng, không khái quát hiện vật cụ thể |
| `VHNT_NHAT_BINH_CONTEXT_2022` | approved | `nhat_binh` | Được dùng |
| `VWM_AO_DAI` | needs_review | ba nhóm áo | Tiếp tục loại khỏi production retrieval |
| `HMCC_NHAT_BINH_2022` | needs_review | `nhat_binh` | Tiếp tục loại khỏi production retrieval |

Validator xác nhận mọi citation trong 19 case tồn tại, `approved`, đúng garment; mọi rule được tham chiếu đều `verified`, `reviewed: true` và đúng source scope. Linh **không nâng trạng thái** hai nguồn chưa đối chiếu đủ toàn văn.

## Image review gate

Artefact Meeting 04 có tám image calls nhưng cả tám đều trả `fallbackReason: not_configured`. Vì vậy:

- fallback được chấm pass về tính minh bạch;
- `visual_review` là không áp dụng, không được ghi thành pass thẩm mỹ/cấu trúc;
- sau khi có ảnh thật, cần ghi riêng: nhận diện garment, context, motif/rank claim, text-image consistency và lỗi chất lượng hình;
- ảnh AI không được dùng để bổ sung fact/rule hoặc chứng minh tính xác thực lịch sử.

## Cách chạy validation

```bash
npm run validate:meeting05-cultural
```

Validator kiểm tra tổng số case, coverage từng nhóm, duplicate ID, source approval, garment scope, rule verification và source linkage.

## Handoff

- Lan Anh: consolidated evaluation và raw intent outputs đã hoàn thành; cấu hình image provider nếu đội có model khả dụng.
- Hiền: xác nhận shot list khớp UI/deploy candidate và cung cấp screenshot/recording thật.
- Linh: phần Meeting 05 đã hoàn tất với image review N/A; nếu có generated output trước submission, mở lại visual-review gate và cập nhật P2.
