"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  OCCASIONS,
  GARMENTS,
  STYLES,
  COLORS,
} from "@/lib/constants";
import type { RecommendationInput } from "@/types/api";

const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-200 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-600 focus:ring-2 focus:ring-emerald-100";

const labelClass = "block text-sm font-medium text-slate-700";

export default function CreatePage() {
  const router = useRouter();

  const [form, setForm] = useState<RecommendationInput>({
    occasion: "cultural_visit",
    garment: "auto",
    style: "minimal",
    colors: ["pastel_blue"],
    remixLevel: 40,
    description: "",
  });

  const [loading, setLoading] = useState(false);

  function handleColorToggle(value: string) {
    setForm((prev) => ({
      ...prev,
      colors: prev.colors.includes(value)
        ? prev.colors.filter((c) => c !== value)
        : [...prev.colors, value].slice(0, 3),
    }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (form.colors.length === 0) return;

    setLoading(true);
    // Lưu form input vào sessionStorage để trang results đọc
    sessionStorage.setItem("recommendation_input", JSON.stringify(form));
    // Đi qua generating (màn loading) rồi redirect sang results
    router.push("/generating");
  }

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Bước 1 / 2
        </p>
        <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
          Tạo bản phối
        </h1>
        <p className="text-slate-500 text-sm leading-6">
          Cho chúng tôi biết bạn muốn mặc gì, khi nào và theo phong cách nào.
          AI sẽ đề xuất 3 bản phối kèm kiểm tra văn hóa.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="grid gap-7 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8"
      >
        {/* Dịp */}
        <label className={`${labelClass} sm:col-span-1`}>
          Dịp sử dụng <span className="text-red-500">*</span>
          <select
            className={fieldClass}
            value={form.occasion}
            onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value }))}
            required
            id="field-occasion"
          >
            {OCCASIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        {/* Trang phục */}
        <label className={`${labelClass} sm:col-span-1`}>
          Loại trang phục <span className="text-red-500">*</span>
          <select
            className={fieldClass}
            value={form.garment}
            onChange={(e) => setForm((p) => ({ ...p, garment: e.target.value }))}
            required
            id="field-garment"
          >
            {GARMENTS.map((g) => (
              <option key={g.value} value={g.value}>
                {g.label}
              </option>
            ))}
          </select>
        </label>

        {/* Phong cách */}
        <label className={`${labelClass} sm:col-span-1`}>
          Phong cách <span className="text-red-500">*</span>
          <select
            className={fieldClass}
            value={form.style}
            onChange={(e) => setForm((p) => ({ ...p, style: e.target.value }))}
            required
            id="field-style"
          >
            {STYLES.map((s) => (
              <option key={s.value} value={s.value}>
                {s.label}
              </option>
            ))}
          </select>
        </label>

        {/* Remix level */}
        <div className="sm:col-span-1">
          <label className={labelClass} htmlFor="field-remix">
            Mức độ remix:{" "}
            <span className="font-semibold text-emerald-700">
              {form.remixLevel}%
            </span>
          </label>
          <p className="mt-1 text-xs text-slate-400">
            0 = Truyền thống thuần túy &nbsp;·&nbsp; 100 = Remix tối đa
          </p>
          <input
            id="field-remix"
            className="mt-3 w-full accent-emerald-700 cursor-pointer"
            type="range"
            min={0}
            max={100}
            step={10}
            value={form.remixLevel}
            onChange={(e) =>
              setForm((p) => ({ ...p, remixLevel: Number(e.target.value) }))
            }
          />
          <div className="flex justify-between text-xs text-slate-400 mt-1">
            <span>Truyền thống</span>
            <span>Remix</span>
          </div>
        </div>

        {/* Màu sắc — multi-select dạng chip */}
        <div className="sm:col-span-2">
          <p className={labelClass}>
            Màu sắc yêu thích{" "}
            <span className="text-red-500">*</span>
            <span className="ml-1 text-slate-400 font-normal">(chọn tối đa 3)</span>
          </p>
          {form.colors.length === 0 && (
            <p className="mt-2 text-xs text-red-500">Vui lòng chọn ít nhất 1 màu.</p>
          )}
          <div className="mt-3 flex flex-wrap gap-2" id="field-colors">
            {COLORS.map((c) => {
              const selected = form.colors.includes(c.value);
              return (
                <button
                  key={c.value}
                  type="button"
                  onClick={() => handleColorToggle(c.value)}
                  className={`rounded-full border px-4 py-1.5 text-sm font-medium transition-all ${
                    selected
                      ? "border-emerald-600 bg-emerald-600 text-white shadow-sm"
                      : "border-slate-200 bg-white text-slate-600 hover:border-emerald-300 hover:text-emerald-700"
                  }`}
                >
                  {c.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Mô tả tự do */}
        <label className={`${labelClass} sm:col-span-2`}>
          Mô tả thêm{" "}
          <span className="text-slate-400 font-normal">(không bắt buộc)</span>
          <textarea
            id="field-description"
            className={`${fieldClass} resize-none`}
            rows={3}
            placeholder="VD: Đi Văn Miếu, thích nữ tính nhưng không quá cổ điển."
            value={form.description ?? ""}
            onChange={(e) =>
              setForm((p) => ({ ...p, description: e.target.value }))
            }
          />
        </label>

        {/* Submit */}
        <div className="sm:col-span-2">
          <button
            id="btn-create-look"
            type="submit"
            disabled={loading || form.colors.length === 0}
            className="w-full rounded-xl bg-emerald-700 px-5 py-3.5 font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Đang xử lý…" : "Xem bản phối →"}
          </button>
        </div>
      </form>
    </main>
  );
}
