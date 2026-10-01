# Kế hoạch công việc Lan Anh — Meeting 03

## Mục tiêu và phạm vi

Hoàn thiện Cultural Critic độc lập và nối vào recommendation để mỗi look có validation thật. Phần UI của Hiền, cultural review của Linh và image generation Meeting 04 giữ đúng owner.

## Quyết định triển khai

- `POST /api/validate` nhận `{ look, recommendationInput }`. Look có đủ nội dung và source IDs; validation/imageUrl cũ nếu có bị bỏ trước khi đưa vào Critic. Không nhận rule/source/context tùy ý từ client.
- Rule Retrieval riêng cho từng garment, không dùng giới hạn 6 records của Stylist để bỏ sót guardrail. Giữ toàn bộ rule verified + reviewed có tất cả source approved và đúng garment. Occasion/style/remix được cung cấp để Critic đánh giá điều kiện, không lọc mất rule chống khái quát hóa.
- `pass` có warnings rỗng; `warning` có low/medium; `revise` có ít nhất một high dựa trên rule hard. Không nâng advisory thành hard. KB hiện tại toàn advisory, nên test revise dùng snapshot hard cô lập.
- Stylist vẫn trả pending trong bước nội bộ; orchestration thay bằng Critic thật trước response. Một bước lỗi khiến toàn request trả lỗi minh bạch, không trả pending hoặc pass giả.
- Giữ nguyên Gemini client/model/timeout đang cấu hình; structured output vẫn được validate lại ở runtime.

## Thứ tự thực hiện

1. [x] Khóa request/output và parser, cập nhật API contract.
2. [x] Rule Retrieval fail-closed và kiểm tra source/garment.
3. [x] Prompt Critic, dynamic schema và runtime validation.
4. [x] API độc lập, recommendation orchestration và error mapping.
5. [x] Test pass/warning/revise, provenance, schema, lỗi API và hồi quy Nhật Bình.
6. [x] Live evaluation an toàn bằng `.env.local`; lưu kết quả không chứa key/raw upstream payload.
7. [x] Chạy data validation, tests, lint, typecheck; cập nhật architecture, AI log và handoff.

## Kết quả ngày 2026-10-01

- 86/86 automated tests pass; data validation, lint và typecheck pass.
- Live Critic: 8/8 expected outcomes (4 pass, 4 advisory warning), model `gemini-3.5-flash-lite`, timeout 60000 ms theo cấu hình local.
- Live recommendation: 5/5 inputs thành công, mỗi input có 3 looks và validation thật. Nhật Bình: 2 warning thiếu cổ + 1 pass; các input còn lại 3 pass.
- Iteration đầu: Critic bỏ sót case ba khuy tay chẽn và thiếu cổ Nhật Bình (6/8). Prompt bổ sung decision checks/examples; lần chạy sau có hai request upstream lỗi, retry đúng hai case đạt 13/13. Báo cáo giữ previousAttempts, không xóa dấu vết lỗi.
- Artefact versioned: [live evaluation cuối](../docs/meeting-03-critic-evaluation.json), [iteration đầu](../docs/meeting-03-critic-evaluation-initial.json), [API contract](../docs/api-contract.md). Báo cáo verification riêng giữ local theo yêu cầu, không đưa vào commit/push.
- `revise` đã kiểm tra với snapshot hard cô lập; không có live revise vì KB production hiện toàn advisory.
- Phần backend của Lan Anh hoàn tất; checkpoint toàn team chưa đóng vì cần UI review, cultural review và build tích hợp theo MEETING_03.

## Handoff

- Hiền: consume validation có thật từ recommendation; UI retry gọi API độc lập theo contract.
- Linh: review điều kiện/status/severity và wording của acceptance artefact trước khi đóng checkpoint.
- Production build chỉ chạy một lần ở branch tích hợp trước khi đóng checkpoint toàn team, theo MEETING_03.
