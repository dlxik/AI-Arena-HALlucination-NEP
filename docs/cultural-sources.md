# Cultural sources

Ngày cập nhật: **2026-09-25**. Danh sách máy đọc được nằm tại `data/sources/references.json`.

Tất cả nguồn hiện mang trạng thái `needs_review`. Chưa nguồn nào được xem là ground truth production cho tới khi Diệu Linh hoặc một reviewer khác mở tài liệu, kiểm tra đoạn trích, phạm vi sử dụng và quyền trích dẫn.

## Danh sách nguồn ban đầu

| Garment | Source ID | Type | Reliability | Kiến thức dự kiến sử dụng |
| --- | --- | --- | --- | --- |
| Áo ngũ thân | `VNMH_AO_NGU_THAN_2021` | Museum | High | Cấu trúc hàng cúc và tay của hiện vật áo ngũ thân tay chẽn |
| Áo ngũ thân / Áo dài / Áo tứ thân | `VWM_AO_DAI` | Museum | High | Mối liên hệ trong tiến trình hình thành áo dài hiện đại |
| Áo tứ thân | `VHTT_AO_TU_THAN_KINH_BAC` | Academic journal | Medium | Cấu trúc thân/vạt trong ngữ cảnh trang phục nữ Kinh Bắc |
| Áo tứ thân | `VNMH_AO_TU_THAN_CONTEXT_2016` | Museum | High | Tổ hợp trang phục của một hội thi mùa xuân được phục dựng |
| Áo dài | `VNMH_AO_DAI_2015` | Museum | High | Diễn tiến và yếu tố tạo hình áo dài thế kỷ XX |
| Nhật Bình | `VJOL_NHAT_BINH_2026` | Academic journal | High | Hoa văn trên một hiện vật Nhật Bình cụ thể |
| Nhật Bình | `HMCC_NHAT_BINH_2022` | Heritage authority | High | Hiện vật Nhật Bình cung tần cuối thế kỷ XIX–đầu XX |

Chi tiết title, URL, categories, usable knowledge và giới hạn của từng nguồn được lưu trực tiếp trong `references.json` để validator kiểm tra.

## Nguyên tắc sử dụng

- Ưu tiên bảo tàng, cơ quan di sản, bài nghiên cứu và tài liệu chuyên môn.
- Shop, dịch vụ cho thuê, blog thương mại và Pinterest không được dùng làm ground truth.
- Mô tả một hiện vật không tự động trở thành quy tắc cho toàn bộ loại trang phục.
- Fact chưa chắc chắn chỉ được giữ ở `needs_review` và `advisory`.
- Mọi `source_ids` trong knowledge/rule phải tồn tại trong `references.json`.
- `reliability: high` mô tả loại/độ trực tiếp của nguồn, không đồng nghĩa record đã được team phê duyệt.

## Checklist kiểm chứng thủ công

1. Mở URL và xác nhận publisher/title khớp metadata.
2. Lưu đoạn hoặc số trang hỗ trợ từng fact nếu tài liệu có phân trang.
3. Kiểm tra câu diễn giải không vượt quá phạm vi hiện vật, vùng, thời kỳ hoặc sự kiện.
4. Tìm nguồn độc lập thứ hai cho các `preserve` candidates.
5. Xác nhận quyền trích dẫn/hình ảnh trước khi dùng trong Cultural Passport hoặc submission.
6. Ghi reviewer/ngày review trước khi chuyển source sang `approved`.

## Nguồn cần ưu tiên review

- `VNMH_AO_NGU_THAN_2021`: xác nhận năm cúc và tay chẽn có thể áp dụng tới biến thể nào.
- `VHTT_AO_TU_THAN_KINH_BAC`: đối chiếu cấu trúc tứ thân với một hiện vật hoặc nghiên cứu độc lập.
- `VJOL_NHAT_BINH_2026`: đọc toàn văn để không khái quát hoa văn của một hiện vật.
- `HMCC_NHAT_BINH_2022`: xác nhận metadata và phạm vi mô tả hiện vật trên trang lưu trữ.

## Điểm mang sang Meeting 02

- Chọn reviewer văn hóa và quy tắc chuyển `needs_review` → `approved`.
- Chốt phạm vi garment theo vùng/thời kỳ/biến thể.
- Quyết định preserve candidate nào đủ bằng chứng để thử nghiệm trong Cultural Critic.
- Bổ sung facts cho Áo dài và Nhật Bình sau khi review nguồn toàn văn.
