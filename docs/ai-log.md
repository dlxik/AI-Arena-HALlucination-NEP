# AI activity log

| Date | Owner | Tool | Goal | Artefact/Commit | Reviewer | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-24 | Diệu Linh | Codex + web research | Khởi tạo Cultural KB, provenance và cultural validation cases | `feature/data` | Chờ phân công | 7 nguồn, 5 records và 5 test cases; tất cả chờ review chéo |
| 2026-09-24 | Hiền | Antigravity (Claude) | Dựng skeleton frontend: form đầy đủ MVP, result cards từ fixture, cultural passport UI, navbar | `src/lib/fixtures.ts`, `src/lib/constants.ts`, `src/components/results/ResultCard.tsx`, `src/components/cultural-passport/CulturalPassport.tsx`, `src/app/results/page.tsx`, `src/app/create/page.tsx`, `src/app/looks/[id]/page.tsx`, `src/components/layout/Navbar.tsx` | Chờ Lan Anh + Linh review | UI render được toàn bộ field schema từ fixture; cần kết nối API thật |
| 2026-09-24 | Lan Anh | Gemini API / `@google/genai` (`gemini-3.5-flash-lite`) | Tích hợp intent parser structured output và xử lý lỗi | `src/lib/gemini/`, `src/app/api/parse-intent/`, `prompts/intent/intent-v1.md` | Chờ review | Live evaluation: 5/5 passed |
| 2026-09-25 | Team | Codex | Tích hợp artefact Meeting 01 từ `linh`, `hien`, `lanh` vào `main` | Merge commits trên `main` | Tự động + cần team review | Data validation, 10 tests, lint, typecheck và production build đều pass |
| 2026-09-27 | Lan Anh | Codex + Gemini structured-output integration | Hoàn thiện Cultural Retrieval, Stylist v1, runtime validation và `/api/recommend` | `src/lib/cultural/`, `src/lib/gemini/stylist.ts`, `src/lib/validation/recommendation-output.ts`, `src/app/api/recommend/route.ts`, `prompts/stylist/stylist-v1.md` | Team integration review | Pipeline và validation đã triển khai; retrieval fail-closed theo trạng thái cultural data. |
| 2026-09-28 | Team | Codex integration review | Merge Meeting 02, đối chiếu retrieval policy và chạy automated checks | Local `main` integration commits | Codex + cần owner demo | 35/35 tests, data validation, lint và typecheck pass; live 5-case acceptance chờ `GEMINI_API_KEY`, responsive review chờ Hiền xác nhận. |

## Stylist v1 evaluation — 2026-09-27

- Prompt version: `prompts/stylist/stylist-v1.md`.
- Context policy hiện tại: tối đa 6 records, 8 sources; chỉ garment/source `approved` và record `verified` + `reviewed` được đưa vào prompt.
- Automated success case xác nhận prompt nhận input/context, schema yêu cầu đúng 3 looks và output hợp lệ được trả nguyên vẹn.
- Negative cases xác nhận chặn output thiếu look, source ID bịa, input ID không hỗ trợ và raw model detail không bị lộ qua API.
- Error cases xác nhận `503` khi thiếu key, `504` khi timeout và `502` khi upstream/model output lỗi.
- Kết quả tích hợp ngày 2026-09-28: 25 recommendation/retrieval tests và 35/35 toàn suite pass.
- Các live smoke trước đây đã chạy khi policy còn cho phép `needs_review`; chúng là dữ liệu chẩn đoán lịch sử, không còn là acceptance evidence cho policy hiện tại.
- Dữ liệu tích hợp hiện có 4 garment, 6 source và 14 record đạt policy; hai source `needs_review` bị loại khỏi prompt.
- Còn lại trước checkpoint: chạy lại 5 live acceptance cases khi môi trường có `GEMINI_API_KEY`, Hiền kiểm tra responsive với nội dung dài và team quyết định timeout budget.

## Retrieval policy correction — 2026-09-27

- Review phát hiện implementation cũ cho phép dữ liệu `needs_review` vào prompt dưới dạng advisory, không khớp handoff cultural data.
- Policy đã đổi sang fail-closed: garment/source phải approved; record phải verified và reviewed; source liên kết của record cũng phải approved.
- Automated success path dùng dữ liệu approved thật trong repository. Negative tests chỉ hạ trạng thái trên snapshot cô lập để xác nhận fail-closed và không mutate cache dùng chung.
