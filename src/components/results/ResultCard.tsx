"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import type { OutfitLook } from "@/types/outfit";
import type { ImageGenerationOutput, RecommendationInput } from "@/types/api";
import { GARMENT_LABEL, VALIDATION_BADGE, SEVERITY_COLOR } from "@/lib/constants";
import { toValidationLook } from "@/lib/client/look-payload";
import {
  needsIndependentValidation,
  resolveValidationUiState,
} from "@/components/results/validation-state";

interface ResultCardProps {
  look: OutfitLook;
  index: number;
}

export default function ResultCard({ look: initialLook, index }: ResultCardProps) {
  const [look, setLook] = useState<OutfitLook>(initialLook);
  const [isValidating, setIsValidating] = useState(false);
  const [validationError, setValidationError] = useState(false);
  const [isGeneratingImage, setIsGeneratingImage] = useState(false);

  // Sync look to session storage whenever it updates significantly
  const updateStorage = (updatedLook: OutfitLook) => {
    try {
      const raw = sessionStorage.getItem("recommendation_result");
      if (raw) {
        const stored = JSON.parse(raw);
        const lookIndex = stored.data.looks.findIndex((l: OutfitLook) => l.id === updatedLook.id);
        if (lookIndex !== -1) {
          stored.data.looks[lookIndex] = updatedLook;
          sessionStorage.setItem("recommendation_result", JSON.stringify(stored));
        }
      }
    } catch {}
  };

  const validateLook = async () => {
    setIsValidating(true);
    setValidationError(false);
    try {
      const rawInput = sessionStorage.getItem("recommendation_input");
      if (!rawInput) throw new Error("Thiếu dữ liệu yêu cầu ban đầu.");
      const recommendationInput = JSON.parse(rawInput) as RecommendationInput;
      const res = await fetch("/api/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ look: toValidationLook(look), recommendationInput }),
      });
      const data = await res.json();
      if (data.success) {
        setLook((prev) => {
          const updated = { ...prev, validation: data.data };
          updateStorage(updated);
          return updated;
        });
      } else {
        setValidationError(true);
      }
    } catch {
      setValidationError(true);
    } finally {
      setIsValidating(false);
    }
  };

  const generateImage = async (forceRetry = false) => {
    if (look.imageUrl || (look.imageFallback && !forceRetry) || isGeneratingImage) return;
    setIsGeneratingImage(true);
    try {
      const rawInput = sessionStorage.getItem("recommendation_input");
      if (!rawInput) throw new Error("Thiếu dữ liệu yêu cầu ban đầu.");
      const recommendationInput = JSON.parse(rawInput) as RecommendationInput;
      const res = await fetch("/api/generate-image", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          look: toValidationLook(look),
          recommendationInput,
        }),
      });
      const data = await res.json();
      
      setLook((prev) => {
        const newLook = { ...prev };
        if (data.success) {
          const output = data.data as ImageGenerationOutput;
          newLook.validation = output.validation;
          newLook.imageDisclaimer = output.disclaimer;
          if (output.status === "generated") {
            newLook.imageUrl = output.imageUrl;
            newLook.imageFallback = undefined;
          } else {
            newLook.imageUrl = undefined;
            newLook.imageFallback = output.fallbackReason;
          }
        } else {
          newLook.imageFallback = data.error?.message || "Không thể tạo ảnh minh họa do lỗi máy chủ.";
        }
        updateStorage(newLook);
        return newLook;
      });
    } catch {
      setLook((prev) => {
        const newLook = { ...prev, imageFallback: "Lỗi kết nối khi tạo ảnh minh họa." };
        updateStorage(newLook);
        return newLook;
      });
    } finally {
      setIsGeneratingImage(false);
    }
  };

  useEffect(() => {
    if (needsIndependentValidation(look)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      validateLook();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const hasFiredImageGeneration = useRef(false);
  useEffect(() => {
    if (!look.imageUrl && !look.imageFallback && !hasFiredImageGeneration.current) {
      hasFiredImageGeneration.current = true;
      generateImage();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [look.imageUrl, look.imageFallback]);

  const badge = VALIDATION_BADGE[look.validation.status];
  const validationUiState = resolveValidationUiState(look, isValidating, validationError);

  return (
    <article className="flex flex-col rounded-2xl border border-slate-200 bg-white shadow-sm overflow-hidden transition hover:shadow-md hover:-translate-y-0.5">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full bg-gradient-to-br from-slate-100 to-slate-200 flex items-center justify-center p-4 text-center">
        {look.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={look.imageUrl}
              alt={`Bản phối ${look.name}`}
              className="h-full w-full object-cover"
            />
            <div className="absolute bottom-0 inset-x-0 bg-black/50 px-2 py-1.5 text-center backdrop-blur-sm">
              <p className="text-[10px] text-white/90">{look.imageDisclaimer ?? "Ảnh minh họa bởi AI, không phải hiện vật hay phục dựng xác thực."}</p>
            </div>
          </>
        ) : isGeneratingImage ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 text-slate-500">
            <span className="h-6 w-6 border-2 border-emerald-600 border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs font-medium">Đang tạo ảnh minh họa...</span>
          </div>
        ) : look.imageFallback ? (
          <div className="flex flex-col items-center gap-2 text-slate-500">
            <svg
              className="h-10 w-10 opacity-40 text-amber-500"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-medium">Ảnh minh họa không khả dụng</span>
            <span className="text-[10px] opacity-80">{look.imageFallback}</span>
            <button onClick={() => generateImage(true)} className="mt-2 text-xs font-semibold text-emerald-700 hover:underline">
              Thử lại
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-slate-400">
            <span className="text-xs">Chờ tạo ảnh...</span>
          </div>
        )}
        
        {/* Index badge */}
        <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-slate-900/70 text-xs font-bold text-white shadow-sm z-10">
          {index + 1}
        </span>
        {/* Validation badge */}
        {validationUiState === "validating" ? (
          <span role="status" aria-live="polite" className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-slate-100 text-slate-600 border border-slate-200 flex items-center gap-1.5 z-10">
            <span className="h-1.5 w-1.5 rounded-full bg-slate-400 animate-pulse" />
            ĐANG KIỂM DUYỆT
          </span>
        ) : validationUiState === "error" ? (
          <span className="absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold bg-red-100 text-red-800 border border-red-200 z-10">
            LỖI KIỂM DUYỆT
          </span>
        ) : (
          <span
            className={`absolute top-3 right-3 rounded-full px-2.5 py-0.5 text-xs font-semibold ${badge.className} z-10`}
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
        {validationUiState === "error" && (
          <div role="alert" className="rounded-lg border border-red-200 bg-red-50 p-3 flex flex-col items-center gap-2">
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
        {validationUiState !== "validating" &&
          validationUiState !== "error" &&
          look.validation.warnings.length > 0 && (
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
