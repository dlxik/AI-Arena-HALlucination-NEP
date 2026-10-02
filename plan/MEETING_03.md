# Buổi 3 - Cultural Critic và core flow hoàn chỉnh

Thuộc dự án: **AI Arena HALlucination**
Repository: <https://github.com/dlxik/AI-Arena-HALlucination-NEP>

## 1. Mục tiêu buổi 3

Checkpoint 3 hoàn thành khi Cultural Critic chạy độc lập với Stylist, dùng rule đã duyệt để kiểm tra từng look và trả kết quả có cấu trúc `pass`, `warning` hoặc `revise` trong luồng end-to-end.

```text
RecommendationInput
    ↓
Cultural Retrieval → Gemini Stylist → 3 OutfitLook
                                    ↓
                         Rule Retrieval
                                    ↓
                         Cultural Critic
                                    ↓
                Results UI + validation evidence
```

Image generation thật, remix nâng cao và hoàn thiện Cultural Passport thuộc Meeting 04, không mở rộng vào checkpoint này.

## 2. Baseline đã khóa từ Meeting 02

- `/api/recommend` trả đúng 3 looks từ Gemini và validate output phía server.
- Cultural Retrieval chỉ dùng garment/source `approved` và record `verified` + `reviewed`.
- Form, loading/error/retry và Results UI đã nối response thật.
- `npm run validate:data`, test, lint, typecheck và production build đều pass tại integration review.
- Năm live acceptance cases đạt **4 pass, 1 warning, 0 fail**.
- Warning cần xử lý: `RC_04_NHAT_BINH_PHOTOSHOOT` có hai look chưa nói rõ cấu trúc cổ đối khâm hình chữ nhật.
- `/api/validate` và `prompts/critic/critic-v1.md` vẫn là scaffold; `CULTURAL_CRITIC_PENDING` chưa phải kết quả kiểm duyệt.

Artefact đầu vào:

- `tests/prompt-evaluation/recommendation-cultural-cases.json`
- `docs/meeting-02-cultural-acceptance.md`
- `data/knowledge/records.json`
- `data/sources/references.json`
- `src/app/api/validate/route.ts`
- `prompts/critic/critic-v1.md`

## 3. Contract cần khóa trước khi code

Critic nhận **một look hoàn chỉnh** cùng context/rule phía server tự retrieval. Client không được tự gửi rule hoặc source để được tin cậy mặc định.

Kết quả tối thiểu:

```ts
type CulturalValidation = {
  status: "pass" | "warning" | "revise";
  warnings: Array<{
    ruleId: string;
    severity: "low" | "medium" | "high";
    reason: string;
    suggestedFix: string;
  }>;
};
```

Quy tắc:

- `ruleId` phải tồn tại trong Cultural KB và thuộc garment của look.
- Critic chỉ đánh giá bằng rule/context được retrieval; không tự tạo fact, rule hoặc citation.
- `pass`: không có vi phạm đủ căn cứ và `warnings` rỗng.
- `warning`: cần bổ sung context hoặc có rủi ro advisory nhưng chưa đủ căn cứ bắt buộc sửa.
- `revise`: vi phạm rule quan trọng/điều kiện rõ ràng; phải có suggested fix có thể thực hiện.
- Severity và status phải được ánh xạ nhất quán; một warning `high` không được trả tổng thể `pass`.
- Dữ liệu `needs_review` không được dùng để tạo kết luận chắc chắn.
- Khi không có rule approved phù hợp, trả lỗi/fallback minh bạch; không mặc định xác nhận an toàn văn hóa.

## 4. Agenda đề xuất

Tổng thời lượng: **120-150 phút**.

| Thời gian | Nội dung |
| --- | --- |
| 15 phút | Demo baseline Meeting 02 và warning Nhật Bình |
| 20 phút | Khóa request/response, status và severity mapping |
| 25 phút | Review Rule Retrieval và provenance |
| 30 phút | Review Cultural Critic, runtime validation và error mapping |
| 25 phút | Nối validation vào Results UI và chạy end-to-end |
| 15-35 phút | Chạy acceptance cases, sửa lỗi và chốt handoff Meeting 04 |

## 5. Phân công

### Hiền - Product và Frontend

- [ ] Hiển thị trạng thái `pass`, `warning`, `revise` và danh sách warning theo đúng contract.
- [ ] Hiển thị `reason`, `ruleId` và `suggestedFix` dễ hiểu, không lộ prompt hoặc payload nội bộ.
- [ ] Thay trạng thái `CULTURAL_CRITIC_PENDING` bằng kết quả thật khi API thành công.
- [ ] Bổ sung loading, error và retry cho bước validation độc lập.
- [ ] Đảm bảo nội dung warning dài không làm vỡ ba cards trên viewport đã thống nhất.
- [ ] Viết test UI cho pass, warning, revise và lỗi validate.

Definition of Done của Hiền:

- Người dùng phân biệt được kết quả đã kiểm tra và kết quả đang chờ/lỗi.
- Suggested fix có thể đọc và hành động được.
- Không biến lỗi Critic thành trạng thái pass hoặc ẩn cảnh báo.

### Lan Anh - AI và Backend

- [x] Khóa contract `POST /api/validate` và cập nhật `docs/api-contract.md`.
- [x] Cài Rule Retrieval theo garment/context, chỉ dùng record đủ điều kiện review.
- [x] Hoàn thiện `prompts/critic/critic-v1.md` với structured output và giới hạn provenance.
- [x] Triển khai Cultural Critic độc lập với Stylist; runtime-validate toàn bộ output.
- [x] Nối Critic vào recommendation pipeline hoặc orchestration đã thống nhất để mỗi look có validation thật.
- [x] Chuẩn hóa lỗi missing key, timeout, upstream error, invalid output, missing context/rule và data error.
- [x] Viết test cho pass/warning/revise, rule ID bịa, rule sai garment và model output sai schema.
- [x] Ghi prompt iteration, model và evaluation vào `docs/ai-log.md`.

Kết quả Lan Anh ngày 2026-10-01: [kế hoạch và handoff](LAN_ANH_MEETING_03.md), [live evaluation](../docs/meeting-03-critic-evaluation.json). Backend hoàn tất; UI/cultural review vẫn theo checklist của Hiền/Linh bên dưới.

Definition of Done của Lan Anh:

- Critic có thể chạy/test độc lập với Stylist.
- Không có `ruleId` bịa hoặc rule của garment khác lọt qua runtime validation.
- Recommendation trả validation thật hoặc lỗi minh bạch, không giả `CULTURAL_CRITIC_PENDING` là kết quả cuối.

### Linh - Cultural Data và Submission

- [x] Lập ma trận rule → expected status/severity/action cho bốn garment.
- [x] Tạo tối thiểu 8 acceptance cases cho Critic: mỗi garment có một case đúng và một case cần cảnh báo/sửa.
- [x] Bổ sung case hồi quy Nhật Bình từ `RC_04`, kiểm tra `NB_STRUCTURE_RECTANGULAR_COLLAR` được phát hiện khi thiếu.
- [x] Review wording của `reason` và `suggestedFix`: đúng phạm vi nguồn, không tuyệt đối hóa advisory rule.
- [ ] Kiểm tra mọi `ruleId`/`sourceId` trong output tồn tại, đúng garment và đủ trạng thái review.
- [ ] Ghi pass/warning/fail và lý do vào artefact evaluation; không sửa implementation backend/UI thay owner.
- [x] Cập nhật tài liệu Cultural KB nếu rule status, enforcement hoặc cách retrieval thay đổi.

Definition of Done của Linh:

- Bộ case phân biệt được `pass`, `warning`, `revise` và có expected evidence rõ ràng.
- Warning Nhật Bình của Meeting 02 có test hồi quy và owner xử lý.
- Không dùng nguồn `needs_review` để nâng claim thành hard rule.
- Có artefact cultural review để cả đội mang sang Meeting 04.

## 6. Acceptance cases tối thiểu

| Nhóm | Case cần có | Kỳ vọng |
| --- | --- | --- |
| Áo dài | Biến thể hợp lệ, không tuyên bố một kiểu cổ là duy nhất | `pass` hoặc advisory `warning` có căn cứ |
| Áo dài | Khẳng định một biến thể là quy chuẩn lịch sử duy nhất | Phát hiện generalization, không tự bịa rule |
| Áo ngũ thân | Tay chẽn đúng phạm vi năm khuy/tay hẹp | `pass` |
| Áo ngũ thân | Gán đặc điểm tay chẽn cho mọi biến thể | `warning`/`revise` theo enforcement đã chốt |
| Áo tứ thân | Bốn thân và context Kinh Bắc được diễn đạt đúng phạm vi | `pass` |
| Áo tứ thân | Biến tổ hợp phục dựng lễ hội thành yêu cầu phổ quát | Có warning và suggested fix thu hẹp context |
| Nhật Bình | Có cấu trúc cổ đối khâm hình chữ nhật, không suy diễn phẩm cấp | `pass` |
| Nhật Bình | Thiếu đặc điểm cổ nhưng vẫn gọi là Nhật Bình | Bắt `NB_STRUCTURE_RECTANGULAR_COLLAR`, không `pass` |

Thêm negative contract cases:

- Model trả `ruleId` không tồn tại.
- Rule thuộc garment khác.
- Output thiếu `suggestedFix` khi status là `revise`.
- Source/rule `needs_review` bị đưa vào kết luận chắc chắn.
- Critic timeout hoặc output không đúng JSON/schema.

## 7. Kiểm tra trước khi merge

Chạy tối thiểu:

```bash
npm run validate:data
npm test
npm run lint
npm run typecheck
```

Chỉ chạy `npm run build` một lần trên branch tích hợp trước khi đóng checkpoint. Live evaluation dùng `.env.local`, không log/commit key hoặc raw upstream payload nhạy cảm.

Checklist chung:

- [x] API contract và architecture khớp implementation.
- [x] Rule Retrieval fail-closed với dữ liệu chưa duyệt.
- [x] Critic chạy độc lập và trong end-to-end flow (backend).
- [x] Tất cả output đều qua runtime validation.
- [ ] Acceptance artefact có kết quả review của Linh.
- [ ] UI thể hiện đúng ba status và các lỗi chính.
- [ ] Test, lint, typecheck, data validation và production build pass.
- [x] Không có secret trong Git diff/history được đưa vào đợt push này.

## 8. Definition of Done của Meeting 03

- [x] Cultural Critic chạy độc lập với Gemini Stylist.
- [x] Input → recommendation → cultural validation chạy end-to-end (backend; UI chờ review).
- [x] Mỗi look có `pass`, `warning` hoặc `revise` dựa trên rule có provenance.
- [x] Mỗi warning có `ruleId`, severity, reason và suggested fix hợp lệ.
- [x] Case cố tình sai quan trọng được phát hiện; rule/source bịa bị từ chối.
- [x] Warning Nhật Bình của Meeting 02 có test hồi quy và được xử lý đúng.
- [ ] Cả ba owner review artefact và không còn blocker mức checkpoint.

### Đối chiếu trước push — 2026-10-01

- Lan Anh: 8/8 đầu việc hoàn tất. Chạy lại 86/86 tests, lint, typecheck và data validation đều pass; live evidence có 8/8 Critic cases và 5/5 recommendation inputs sau prompt iteration/retry.
- Hiền: Results/Passport đã có render status và warnings; chưa có flow gọi `/api/validate` độc lập hoặc bộ UI tests Meeting 03. Responsive với warning thật và error/retry validation vẫn cần owner review.
- Linh: đã có 8 backend evaluation inputs và hồi quy Nhật Bình để review; chưa có ma trận rule, cultural acceptance approval hoặc case riêng về khái quát đặc điểm tay chẽn cho mọi biến thể. Không đánh dấu thay owner.
- `revise` kiểm tra với snapshot hard cô lập; KB production toàn advisory. Production build giữ cho branch tích hợp trước khi đóng checkpoint, theo mục 7.

## 9. Handoff sang Meeting 04

Chỉ chuyển sang image generation, Cultural Passport hoàn chỉnh và remix sau khi Critic ổn định. Mang sang Meeting 04:

- Contract validation đã khóa.
- Prompt Critic và AI log.
- Bộ acceptance cases cùng kết quả live.
- Danh sách warning còn chấp nhận được và rule/source cần nghiên cứu thêm.
- Luồng UI thể hiện rõ trạng thái kiểm tra văn hóa.

## 10. Trạng thái checkpoint

- [x] Đã lập kế hoạch.
- [ ] Chưa bắt đầu triển khai.
- [x] Đang thực hiện.
- [ ] Hoàn thành.
- [ ] Có blocker cần xử lý.
