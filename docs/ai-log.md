# AI activity log

| Date | Owner | Tool | Goal | Artefact/Commit | Reviewer | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-24 | Diệu Linh | Codex + web research | Khởi tạo Cultural KB, provenance và cultural validation cases | `feature/data` | Chờ phân công | 7 nguồn, 5 records và 5 test cases; tất cả chờ review chéo |
| 2026-09-24 | Hiền | Antigravity (Claude) | Dựng skeleton frontend: form đầy đủ MVP, result cards từ fixture, cultural passport UI, navbar | `src/lib/fixtures.ts`, `src/lib/constants.ts`, `src/components/results/ResultCard.tsx`, `src/components/cultural-passport/CulturalPassport.tsx`, `src/app/results/page.tsx`, `src/app/create/page.tsx`, `src/app/looks/[id]/page.tsx`, `src/components/layout/Navbar.tsx` | Chờ Lan Anh + Linh review | UI render được toàn bộ field schema từ fixture; cần kết nối API thật |
| 2026-09-24 | Lan Anh | Gemini API / `@google/genai` (`gemini-3.5-flash-lite`) | Tích hợp intent parser structured output và xử lý lỗi | `src/lib/gemini/`, `src/app/api/parse-intent/`, `prompts/intent/intent-v1.md` | Chờ review | Live evaluation: 5/5 passed |
| 2026-09-25 | Team | Codex | Tích hợp artefact Meeting 01 từ `linh`, `hien`, `lanh` vào `main` | Merge commits trên `main` | Tự động + cần team review | Data validation, 10 tests, lint, typecheck và production build đều pass |
| 2026-09-27 | Lan Anh | Codex + Gemini structured-output integration | Hoàn thiện Cultural Retrieval, Stylist v1, runtime validation và `/api/recommend` | `src/lib/cultural/`, `src/lib/gemini/stylist.ts`, `src/lib/validation/recommendation-output.ts`, `src/app/api/recommend/route.ts`, `prompts/stylist/stylist-v1.md` | Team integration review | Pipeline và validation đã triển khai; retrieval fail-closed theo trạng thái cultural data. |
| 2026-09-28 | Team | Codex integration review | Merge Meeting 02, đối chiếu retrieval policy và chạy automated checks | Local `main` integration commits | Codex + cần owner demo | 35/35 tests, data validation, lint và typecheck pass; live 5-case acceptance chờ `GEMINI_API_KEY`, responsive review chờ Hiền xác nhận. |
| 2026-10-01 | Lan Anh | Codex + Gemini (`gemini-3.5-flash-lite`) | Cultural Critic v1 độc lập, Rule Retrieval và recommendation orchestration | `plan/LAN_ANH_MEETING_03.md`, `docs/meeting-03-critic-evaluation.json` | Chờ Hiền/Linh review | 86/86 tests; data validation, lint, typecheck pass; live 8/8 Critic cases + 5/5 recommendation inputs sau prompt iteration và retry upstream. |

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

## Cultural Critic v1 evaluation — 2026-10-01

- Model thực chạy: `gemini-3.5-flash-lite`, `GEMINI_TIMEOUT_MS=60000` theo `.env.local`; không ghi key. Client hiện tại giữ `store: false` và một SDK retry.
- Prompt: `prompts/critic/critic-v1.md`; SHA-256 của mỗi iteration ghi trong artefact. Độc lập với Stylist, structured output gồm status/warnings và enum rule IDs theo Rule Retrieval phía server.
- Retrieval riêng lấy toàn bộ rules verified + reviewed của garment với tất cả source approved/đúng garment. Giữ context/occasion rules để phát hiện universal claims sai phạm vi; không nâng advisory thành hard.
- Iteration đầu (SHA-256 `a433dd20575bcfefdc0bfb84390f25a6d13800bd5f0f65accddb707fa5a6baa0`): 6/8 Critic cases đạt expected status/rule IDs, bỏ sót `ANT_STRUCTURE_FIVE_BUTTONS` khi ba khuy giữa thân và `NB_STRUCTURE_RECTANGULAR_COLLAR` khi thiếu mô tả cổ. 5/5 recommendation requests thành công. Artefact: `docs/meeting-03-critic-evaluation-initial.json`.
- Iteration sau bổ sung decision checks và ví dụ JSON scoped cho hai tình huống; không sửa dữ liệu/enforcement để làm case pass. Lần full evaluation có 2 upstream failures; `--retry-failed` chạy lại đúng hai case với cùng prompt/model và giữ lịch sử `previousAttempts`.
- Kết quả cuối: 8/8 Critic expected outcomes (4 pass, 4 warning), 5/5 recommendation inputs có 3 looks với validation hợp lệ, không pending. Nhật Bình recommendation có 2 cảnh báo thiếu cổ và 1 pass. Artefact: `docs/meeting-03-critic-evaluation.json`.
- 86/86 tests kiểm tra contract/provenance/status/severity, revise với snapshot hard cô lập, lỗi API và fail-closed. Live production KB hiện toàn advisory nên không tạo case revise giả bằng cách nâng rule production.
- Automated checks không thay cultural review. Wording/status của artefact cần Linh phê duyệt; UI trạng thái/error/retry cần Hiền review. Production build chờ branch tích hợp trước khi đóng checkpoint, theo MEETING_03.
