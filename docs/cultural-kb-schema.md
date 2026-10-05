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
| `reviewed_by` | Người đối chiếu metadata và phạm vi claim; bắt buộc khi `approved` |
| `reviewed_at` | Ngày review `YYYY-MM-DD`; bắt buộc khi `approved` |

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
| `reviewed` | Claim đã được người ghi trong `reviewed_by` đối chiếu với nguồn hay chưa |
| `reviewed_by` | Người đã kiểm tra claim so với nguồn; bắt buộc khi `verified` |
| `reviewed_at` | Ngày kiểm tra claim `YYYY-MM-DD`; bắt buộc khi `verified` |
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

## Policy retrieval cho Gemini Stylist

Checkpoint 2 áp dụng policy fail-closed trước khi đưa context vào prompt:

- Garment phải có `status: approved` và có ít nhất một source approved liên quan.
- Source phải có `status: approved`.
- Knowledge record phải có `verification_status: verified`, `reviewed: true` và mọi `source_ids` liên kết đều approved.
- Garment/source `needs_review` và record chưa verified vẫn được giữ trong KB để review, nhưng không được đưa vào prompt kể cả dưới dạng advisory.
- Record được lọc đúng garment và condition; `garment: auto` không được trộn claim của garment không được chọn.
- `enforcement` được truyền nguyên trạng; Stylist không được biến `advisory` thành hard constraint.
- Khi không có context đạt policy, `/api/recommend` trả `422 NO_CULTURAL_CONTEXT`; không fallback sang fixture và không tự nâng trạng thái dữ liệu.

Hai nguồn `VWM_AO_DAI` và `HMCC_NHAT_BINH_2022` vẫn `needs_review`, vì vậy không đủ điều kiện retrieval. Chúng được giữ trong source catalog để review tiếp, không được truyền vào prompt production.

## Cách thêm dữ liệu

1. Thêm source thật vào `data/sources/references.json`; không dùng shop, blog thương mại, Pinterest hoặc nội dung AI-generated làm ground truth.
2. Ghi rõ `usable_knowledge`, reliability và giới hạn trong `notes`.
3. Thêm knowledge/rule record với condition hẹp nhất mà nguồn hỗ trợ.
4. Liên kết bằng `source_ids`; không tự tạo citation hoặc source ID.
5. Giữ record ở `needs_review`/`advisory` cho tới khi một thành viên khác review; record này chưa được retrieval production sử dụng.
6. Khi chuyển source sang `approved` hoặc record sang `verified`, ghi `reviewed_by` và `reviewed_at`.
7. Chạy `npm run validate:data` trước khi đưa artefact đi review.

## Trạng thái Meeting 02

KB hiện có 14 record cho đủ bốn trang phục MVP và bốn garment profile đã sẵn sàng cho retrieval thử nghiệm. Sáu nguồn đã được đối chiếu, hai nguồn còn `needs_review`. Không có hard rule; mọi record vẫn `advisory` và cần review chéo trước khi dùng cho Cultural Critic production.

Năm acceptance cases cho recommendation grounding nằm tại `tests/prompt-evaluation/recommendation-cultural-cases.json`. Baseline fixture ngày 2026-09-27 được giữ để đối chiếu; live review ngày 2026-09-28 đạt 4 pass, 1 warning và 0 fail sau khi tích hợp Retrieval + Stylist.

## Policy Cultural Critic cho Meeting 03

Ma trận rule và 8 acceptance cases nằm tại `tests/fixtures/cultural-validation-cases.json`; báo cáo review nằm tại `docs/meeting-03-cultural-acceptance.md`.

- Ma trận phải phủ đủ mọi knowledge record và chỉ tham chiếu source `approved` đúng garment.
- Rule `advisory` có thể tạo `warning`, không tự động tạo `revise`.
- `revise` chỉ hợp lệ khi vi phạm hard rule đã được phê duyệt hoặc technical invariant được contract quy định rõ.
- Rule/source ID bịa phải bị runtime validation từ chối, không được chuyển thành một cultural verdict có vẻ hợp lệ.
- Mỗi warning cần có `ruleId`, severity, reason và suggested fix nằm trong phạm vi condition/action của record.
- Actual output chưa chạy phải ghi `pending`; không dùng expected fixture làm bằng chứng Gemini Critic đã pass.

## Policy image/remix cho Meeting 04

Rubric và 8 image/remix cultural cases nằm tại `tests/fixtures/image-remix-cultural-cases.json`; báo cáo review nằm tại `docs/meeting-04-cultural-acceptance.md`.

- Ảnh AI là minh họa, không phải hiện vật, phục dựng đã xác thực hoặc nguồn cultural fact.
- Image prompt chỉ được dùng claim đã có trong validated look/context.
- Cultural Passport phải resolve source ID thành title, publisher và safe URL từ source catalog đã validate.
- Source `needs_review` không được trình bày như production-approved evidence.
- Mọi remix phải chạy lại Cultural Critic và tạo ảnh mới/fallback; không tái sử dụng validation cũ.
- Expected fixture không thay thế runtime image/remix review; output chưa chạy phải giữ `pending`.
