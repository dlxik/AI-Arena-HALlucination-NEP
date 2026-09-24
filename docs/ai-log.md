# AI activity log

| Date | Owner | Tool | Goal | Artefact/Commit | Reviewer | Result |
| --- | --- | --- | --- | --- | --- | --- |
| 2026-09-24 | Diệu Linh | Codex + web research | Khởi tạo Cultural KB, provenance và cultural validation cases | `feature/data` | Chờ phân công | 7 nguồn, 5 records và 5 test cases; tất cả chờ review chéo |
| 2026-09-24 | Hiền | Antigravity (Claude) | Dựng skeleton frontend: form đầy đủ MVP, result cards từ fixture, cultural passport UI, navbar | `src/lib/fixtures.ts`, `src/lib/constants.ts`, `src/components/results/ResultCard.tsx`, `src/components/cultural-passport/CulturalPassport.tsx`, `src/app/results/page.tsx`, `src/app/create/page.tsx`, `src/app/looks/[id]/page.tsx`, `src/components/layout/Navbar.tsx` | Chờ Lan Anh + Linh review | UI render được toàn bộ field schema từ fixture; cần kết nối API thật |
| 2026-09-24 | Lan Anh | Gemini API / `@google/genai` (`gemini-3.5-flash-lite`) | Tích hợp intent parser structured output và xử lý lỗi | `src/lib/gemini/`, `src/app/api/parse-intent/`, `prompts/intent/intent-v1.md` | Chờ review | Live evaluation: 5/5 passed |
