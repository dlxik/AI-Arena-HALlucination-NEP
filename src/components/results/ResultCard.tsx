"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import type { OutfitLook } from "@/types/outfit";
import { GARMENT_LABEL, VALIDATION_BADGE, SEVERITY_COLOR } from "@/lib/constants";

interface ResultCardProps {
  look: OutfitLook;
  index: number;
}

export default function ResultCard({ look: initialLook, index }: ResultCardProps) {
  const [look, setLook] = useState<OutfitLook>(initialLook);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(false);

  const needsValidation = look.validation.warnings.some(
    (w) => w.ruleId === "CULTURAL_CRITIC_PENDING" || w.ruleId === "SOURCE_REVIEW_REQUIRED"
  );

  const validateLook = async () => {
    setIsValidating(true);
    setValidationError(false);
    try {
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(look),
      });
      const data = await res.json();
      if (data.success) {
        setLook((prev) => ({
          ...prev,
          validation: data.data,
        }));
      } else {
        setValidationError(true);
      }
    } catch (_err) {
      setValidationError(true);
    } finally {
      setIsValidating(false);
    }
  };

  useEffect(() => {
    if (needsValidation) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      validateLook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const badge = VALIDATION_BADGE[look.validation.status];

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md hover:-translate-y-0.5">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center">
        {look.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={look.imageUrl}
            alt={`Bản phối ${look.name}`}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <svg
              className="h-12 w-12 opacity-40"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.2}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <span className="text-xs">Ảnh minh họa sẽ được tạo</span>
          </div>
        )}
        {/* Index badge */}
        <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-xs font-bold text-white">
          {index + 1}
        </span>
        {/* Validation badge */}
        {isValidating ? (
          <span className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
            ĐANG KIỂM DUYỆT
          </span>
        ) : validationError ? (
          <span className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 border border-red-200">
            LỖI KIỂM DUYỆT
          </span>
        ) : (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-5">
        {/* Header */}
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-emerald-700">
            {GARMENT_LABEL[look.garment] ?? look.garment}
          </p>
          <h2 className="mt-1 text-xl font-semibold text-slate-900">{look.name}</h2>
        </div>

        {/* Palette */}
        <div className="flex items-center gap-2">
          <span className="text-xs text-slate-500">Bảng màu:</span>
          <div className="flex flex-wrap gap-1.5">
            {look.palette.map((color) => (
              <span
                key={color}
                className="rounded-full border border-slate-200 px-2.5 py-0.5 text-xs text-slate-600 bg-slate-50"
              >
                {color.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Items */}
        {look.items.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Trang phục</p>
            <ul className="space-y-1">
              {look.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-emerald-500" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accessories */}
        {look.accessories.length > 0 && (
          <div>
            <p className="text-xs font-medium text-slate-500 mb-1.5">Phụ kiện</p>
            <ul className="space-y-1">
              {look.accessories.map((acc) => (
                <li key={acc} className="flex items-start gap-2 text-sm text-slate-700">
                  <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-amber-400" />
                  {acc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reason */}
        <p className="text-sm leading-6 text-slate-600 break-words">{look.reason}</p>

        {/* Retry Button */}
        {validationError && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3 flex flex-col items-center gap-2">
            <p className="text-xs text-red-700 text-center">Có lỗi xảy ra khi kiểm duyệt văn hóa.</p>
            <button
              onClick={validateLook}
              className="text-xs font-semibold text-white bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition"
            >
              Thử lại
            </button>
          </div>
        )}

        {/* Warnings (if any) */}
        {!isValidating && !validationError && look.validation.warnings.length > 0 && (
          <div className="space-y-2">
            {look.validation.warnings.map((w) => (
              <div
                key={w.ruleId}
                className={`rounded-lg border px-3 py-2.5 text-xs leading-5 ${SEVERITY_COLOR[w.severity] ?? ""}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="font-semibold break-words">{w.reason}</p>
                  <span className="shrink-0 rounded bg-white/50 px-1.5 py-0.5 text-[10px] font-mono opacity-80">
                    {w.ruleId}
                  </span>
                </div>
                <p className="opacity-80 break-words">💡 {w.suggestedFix}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-2">
          <Link
            href={`/looks/${look.id}`}
            id={`btn-view-passport-${look.id}`}
            className="block w-full rounded-xl border border-emerald-600 px-4 py-2.5 text-center text-sm font-semibold text-emerald-700 transition hover:bg-emerald-50"
          >
            Xem Cultural Passport ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
