# Cultural Knowledge Base

Cultural KB cung cấp dữ kiện có nguồn và hướng dẫn văn hóa có cấu trúc cho bước retrieval, Cultural Critic và Cultural Passport. Dữ liệu này không tự thực thi guardrail; phần implementation thuộc owner AI/Backend.

## Vị trí dữ liệu

```text
data/
├── garments/              Hồ sơ tổng quan 4 trang phục MVP
├── knowledge/records.json Facts và rule candidates có provenance
└── sources/references.json Danh mục nguồn chuẩn
```

## Source schema

Mỗi entry trong `data/sources/references.json` có:

| Field | Ý nghĩa |
| --- | --- |
| `id` | ID duy nhất, ổn định để facts tham chiếu |
| `publisher` | Cơ quan/tổ chức xuất bản |
| `title` | Tên tài liệu hoặc bài viết |
| `url` | URL trực tiếp; nếu là tài liệu ngoại tuyến sẽ dùng `reference` trong phiên bản schema sau |
| `accessed_at` | Ngày truy cập theo `YYYY-MM-DD` |
| `source_type` | `museum`, `heritage_authority` hoặc `academic_journal` |
| `garment_ids` | Các garment ID liên quan |
| `categories` | Nhóm kiến thức có thể khai thác |
| `usable_knowledge` | Tóm tắt những điều nguồn thực sự hỗ trợ |
| `reliability` | `high`, `medium` hoặc `low` |
| `notes` | Giới hạn phạm vi và việc cần review |
| `status` | `needs_review` hoặc `approved` |

`usable_knowledge` không thay thế việc đọc nguồn. Nó giúp reviewer biết đoạn nào cần kiểm chứng và ngăn team suy diễn vượt quá phạm vi tài liệu.

## Knowledge/rule schema

Mỗi entry trong `data/knowledge/records.json` có:

| Field | Ý nghĩa |
| --- | --- |
| `id` | Rule/fact ID duy nhất và ổn định |
| `garment` | ID trang phục trong `data/garments/` |
| `category` | `history`, `structure`, `accessory`, `occasion` hoặc `warning` |
| `component` | Thành phần bị tác động, ví dụ `closure`, `sleeve`, `body_panels` |
| `attribute` | Thuộc tính cụ thể cần retrieval/validation |
| `fact` | Nội dung diễn giải sát nguồn, không thêm suy đoán |
| `rule_type` | `preserve`, `flexible`, `context` hoặc `warning` |
| `condition` | Điều kiện/phạm vi mà rule được áp dụng |
| `constraint` | `allowed`, `discouraged`, `forbidden` hoặc `contextual` |
| `action` | Hướng xử lý rõ cho hệ thống trong tương lai |
| `explanation` | Lý do văn hóa/provenance để hiển thị hoặc review |
| `source_ids` | Một hoặc nhiều ID tồn tại trong `references.json` |
| `publisher`, `url` | Provenance chính được lặp lại để sheet dễ review |
| `confidence` | `high`, `medium` hoặc `low` |
| `verification_status` | `needs_review` hoặc `verified` |
| `reviewed` | Đã có người khác kiểm tra hay chưa |
| `enforcement` | `advisory` hoặc `hard` |
| `notes` | Giới hạn, mâu thuẫn hoặc việc cần xác minh |

## Bốn loại rule

- `preserve`: candidate cho đặc điểm nhận diện cần giữ. Khi chưa review, chỉ được cảnh báo (`advisory`), không tự động chặn.
- `flexible`: yếu tố có bằng chứng cho thấy có thể biến đổi/remix trong phạm vi condition.
- `context`: thông tin chỉ đúng trong một thời kỳ, vùng, đối tượng hoặc dịp cụ thể; không được áp dụng phổ quát.
- `warning`: nguy cơ sai văn hóa hoặc gây hiểu nhầm, đặc biệt khi khái quát một hiện vật thành quy tắc cho toàn bộ trang phục.

## Confidence, review và enforcement

- `high`: nguồn chính thống mô tả trực tiếp, rõ ràng.
- `medium`: nguồn đáng tin nhưng cần đối chiếu thêm hoặc phạm vi khái quát chưa rõ.
- `low`: thông tin đang tranh luận; chưa dùng để tạo constraint.
- Record chưa review phải có `verification_status: needs_review`, `reviewed: false` và `enforcement: advisory`.
- `hard` chỉ hợp lệ khi record đã `verified`, `reviewed: true`, mọi nguồn liên quan đã `approved`, và phạm vi condition rõ ràng.

## Cách thêm dữ liệu

1. Thêm source thật vào `data/sources/references.json`; không dùng shop, blog thương mại, Pinterest hoặc nội dung AI-generated làm ground truth.
2. Ghi rõ `usable_knowledge`, reliability và giới hạn trong `notes`.
3. Thêm knowledge/rule record với condition hẹp nhất mà nguồn hỗ trợ.
4. Liên kết bằng `source_ids`; không tự tạo citation hoặc source ID.
5. Giữ record ở `needs_review`/`advisory` cho tới khi một thành viên khác review.
6. Chạy `npm run validate:data` trước khi đưa artefact đi review.

## Trạng thái Meeting 01

KB hiện có dữ liệu khởi đầu cho Áo ngũ thân và Áo tứ thân, đồng thời có danh sách nguồn cho đủ 4 trang phục MVP. Chưa có record nào là ground truth production hoặc hard rule.
