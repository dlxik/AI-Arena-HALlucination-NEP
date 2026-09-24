# Cultural Knowledge Base schema

Mỗi record trong `data/knowledge/records.json` tương ứng một fact có provenance:

| Field | Ý nghĩa |
| --- | --- |
| `id` | Rule/fact ID duy nhất và ổn định |
| `garment` | ID trang phục trong `data/garments/` |
| `category` | `history`, `structure`, `accessory`, `occasion` hoặc `warning` |
| `fact` | Nội dung được diễn giải sát nguồn, không thêm suy đoán |
| `rule_type` | `preserve`, `flexible`, `context` hoặc `note` |
| `source_id` | ID tồn tại trong `data/sources/references.json` |
| `publisher` | Đơn vị xuất bản, lặp lại để sheet dễ review |
| `url` | URL trực tiếp đến nguồn |
| `confidence` | `high`, `medium` hoặc `low` |
| `reviewed` | Đã có thành viên khác kiểm tra hay chưa |
| `enforcement` | `advisory` hoặc `hard` |
| `notes` | Giới hạn phạm vi, mâu thuẫn hoặc việc cần xác minh |

## Rule types đề xuất

- `preserve`: đặc điểm nhận diện có nguy cơ làm sai loại trang phục nếu thay đổi.
- `flexible`: yếu tố có thể remix trong phạm vi nguồn/reviewer cho phép.
- `context`: thông tin về lịch sử, dịp hoặc cách phối trong một bối cảnh xác định.
- `note`: thông tin tham khảo, chưa đủ căn cứ để tạo cảnh báo.

## Confidence và enforcement

- `high`: nguồn chính thống mô tả trực tiếp và rõ ràng.
- `medium`: nguồn đáng tin nhưng cần đối chiếu thêm hoặc phạm vi khái quát chưa rõ.
- `low`: dữ kiện đang tranh luận; chỉ được lưu như `note`.
- Record chưa review luôn phải là `advisory`.
- `hard` chỉ hợp lệ khi `reviewed: true`, nguồn đã `approved` và phạm vi áp dụng được ghi rõ.

Các record hiện tại đều `reviewed: false` và `advisory`; chúng là dữ liệu khởi đầu để review chéo, chưa phải ground truth production.
