# AI activity log

| Date | Owner | Tool | Goal | Artefact/Commit | Reviewer | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-24 | Diệu Linh | Codex + web research | Khởi tạo Cultural KB, provenance và cultural validation cases | `feature/data` | Chờ phân công | 7 nguồn, 5 records và 5 test cases; tất cả chờ review chéo |
| 2026-09-24 | Hiền | Antigravity (Claude) | Dựng skeleton frontend: form đầy đủ MVP, result cards từ fixture, cultural passport UI, navbar | `src/lib/fixtures.ts`, `src/lib/constants.ts`, `src/components/results/ResultCard.tsx`, `src/components/cultural-passport/CulturalPassport.tsx`, `src/app/results/page.tsx`, `src/app/create/page.tsx`, `src/app/looks/[id]/page.tsx`, `src/components/layout/Navbar.tsx` | Chờ Lan Anh + Linh review | UI render được toàn bộ field schema từ fixture; cần kết nối API thật |
| 2026-09-24 | Lan Anh | Gemini API / `@google/genai` (`gemini-3.5-flash-lite`) | Tích hợp intent parser structured output và xử lý lỗi | `src/lib/gemini/`, `src/app/api/parse-intent/`, `prompts/intent/intent-v1.md` | Chờ review | Live evaluation: 5/5 passed |
| 2026-09-25 | Team | Codex | Tích hợp artefact Meeting 01 từ `linh`, `hien`, `lanh` vào `main` | Merge commits trên `main` | Tự động + cần team review | Data validation, 10 tests, lint, typecheck và production build đều pass |
| 2026-09-27 | Lan Anh | Codex + Gemini structured-output integration | Hoàn thiện Cultural Retrieval, Stylist v1, runtime validation và `/api/recommend` | `src/lib/cultural/`, `src/lib/gemini/stylist.ts`, `src/lib/validation/recommendation-output.ts`, `src/app/api/recommend/route.ts`, `prompts/stylist/stylist-v1.md` | Chờ team review + đủ 5 acceptance cases | Automated evaluation 13 case recommendation/retrieval và toàn suite 23/23 pass; production build pass; live smoke `/api/recommend` trả đúng 3 looks. |

## Stylist v1 evaluation — 2026-09-27

- Prompt version: `prompts/stylist/stylist-v1.md`.
- Context policy: tối đa 6 records, 8 sources; `needs_review` chỉ là advisory.
- Automated success case xác nhận prompt nhận input/context, schema yêu cầu đúng 3 looks và output hợp lệ được trả nguyên vẹn.
- Negative cases xác nhận chặn output thiếu look, source ID bịa, input ID không hỗ trợ và raw model detail không bị lộ qua API.
- Error cases xác nhận `503` khi thiếu key, `504` khi timeout và `502` khi upstream/model output lỗi.
- Kết quả: 13/13 test recommendation/retrieval pass; 23/23 toàn suite pass.
- Live smoke: input `ao_ngu_than` + `cultural_visit` trả 3 look ID duy nhất, chỉ dùng `VNMH_AO_NGU_THAN_2021`, và cả ba giữ cảnh báo `CULTURAL_CRITIC_PENDING`.
- Recheck 5 recommendation inputs: cả 5 pass structural validation sau một retry; `ao_tu_than` lần đầu client-timeout ở 70 giây, retry pass sau 67,8 giây.
- Còn lại trước checkpoint: Linh review cultural notes/source scope của 5 output, Hiền kiểm tra rendering và team quyết định timeout budget.
