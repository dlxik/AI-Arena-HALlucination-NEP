# Cultural sources

Ngày cập nhật: **2026-09-27**. Danh sách máy đọc được nằm tại `data/sources/references.json`.

Meeting 02 đã review trực tiếp 6/8 nguồn để dùng cho **retrieval thử nghiệm**. Trạng thái `approved` nghĩa là URL, publisher và phạm vi claim đã được Diệu Linh đối chiếu; không đồng nghĩa mọi thông tin trong nguồn trở thành hard rule hoặc đã được chuyên gia độc lập thẩm định.

## Danh sách nguồn

| Garment | Source ID | Type | Reliability | Status | Phạm vi được dùng |
| --- | --- | --- | --- | --- | --- |
| Áo ngũ thân | `VNMH_AO_NGU_THAN_2021` | Museum | High | `approved` | Nhóm hiện vật áo ngũ thân tay chẽn: năm cúc bên phải, tay nhỏ gọn, biến thiên chất liệu/kỹ thuật |
| Áo tứ thân | `VHTT_AO_TU_THAN_KINH_BAC` | Academic journal | Medium | `approved` | Bốn khổ vải/tà và khả năng buộc tà trong ngữ cảnh trang phục nữ Kinh Bắc |
| Áo tứ thân | `VNMH_AO_TU_THAN_CONTEXT_2016` | Museum | High | `approved` | Quy định trang phục của một hội thi nấu cơm xuân được phục dựng ở Bắc Ninh |
| Áo dài | `VNMH_AO_DAI_2015` | Museum | High | `approved` | Tiến trình cải biến áo dài phụ nữ thế kỷ XX và biến thiên kiểu dáng/chất liệu/trang trí |
| Nhật Bình | `VHNT_NHAT_BINH_MOTIF_2025` | Academic journal | High | `approved` | Cấu trúc cổ/bối cảnh cung đình; hoa văn chỉ của hiện vật Đoan Huy Hoàng thái hậu 1926-1945 |
| Nhật Bình | `VHNT_NHAT_BINH_CONTEXT_2022` | Academic journal | Medium | `approved` | Context cuối thế kỷ XIX, hậu 1945 và cách dùng đương đại trong dịp trang trọng |
| Áo ngũ thân / Áo dài / Áo tứ thân | `VWM_AO_DAI` | Museum | High | `needs_review` | Tổng quan quan hệ giữa các dạng áo; chưa dùng cho knowledge record Meeting 02 |
| Nhật Bình | `HMCC_NHAT_BINH_2022` | Heritage authority | High | `needs_review` | Metadata hiện vật cuối thế kỷ XIX-đầu XX; chưa dùng cho knowledge record Meeting 02 |

Chi tiết title, URL, categories, usable knowledge, reviewer và giới hạn được lưu trong `references.json`.

## Kết quả review Meeting 02

- Sửa source Nhật Bình từ trang VJOL khó truy cập sang bài toàn văn gốc trên Tạp chí Văn hóa Nghệ thuật, đồng thời sửa ID theo đúng năm xuất bản 2025.
- Thêm nguồn `VHNT_NHAT_BINH_CONTEXT_2022` để tách context đương đại khỏi nghiên cứu một hiện vật cụ thể.
- Sửa URL `HMCC_NHAT_BINH_2022` sang trang chính thức của Bảo tàng Cổ vật Cung đình Huế, nhưng giữ `needs_review` vì công cụ chưa tải được toàn văn.
- Sửa claim Áo tứ thân: nguồn mô tả áo dài tứ thân có bốn khổ vải/tà; chi tiết “hai thân sau nối giữa lưng” ở đoạn liền trước thuộc **áo cánh**, không được dùng cho áo tứ thân.
- Bổ sung `reviewed_by` và `reviewed_at` cho mọi source `approved`.

## Nguyên tắc sử dụng

- Retrieval thử nghiệm chỉ dùng garment `approved`, record `verified` và source `approved`.
- Mọi rule Meeting 02 vẫn là `advisory`; không có hard rule nào.
- Mô tả một hiện vật không tự động trở thành quy tắc cho toàn bộ loại trang phục.
- `reliability: high` mô tả độ trực tiếp/thẩm quyền của nguồn, không thay thế review phạm vi claim.
- Shop, dịch vụ cho thuê, blog thương mại, Pinterest và nội dung AI-generated không được dùng làm ground truth.
- Mọi `source_ids` trong knowledge/rule và output phải tồn tại trong `references.json`.
- Với `garment: auto`, chỉ trích source gắn với garment thực sự được chọn.

## Nguồn vẫn cần kiểm chứng thủ công

1. `VWM_AO_DAI`: mở trang Bảo tàng Phụ nữ Việt Nam, đối chiếu title/nội dung và ghi đoạn hỗ trợ trước khi chuyển `approved`.
2. `HMCC_NHAT_BINH_2022`: mở toàn văn trang Bảo tàng Cổ vật Cung đình Huế, xác nhận metadata và đoạn nói về niên đại hiện vật.
3. Tìm thêm nguồn độc lập cho các preserve candidate `ANT_STRUCTURE_FIVE_BUTTONS`, `ANT_STRUCTURE_NARROW_SLEEVES`, `ATT_STRUCTURE_FOUR_PANELS` và `NB_STRUCTURE_RECTANGULAR_COLLAR` trước khi cân nhắc hard enforcement.
4. Nhờ một thành viên khác review chéo wording/condition của record đã verified trước khi dùng cho Cultural Critic production.
5. Xác nhận quyền sử dụng hình ảnh riêng; việc phê duyệt nội dung không cấp quyền tái sử dụng ảnh.

## Bàn giao cho Lan Anh

- Bốn file trong `data/garments/` đều `approved` cho retrieval thử nghiệm.
- `data/knowledge/records.json` có 14 record đã kiểm tra claim, nhưng toàn bộ vẫn `enforcement: advisory`.
- Không đưa hai source `needs_review` vào prompt context cho tới khi review hoàn tất.
- Dùng `tests/prompt-evaluation/recommendation-cultural-cases.json` để kiểm tra source/record grounding sau khi `/api/recommend` bỏ fixture.
