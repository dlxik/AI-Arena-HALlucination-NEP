import type { OutfitLook } from "@/types/outfit";
import type { CulturalSource } from "@/types/cultural";
import { GARMENT_LABEL, STYLE_LABEL, VALIDATION_BADGE, SEVERITY_COLOR } from "@/lib/constants";
import sourceData from "../../../data/sources/references.json";

interface CulturalPassportProps {
  look: OutfitLook;
}

export default function CulturalPassport({ look }: CulturalPassportProps) {
  const badge = VALIDATION_BADGE[look.validation.status];
  const approvedSources = (sourceData.sources as CulturalSource[]).filter(
    (source) => source.status === "approved" && source.garment_ids.includes(look.garment),
  );
  const sourceById = new Map(approvedSources.map((source) => [source.id, source]));

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
            {look.sourceIds.map((sid) => {
              const source = sourceById.get(sid);
              return (
                <li key={sid} className="rounded-lg border border-slate-100 p-3 text-sm text-slate-600">
                  <span className="block font-medium text-slate-800">{source?.title ?? sid}</span>
                  {source ? (
                    <>
                      <span className="mt-1 block text-xs text-slate-500">{source.publisher}</span>
                      <a className="mt-1 inline-block text-xs font-medium text-emerald-700 hover:underline" href={source.url} target="_blank" rel="noreferrer">
                        Mở nguồn tham khảo ↗
                      </a>
                    </>
                  ) : (
                    <span className="mt-1 block text-xs text-amber-700">Nguồn chưa được duyệt hoặc không khớp trang phục.</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-sm text-slate-400 italic">Chưa có nguồn được ánh xạ.</p>
        )}
      </section>

      {(look.imageUrl || look.imageFallback) && (
        <section className="rounded-xl border border-amber-200 bg-amber-50 p-4">
          <h2 className="text-xs font-semibold uppercase tracking-widest text-amber-800 mb-2">
            Lưu ý về ảnh
          </h2>
          <p className="text-sm leading-6 text-amber-900">
            {look.imageDisclaimer ?? "Ảnh minh họa bởi AI, không phải hiện vật hay phục dựng xác thực."}
          </p>
        </section>
      )}
    </div>
  );
}
