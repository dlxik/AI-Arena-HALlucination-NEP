"use client";

import { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  OCCASIONS,
  GARMENTS,
  STYLES,
  COLORS,
} from "@/lib/constants";
import type { RecommendationInput } from "@/types/api";

const COLOR_SWATCHES: Record<string, string> = {
  pastel_blue: "#9cbcd4",
  soft_white: "#f5f3ec",
  dusty_rose: "#d8969e",
  forest_green: "#2d5a3f",
  terracotta: "#c85a44",
  deep_burgundy: "#7a1c28",
  lavender: "#b4a5c9",
  warm_beige: "#d7c5ad",
  gold_accent: "#d4af37",
  midnight_navy: "#1e293b",
};

const fieldClass =
  "mt-2 w-full rounded-xl border border-[#ded5c4] bg-[#fdfcf9] px-4 py-3.5 text-[#1f2421] placeholder:text-[#9aa0a6] outline-none transition focus:border-[#1b4332] focus:ring-2 focus:ring-[#1b4332]/20 font-medium text-sm";

const labelClass = "block text-sm font-semibold text-[#1c241f]";

function CreateFormContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [form, setForm] = useState<RecommendationInput>({
    occasion: (searchParams.get("occasion") as any) || "cultural_visit",
    garment: (searchParams.get("garment") as any) || "auto",
    style: "minimal",
    colors: ["pastel_blue"],
    remixLevel: 40,
    description: "",
  });

  useEffect(() => {
    const occ = searchParams.get("occasion");
    const garm = searchParams.get("garment");
    if (occ || garm) {
      setForm((prev) => ({
        ...prev,
        ...(occ ? { occasion: occ as any } : {}),
        ...(garm ? { garment: garm as any } : {}),
      }));
    }
  }, [searchParams]);

  const [loading, setLoading] = useState(false);
  const [parsing, setParsing] = useState(false);

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
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10 space-y-8">
      {/* Header */}
      <div className="space-y-3">
        <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e3d9] bg-[#eef5f0] px-3.5 py-1 text-xs font-semibold text-[#1b4332]">
          <span>🌿</span>
          <span>Sổ tay phối đồ di sản • Bước 1 / 2</span>
        </div>
        <h1 className="font-serif text-3xl sm:text-4xl font-bold tracking-tight text-[#1c241f]">
          Tạo bản phối Việt phục
        </h1>
        <p className="text-sm leading-relaxed text-[#5c656e] max-w-2xl">
          Chia sẻ cùng AI Arena về dịp lễ, kiểu áo và sở thích màu sắc bạn hướng tới. 
          Hệ thống sẽ đối chiếu với cơ sở dữ liệu lịch sử và gợi ý 3 bản phối hài hòa, chuẩn mực nhất.
        </p>
      </div>

      <form
        onSubmit={handleSubmit}
        className="rounded-3xl border border-[#e5dccb] bg-white p-7 sm:p-10 shadow-[0_8px_30px_rgba(45,35,20,0.04)] grid gap-8 sm:grid-cols-2"
      >
        {/* Dịp */}
        <label className={`${labelClass} sm:col-span-1`}>
          <div className="flex items-center justify-between">
            <span>Dịp sử dụng <span className="text-red-500">*</span></span>
            <span className="text-xs text-[#828c96] font-normal">Tết, tham quan, lễ hội...</span>
          </div>
          <select
            className={fieldClass}
            value={form.occasion}
            onChange={(e) => setForm((p) => ({ ...p, occasion: e.target.value as any }))}
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
          <div className="flex items-center justify-between">
            <span>Loại trang phục <span className="text-red-500">*</span></span>
            <span className="text-xs text-[#828c96] font-normal">Hoặc để AI tự đề xuất</span>
          </div>
          <select
            className={fieldClass}
            value={form.garment}
            onChange={(e) => setForm((p) => ({ ...p, garment: e.target.value as any }))}
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
          <div className="flex items-center justify-between">
            <span>Phong cách phối <span className="text-red-500">*</span></span>
            <span className="text-xs text-[#828c96] font-normal">Truyền thống, tối giản...</span>
          </div>
          <select
            className={fieldClass}
            value={form.style}
            onChange={(e) => setForm((p) => ({ ...p, style: e.target.value as any }))}
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
        <div className="sm:col-span-1 space-y-1.5">
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="field-remix">
              Mức độ cách tân:{" "}
              <span className="font-serif font-bold text-[#1b4332]">
                {form.remixLevel}%
              </span>
            </label>
            <span className="text-xs text-[#828c96]">0% thuần túy → 100% hiện đại</span>
          </div>
          <input
            id="field-remix"
            className="mt-3 w-full accent-[#1b4332] cursor-pointer"
            type="range"
            min={0}
            max={100}
            step={10}
            value={form.remixLevel}
            onChange={(e) =>
              setForm((p) => ({ ...p, remixLevel: Number(e.target.value) }))
            }
          />
          <div className="flex justify-between text-xs text-[#8c949e]">
            <span>🌿 Cổ điển thuần túy</span>
            <span>✨ Cách tân đương đại</span>
          </div>
        </div>

        {/* Màu sắc — swatch chips */}
        <fieldset className="sm:col-span-2 space-y-3">
          <legend className={labelClass}>
            Bảng màu yêu thích <span className="text-red-500">*</span>
            <span className="ml-2 text-xs text-[#78828c] font-normal">
              (chọn tối đa 3 sắc thái vải)
            </span>
          </legend>
          {form.colors.length === 0 && (
            <p className="text-xs text-red-500 font-medium">Vui lòng chọn ít nhất 1 màu để bắt đầu phối.</p>
          )}
          <div className="flex flex-wrap gap-2.5" id="field-colors">
            {COLORS.map((c) => {
              const selected = form.colors.includes(c.value);
              const swatchColor = COLOR_SWATCHES[c.value] || "#dcdcdc";
              return (
                <button
                  key={c.value}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => handleColorToggle(c.value)}
                  className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-xs sm:text-sm font-medium transition-all ${
                    selected
                      ? "border-[#1b4332] bg-[#1b4332] text-white shadow-sm"
                      : "border-[#e0d6c4] bg-[#fdfbf7] text-[#4a5056] hover:border-[#1b4332] hover:text-[#1b4332]"
                  }`}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full border border-black/10 shadow-inner shrink-0"
                    style={{ backgroundColor: swatchColor }}
                  />
                  <span>{c.label}</span>
                </button>
              );
            })}
          </div>
        </fieldset>

        {/* Mô tả tự do */}
        <div className="sm:col-span-2 space-y-2">
          <div className="flex items-center justify-between">
            <label className={labelClass} htmlFor="field-description">
              Mô tả bằng văn bản tự nhiên
            </label>
            <span className="text-xs text-[#828c96] font-normal">Tùy chọn</span>
          </div>
          <div className="relative">
            <textarea
              id="field-description"
              className={`${fieldClass} resize-none pr-36 mt-0`}
              rows={3}
              placeholder="VD: Mình muốn mặc đi du xuân Văn Miếu cùng gia đình, thích phong cách nhã nhặn, kín đáo nhưng trẻ trung..."
              value={form.description ?? ""}
              onChange={(e) =>
                setForm((p) => ({ ...p, description: e.target.value }))
              }
            />
            <button
              type="button"
              onClick={async () => {
                if (!form.description) return;
                setParsing(true);
                try {
                  const res = await fetch("/api/parse-intent", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ description: form.description }),
                  });
                  const json = await res.json();
                  if (res.ok && json.success) {
                    setForm((prev) => ({
                      ...prev,
                      ...json.data,
                      description: prev.description,
                    }));
                  } else {
                    alert(json.error?.message || "Lỗi phân tích tự động");
                  }
                } catch {
                  alert("Lỗi kết nối tới server");
                } finally {
                  setParsing(false);
                }
              }}
              disabled={parsing || !form.description}
              className="absolute bottom-3 right-3 rounded-full bg-[#1b2a22] px-4 py-1.5 text-xs font-semibold text-white transition hover:bg-[#2e4035] disabled:opacity-50 shadow-sm"
            >
              {parsing ? "Đang đọc..." : "✨ Tự động điền"}
            </button>
          </div>
        </div>

        {/* Submit button */}
        <div className="sm:col-span-2 pt-2">
          <button
            id="btn-create-look"
            type="submit"
            disabled={loading || form.colors.length === 0}
            className="w-full rounded-full bg-[#1b4332] px-7 py-4 font-serif text-base font-semibold text-white shadow-md hover:bg-[#255640] hover:shadow-lg transition-all active:scale-[0.99] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
          >
            {loading ? (
              <span>Đang kết nối văn hóa…</span>
            ) : (
              <>
                <span>Xem bản phối gợi ý</span>
                <span>🌿</span>
              </>
            )}
          </button>
        </div>
      </form>
    </main>
  );
}

export default function CreatePage() {
  return (
    <Suspense fallback={<div className="p-12 text-center text-sm text-[#747e88]">Đang tải sổ tay phối đồ...</div>}>
      <CreateFormContent />
    </Suspense>
  );
}
