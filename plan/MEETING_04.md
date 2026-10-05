# Buổi 4 - Image generation, Cultural Passport và remix

Thuộc dự án: **AI Arena HALlucination**
Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu buổi 4

Checkpoint 4 hoàn thành khi người dùng nhận được ảnh minh họa hoặc fallback minh bạch, xem được Cultural Passport có provenance, chỉnh một số thành phần của look và nhận kết quả đã chạy lại Cultural Critic.

```text
RecommendationInput
    ↓
Stylist → Cultural Critic → approved/warned look
                               ↓
                        Image Generator
                               ↓
                 Result + Cultural Passport
                               ↓
                    Remix → Critic recheck
```

Meeting 04 không mở rộng sang virtual try-on, tài khoản, commerce, social features hoặc animation phức tạp.

## 2. Baseline từ Meeting 03

- Stylist và Cultural Critic chạy độc lập qua Gemini.
- Rule Retrieval fail-closed và chỉ dùng record/source đủ điều kiện.
- Recommendation trả đúng ba looks với validation thật.
- UI hiển thị `pass`, `warning`, `revise`, reason, rule ID và suggested fix.
- Live evaluation đạt 8/8 Critic cases và 5/5 recommendation cases.
- Cultural review xác nhận 8/8 Critic outputs đúng expected status/rule IDs.
- Data validation, 89 tests, targeted lint, typecheck và production build pass tại integration review.
- `/api/generate-image` vẫn là placeholder; chưa có remix orchestration production.

## 3. Contract cần khóa

### Image generation

Input tối thiểu phải tham chiếu một look đã qua schema validation. Server tự lấy `imagePrompt`; client không được gửi provider credential.

Output thành công:

```ts
type ImageGenerationResult = {
  lookId: string;
  status: "generated" | "fallback";
  imageUrl?: string;
  fallbackReason?: string;
};
```

Quy tắc:

- Không log hoặc trả API key/raw upstream payload.
- Validate MIME/type/URL hoặc representation ảnh trước khi trả frontend.
- Timeout/quota/safety rejection phải có error/fallback minh bạch.
- Prompt ảnh không được tự thêm claim văn hóa, rank, motif hoặc cấu trúc ngoài look đã được Critic kiểm tra.
- Ảnh chỉ là minh họa AI, không được gắn nhãn hiện vật lịch sử xác thực.

### Remix và revalidation

Remix chỉ thay đổi các trường đã thống nhất như palette, accessory hoặc mức cách tân. Mỗi remix phải:

1. Validate input.
2. Giữ provenance/rule context đúng garment.
3. Chạy lại Cultural Critic.
4. Chỉ tạo lại ảnh sau khi có validation mới.
5. Không tái sử dụng validation cũ cho look đã thay đổi.

## 4. Agenda đề xuất

Tổng thời lượng: **120-150 phút**.

| Thời gian | Nội dung |
| --- | --- |
| 15 phút | Demo baseline Meeting 03 |
| 20 phút | Khóa image/remix contract và fallback policy |
| 25 phút | Review image prompt/provider integration |
| 25 phút | Review Cultural Passport và source presentation |
| 25 phút | Nối remix → Critic recheck → image regeneration |
| 10-40 phút | Chạy acceptance, sửa lỗi và chốt handoff Meeting 05 |

## 5. Phân công

### Hiền - Product và Frontend

- [x] Hiển thị ảnh generated và fallback rõ ràng, có loading/retry phù hợp.
- [x] Không để ảnh lỗi làm mất nội dung text/validation của look.
- [x] Hoàn thiện Cultural Passport: cultural note, validation, rule ID, suggested fix và nguồn dễ đọc.
- [x] Hiển thị source title/publisher/link an toàn thay vì chỉ source ID khi dữ liệu cho phép.
- [x] Tạo remix controls trong phạm vi đã khóa; hiển thị trạng thái revalidating/regenerating.
- [x] Không hiển thị validation cũ sau khi người dùng sửa look.
- [x] Bổ sung test cho generated/fallback, Passport và remix state.

Definition of Done của Hiền:

- Người dùng luôn thấy nội dung look dù provider ảnh thất bại.
- Cultural Passport phân biệt thông tin văn hóa, cảnh báo và nguồn.
- Remix có trạng thái đang xử lý/lỗi/thành công và không tạo fake success.

### Lan Anh - AI và Backend

- [x] Khóa/cập nhật contract `/api/generate-image` và remix endpoint/orchestration.
- [x] Tích hợp image provider theo env, timeout, safety và error mapping an toàn.
- [x] Runtime-validate image response; có fallback minh bạch khi provider lỗi.
- [x] Giới hạn image prompt vào look đã validate; không tự bịa cultural detail.
- [x] Triển khai remix trong whitelist field và chạy lại Cultural Critic.
- [x] Chỉ regenerate ảnh từ look sau revalidation, không dùng validation cũ.
- [x] Viết test cho success, timeout, upstream/safety failure, invalid output và remix recheck.
- [x] Ghi model/provider, prompt version và evaluation vào `docs/ai-log.md`.

Kết quả backend 2026-10-02: kế hoạch Lan Anh, [live Critic/remix 8/8](../docs/meeting-04-image-remix-evaluation.json); 160/160 tests, data validation, lint, typecheck và production build pass. Whitelist hiện tại chỉ palette/accessories. Image provider đã triển khai và test bằng transport mock; ảnh thật chưa chạy vì `.env.local` chưa có IMAGE_PROVIDER/GEMINI_IMAGE_MODEL. UI/Passport, live image acceptance và cultural review còn theo owner; chưa đóng checkpoint toàn team.

Definition of Done của Lan Anh:

- Image endpoint không còn placeholder và không lộ secret.
- Remix làm thay đổi look có validation mới từ Critic.
- Error/fallback không được mô tả là ảnh hoặc validation thành công.

### Linh - Cultural Data và Submission

- [x] Tạo rubric review ảnh cho 4 garment: cấu trúc nhận diện, context, motif/rank claim và mức sai lệch chấp nhận được.
- [x] Chuẩn bị tối thiểu 8 image/remix acceptance cases, mỗi garment có một case giữ đúng và một case có rủi ro.
- [x] Review Cultural Passport: source title/publisher/link đúng với `references.json`, claim không vượt provenance.
- [ ] Kiểm tra remix giữ đúng garment/rule scope và actual validation không tái sử dụng kết quả cũ.
- [ ] Ghi pass/warning/fail cho output ảnh/remix; phân biệt lỗi hình ảnh với lỗi fact/cultural claim.
- [x] Ghi rõ giới hạn: ảnh AI là minh họa, không phải phục dựng/hiện vật được xác thực.
- [x] Cập nhật evaluation/submission artefact phục vụ Meeting 05.

Artefact Linh ngày 2026-10-05:

- `tests/fixtures/image-remix-cultural-cases.json`: rubric 14 rules và 8 expected cases.
- `docs/meeting-04-cultural-acceptance.md`: Passport audit, remix policy, cultural handoff và runtime blockers.
- Passport hiện thiếu source title/publisher/link, còn lộ raw `imagePrompt` và chưa có AI-image disclaimer; owner sửa là Hiền.
- Image/remix runtime review giữ `pending` cho tới khi Lan Anh tích hợp endpoint/orchestration.

Definition of Done của Linh:

- Có rubric và artefact review dùng được cho cả bốn garment.
- Mọi source hiển thị trong Passport tồn tại, đúng garment và đủ trạng thái review.
- Remix case chứng minh Critic chạy lại và bắt được thay đổi có rủi ro.
- Không nâng nguồn `needs_review` hoặc ảnh AI thành bằng chứng lịch sử.

## 6. Acceptance cases tối thiểu

### Image

- Provider trả ảnh hợp lệ.
- Thiếu key hoặc provider chưa cấu hình.
- Timeout/quota/upstream error.
- Safety rejection.
- Response sai schema/MIME hoặc URL không hợp lệ.
- Prompt không chứa secret, raw source payload hoặc claim ngoài validated look.

### Cultural Passport

- Pass look có cultural note và approved sources.
- Warning/revise look hiển thị đầy đủ rule, severity, reason và suggested fix.
- Source link/title/publisher khớp `references.json`.
- Source `needs_review` không xuất hiện như nguồn production đã duyệt.

### Remix

- Đổi palette trong flexible rule và revalidation pass.
- Đổi cấu trúc nhận diện gây warning/revise theo enforcement.
- Thêm claim phẩm cấp/motif không có nguồn và bị cảnh báo/từ chối.
- Remix lỗi không làm mất look gốc.
- Validation timestamp/result cũ không được tái sử dụng cho look mới.

## 7. Kiểm tra trước khi merge

```bash
npm run validate:data
npm test
npm run lint
npm run typecheck
npm run build
```

Live evaluation chỉ chạy bằng `.env.local`; không commit key, ảnh chứa dữ liệu nhạy cảm hoặc raw provider response không cần thiết.

Checklist chung:

- [ ] Image/remix contract và architecture khớp implementation.
- [ ] Image provider có timeout, safety/error mapping và fallback.
- [ ] Cultural Passport hiển thị provenance đúng.
- [ ] Remix luôn chạy lại Critic trước khi tạo ảnh mới.
- [ ] Acceptance artefact có review của Linh.
- [ ] Automated checks và production build pass.
- [ ] Không có secret hoặc dữ liệu nhạy cảm trong Git diff/history.

## 8. Definition of Done của Meeting 04

- [ ] Mỗi look có ảnh generated hoặc fallback minh bạch.
- [ ] Cultural Passport hiển thị cultural note, validation và nguồn có provenance.
- [ ] Người dùng remix được field trong whitelist.
- [ ] Look remix có validation mới và ảnh mới/fallback tương ứng.
- [ ] Các lỗi provider/validation không tạo fake success.
- [ ] Artefact image/remix cultural review bao phủ đủ 4 garment.
- [ ] Cả ba owner review và không còn blocker mức checkpoint.

## 9. Handoff sang Meeting 05

Mang sang giai đoạn đánh giá và khóa scope:

- Image/remix contracts và prompt versions.
- Evaluation artefact gồm recommendation, Critic, image và remix.
- Danh sách lỗi/fallback còn chấp nhận được.
- Cultural sources/rules còn cần nghiên cứu thêm.
- Bản nháp nội dung submission, demo script và shot list video.

## 10. Trạng thái checkpoint

- [x] Đã lập kế hoạch.
- [ ] Chưa bắt đầu triển khai.
- [x] Đang thực hiện.
- [ ] Hoàn thành.
- [ ] Có blocker cần xử lý.
