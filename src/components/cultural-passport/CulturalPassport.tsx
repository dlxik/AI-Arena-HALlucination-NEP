import type { OutfitLook } from "@/types/outfit";
import { GARMENT_LABEL, STYLE_LABEL, VALIDATION_BADGE, SEVERITY_COLOR } from "@/lib/constants";

interface CulturalPassportProps {
  look: OutfitLook;
}

export default function CulturalPassport({ look }: CulturalPassportProps) {
  const badge = VALIDATION_BADGE[look.validation.status];

  return (
    <div className="space-y-8">
      {/* Identity */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-4">
          Nhận diện bản phối
        </h2>
        <dl className="grid gap-4 sm:grid-cols-2">
          <div>
            <dt className="text-xs text-slate-400">Tên bản phối</dt>
            <dd className="mt-1 font-semibold text-slate-900">{look.name}</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Loại trang phục</dt>
            <dd className="mt-1 text-slate-900">
              {GARMENT_LABEL[look.garment] ?? look.garment}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Phong cách</dt>
            <dd className="mt-1 text-slate-900">
              {STYLE_LABEL[look.style] ?? look.style}
            </dd>
          </div>
          <div>
            <dt className="text-xs text-slate-400">Bảng màu</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {look.palette.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-0.5 text-xs text-slate-600"
                >
                  {c.replace(/_/g, " ")}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Cultural Note */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Ghi chú văn hóa
        </h2>
        <p className="leading-7 text-slate-700">{look.culturalNote}</p>
      </section>

      {/* Preserved elements */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Thành phần trang phục
        </h2>
        <div className="grid gap-4 sm:grid-cols-2">
          {look.items.length > 0 && (
            <div>
              <p className="text-xs font-medium text-emerald-700 mb-2">Trang phục chính</p>
              <ul className="space-y-1.5">
                {look.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {look.accessories.length > 0 && (
            <div>
              <p className="text-xs font-medium text-amber-600 mb-2">Phụ kiện</p>
              <ul className="space-y-1.5">
                {look.accessories.map((acc) => (
                  <li key={acc} className="flex items-start gap-2 text-sm text-slate-700">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                    {acc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Reason */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Lý do đề xuất
        </h2>
        <p className="leading-7 text-slate-700">{look.reason}</p>
      </section>

      {/* Validation result */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Kết quả kiểm tra văn hóa
        </h2>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-semibold ${badge.className}`}
        >
          <span>{badge.label}</span>
          {look.validation.status === "pass" && <span>✓ Phù hợp văn hóa</span>}
          {look.validation.status === "warning" && (
            <span>⚠ Có điểm cần lưu ý</span>
          )}
          {look.validation.status === "revise" && (
            <span>✗ Cần điều chỉnh</span>
          )}
        </div>

        {look.validation.warnings.length > 0 && (
          <div className="mt-4 space-y-3">
            {look.validation.warnings.map((w) => (
              <div
                key={w.ruleId}
                className={`rounded-xl border px-4 py-3 ${SEVERITY_COLOR[w.severity] ?? ""}`}
              >
                <div className="flex items-center gap-2 mb-1">
                  <code className="text-xs font-mono opacity-60">{w.ruleId}</code>
                  <span className="text-xs font-semibold uppercase">
                    {w.severity}
                  </span>
                </div>
                <p className="text-sm font-medium">{w.reason}</p>
                <p className="mt-1 text-xs opacity-80">💡 Gợi ý: {w.suggestedFix}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sources */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Nguồn tham khảo
        </h2>
        {look.sourceIds.length > 0 ? (
          <ul className="space-y-1.5">
            {look.sourceIds.map((sid) => (
              <li key={sid} className="flex items-center gap-2 text-sm text-slate-600">
                <span className="rounded bg-slate-100 px-2 py-0.5 font-mono text-xs">
                  {sid}
                </span>
                <span className="text-slate-400 text-xs">
                  — chi tiết xem trong Cultural Knowledge Base
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">Chưa có nguồn được ánh xạ.</p>
        )}
      </section>

      {/* Image prompt */}
      <section>
        <h2 className="text-xs font-semibold uppercase tracking-widest text-slate-500 mb-3">
          Image prompt (dành cho team)
        </h2>
        <code className="block rounded-xl bg-slate-100 px-4 py-3 text-xs text-slate-600 leading-5 whitespace-pre-wrap font-mono">
          {look.imagePrompt}
        </code>
      </section>
    </div>
  );
}
