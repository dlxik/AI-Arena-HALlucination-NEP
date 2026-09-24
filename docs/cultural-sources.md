# Cultural sources

Ngày truy cập ban đầu: **2026-09-24**. Danh sách máy đọc được nằm tại `data/sources/references.json`.

Tất cả nguồn hiện mang trạng thái `needs_review`. Chưa nguồn nào được xem là ground truth production cho tới khi một thành viên khác kiểm tra nội dung, phạm vi sử dụng và quyền trích dẫn.

## Danh sách nguồn ban đầu

| Trang phục | Source ID | Publisher | Mục đích |
| --- | --- | --- | --- |
| Áo ngũ thân | `VNMH_AO_NGU_THAN_2021` | [Bảo tàng Lịch sử Quốc gia](https://baotanglichsu.vn/vi/Articles/3090/72685/bao-tang-lich-su-quoc-gia-tiep-nhan-ao-dai-ngu-than-truyen-thong.html) | Hiện vật, cấu trúc cúc và tay chẽn |
| Áo ngũ thân / Áo dài / Áo tứ thân | `VWM_AO_DAI` | [Bảo tàng Phụ nữ Việt Nam](https://baotangphunu.org.vn/thoi-trang-va-nghe-thuat-tao-hoa-van/) | Mối liên hệ trong quá trình phát triển áo dài |
| Áo tứ thân | `VHTT_AO_TU_THAN_KINH_BAC` | [Tạp chí Văn hóa Nghệ thuật](https://vanhoanghethuat.vn/tao-hinh-trang-phuc-phu-nu-kinh-bac-truyen-thong-77748003.html) | Cấu trúc và ngữ cảnh trang phục Kinh Bắc |
| Áo tứ thân | `VNMH_AO_TU_THAN_CONTEXT_2016` | [Bảo tàng Lịch sử Quốc gia](https://baotanglichsu.vn/vi/Articles/1508/48878/thi-nau-com-net-van-hoa-ngay-xuan-o-mien-que-quan-ho.html) | Một tổ hợp trang phục trong lễ hội xuân được phục dựng |
| Áo dài | `VNMH_AO_DAI_2015` | [Bảo tàng Lịch sử Quốc gia](https://baotanglichsu.vn/vi/Articles/3096/18397/net-djep-van-hoa-trong-ta-ao-dai-cua-phu-nu-viet.html) | Diễn tiến và yếu tố tạo hình áo dài thế kỷ XX |
| Nhật Bình | `VJOL_NHAT_BINH_2026` | [Tạp chí Văn hóa Nghệ thuật trên VJOL](https://vjol.info.vn/tcvanhoanghethuat/vi/article/view/138715/) | Nghiên cứu hoa văn trên một hiện vật Nhật Bình |
| Nhật Bình | `HMCC_NHAT_BINH_2022` | [Trung tâm Bảo tồn Di tích Cố đô Huế](https://kph2022.huecit.com/Van-hoa/Hue-Kinh-%C4%91o-ao-dai-Viet-Nam/Chi-tiet/tid/Can-canh-Mu-quan-dai-than-va-ao-Nhat-Binh-cung-tan-trieu-Nguyen.html/pid/10711/cid/303) | Hiện vật Nhật Bình cung tần cuối thế kỷ XIX–đầu XX |

Shop, dịch vụ cho thuê, blog thương mại, Pinterest và nội dung AI-generated không được đưa vào `references.json` làm ground truth.

## Phạm vi dữ liệu vòng đầu

- Áo ngũ thân: 3 records về cấu trúc tay chẽn và ngữ cảnh hiện vật.
- Áo tứ thân: 2 records về cấu trúc và tổ hợp trang phục trong một lễ hội Kinh Bắc.
- Áo dài và Nhật Bình: mới lập danh sách nguồn; chưa trích facts vào KB.
- Không có hard rule; mọi record hiện là `advisory` và chờ review chéo.

## Checklist review nguồn

1. Mở URL và xác nhận publisher/title khớp metadata.
2. Đối chiếu câu diễn giải với đoạn nguồn, tránh biến mô tả một hiện vật thành quy tắc phổ quát.
3. Xác định nguồn độc lập thứ hai cho các `preserve` candidate.
4. Ghi reviewer và ngày review trước khi chuyển nguồn sang `approved`.
5. Chỉ chuyển record sang `hard` khi nguồn đã approved, `reviewed: true` và phạm vi áp dụng rõ ràng.

## Điểm cần đội review

- Năm cúc có phải đặc điểm bắt buộc của mọi biến thể áo ngũ thân trong phạm vi MVP hay chỉ của kiểu tay chẽn đang mô tả?
- Cần tách schema theo vùng, thời kỳ và biến thể trang phục ở mức nào?
- Tổ hợp yếm/váy/khăn của áo tứ thân nên là gợi ý theo context hay rule cho riêng persona Kinh Bắc?
- Ai là reviewer văn hóa có thẩm quyền để phê duyệt các rule `preserve`?
