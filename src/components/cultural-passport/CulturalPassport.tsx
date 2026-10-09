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
      <section className="rounded-2xl border border-[#ebe4d5] bg-[#fbf9f5] p-6 shadow-sm">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#1b4332] mb-4 flex items-center gap-2">
          <span>🌿</span>
          <span>Nhận diện bản phối</span>
        </h2>
        <dl className="grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-xs font-serif text-[#7a828e]">Tên bản phối</dt>
            <dd className="mt-1 font-serif font-bold text-lg text-[#1b4332]">{look.name}</dd>
          </div>
          <div>
            <dt className="text-xs font-serif text-[#7a828e]">Loại trang phục</dt>
            <dd className="mt-1 font-serif text-[#2d3748] font-medium">
              {GARMENT_LABEL[look.garment] ?? look.garment}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-serif text-[#7a828e]">Phong cách diễn giải</dt>
            <dd className="mt-1 font-serif text-[#2d3748] font-medium">
              {STYLE_LABEL[look.style] ?? look.style}
            </dd>
          </div>
          <div>
            <dt className="text-xs font-serif text-[#7a828e]">Bảng màu sắc thái</dt>
            <dd className="mt-1 flex flex-wrap gap-1.5">
              {look.palette.map((c) => (
                <span
                  key={c}
                  className="rounded-full border border-[#d6cbba] bg-[#fdfcf9] px-3 py-0.5 text-xs text-[#2d3748]"
                >
                  {c.replace(/_/g, " ")}
                </span>
              ))}
            </dd>
          </div>
        </dl>
      </section>

      {/* Cultural Note */}
      <section className="rounded-2xl border border-[#ebe4d5] bg-[#f9f6ef] p-6 shadow-sm">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#8b6514] mb-3 flex items-center gap-2">
          <span>📜</span>
          <span>Điển tích & Ghi chú văn hóa</span>
        </h2>
        <p className="leading-relaxed font-serif text-sm text-[#3f4753]">{look.culturalNote}</p>
      </section>

      {/* Preserved elements */}
      <section className="rounded-2xl border border-[#ebe4d5] bg-[#fbf9f5] p-6 shadow-sm">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#1b4332] mb-4 flex items-center gap-2">
          <span>🪡</span>
          <span>Thành phần cấu thành trang phục</span>
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {look.items.length > 0 && (
            <div className="rounded-xl border border-[#ede6d8] bg-[#fdfcf9] p-4">
              <p className="text-xs font-serif font-bold text-[#1b4332] mb-2.5">Trang phục chính</p>
              <ul className="space-y-2">
                {look.items.map((item) => (
                  <li key={item} className="flex items-start gap-2 text-xs text-[#3f4753] leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1b4332]" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {look.accessories.length > 0 && (
            <div className="rounded-xl border border-[#ede6d8] bg-[#fdfcf9] p-4">
              <p className="text-xs font-serif font-bold text-[#c59b27] mb-2.5">Phụ kiện & Trang sức</p>
              <ul className="space-y-2">
                {look.accessories.map((acc) => (
                  <li key={acc} className="flex items-start gap-2 text-xs text-[#3f4753] leading-relaxed">
                    <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#c59b27]" />
                    {acc}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </section>

      {/* Reason */}
      <section className="rounded-2xl border border-[#ebe4d5] bg-[#f9f6ef] p-6 shadow-sm">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#1b4332] mb-3 flex items-center gap-2">
          <span>✨</span>
          <span>Ý niệm đề xuất từ nhà thiết kế</span>
        </h2>
        <p className="leading-relaxed font-serif italic text-sm text-[#5c6470]">&ldquo;{look.reason}&rdquo;</p>
      </section>

      {/* Validation result */}
      <section className="rounded-2xl border border-[#ebe4d5] bg-[#fbf9f5] p-6 shadow-sm">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#1b4332] mb-3 flex items-center gap-2">
          <span>🛡️</span>
          <span>Kết quả kiểm định văn hóa (Cultural Critic)</span>
        </h2>
        <div
          className={`inline-flex items-center gap-2 rounded-full px-4 py-1.5 text-xs font-serif font-semibold border shadow-sm ${badge.className}`}
        >
          <span>{badge.label}</span>
          {look.validation.status === "pass" && <span>✓ Đạt chuẩn văn hóa</span>}
          {look.validation.status === "warning" && (
            <span>⚠ Có điểm lưu ý bảo tồn</span>
          )}
          {look.validation.status === "revise" && (
            <span>✗ Cần điều chỉnh chi tiết</span>
          )}
        </div>

        {look.validation.warnings.length > 0 && (
          <div className="mt-4 space-y-3">
            {look.validation.warnings.map((w) => (
              <div
                key={w.ruleId}
                className={`rounded-xl border px-4 py-3 text-xs leading-relaxed ${SEVERITY_COLOR[w.severity] ?? ""}`}
              >
                <div className="flex items-center justify-between gap-2 mb-1">
                  <span className="font-semibold">{w.reason}</span>
                  <div className="flex items-center gap-1.5">
                    <code className="text-[10px] font-mono opacity-70 bg-white/50 px-1 rounded">{w.ruleId}</code>
                    <span className="text-[10px] font-semibold uppercase px-1.5 py-0.5 rounded bg-white/70">
                      {w.severity}
                    </span>
                  </div>
                </div>
                <p className="mt-1 opacity-90">💡 Gợi ý khắc phục: {w.suggestedFix}</p>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Sources */}
      <section className="rounded-2xl border border-[#ebe4d5] bg-[#fbf9f5] p-6 shadow-sm">
        <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#1b4332] mb-3 flex items-center gap-2">
          <span>📖</span>
          <span>Thư mục nguồn tư liệu tham khảo</span>
        </h2>
        {look.sourceIds.length > 0 ? (
          <ul className="space-y-2.5">
            {look.sourceIds.map((sid) => {
              const source = sourceById.get(sid);
              return (
                <li key={sid} className="rounded-xl border border-[#ebe4d5] bg-[#fdfcf9] p-3.5 text-xs text-[#5c6470]">
                  <span className="block font-serif font-bold text-sm text-[#1b4332]">{source?.title ?? sid}</span>
                  {source ? (
                    <>
                      <span className="mt-1 block text-xs text-[#7a828e]">Nhà xuất bản / Tổ chức: {source.publisher}</span>
                      <a className="mt-2 inline-flex items-center gap-1 text-xs font-serif font-semibold text-[#8b6514] hover:underline" href={source.url} target="_blank" rel="noreferrer">
                        Truy cập tư liệu gốc ↗
                      </a>
                    </>
                  ) : (
                    <span className="mt-1 block text-xs text-[#a84232]">Nguồn chưa được duyệt hoặc không khớp trang phục.</span>
                  )}
                </li>
              );
            })}
          </ul>
        ) : (
          <p className="text-xs font-serif text-[#8c94a0] italic">Chưa có nguồn được ánh xạ.</p>
        )}
      </section>

      {(look.imageUrl || look.imageFallback) && (
        <section className="rounded-2xl border border-[#e6c875] bg-[#fbf6e2] p-5">
          <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#845b10] mb-2 flex items-center gap-1.5">
            <span>ℹ️</span>
            <span>Lưu ý về hình ảnh phục dựng</span>
          </h2>
          <p className="text-xs font-serif leading-relaxed text-[#6b4700]">
            {look.imageDisclaimer ?? "Ảnh minh họa bởi AI, không phải hiện vật hay phục dựng xác thực."}
          </p>
        </section>
      )}
    </div>
  );
}
