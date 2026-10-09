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
    <article className="heritage-card flex flex-col overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1">
      {/* Image area */}
      <div className="relative aspect-[4/3] w-full bg-[#f2ece0] flex items-center justify-center p-4 text-center overflow-hidden border-b border-[#e8dfcf]">
        {look.imageUrl ? (
          <>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={look.imageUrl}
              alt={`Bản phối ${look.name}`}
              className="h-full w-full object-cover transition duration-500 hover:scale-105"
            />
            <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/75 via-black/40 to-transparent px-3 py-2 text-center backdrop-blur-[2px]">
              <p className="text-[11px] font-sans text-white/90 leading-tight">{look.imageDisclaimer ?? "Ảnh minh họa bởi AI, không phải hiện vật hay phục dựng xác thực."}</p>
            </div>
          </>
        ) : isGeneratingImage ? (
          <div role="status" aria-live="polite" className="flex flex-col items-center gap-3 text-[#5c6470]">
            <span className="h-7 w-7 border-2 border-[#1b4332] border-t-transparent rounded-full animate-spin"></span>
            <span className="text-xs font-serif font-medium text-[#1b4332]">Đang họa tác ảnh phục trang...</span>
          </div>
        ) : look.imageFallback ? (
          <div className="flex flex-col items-center gap-2 text-[#5c6470] px-4">
            <svg
              className="h-10 w-10 opacity-50 text-[#c59b27]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
            <span className="text-xs font-serif font-semibold text-[#8b6514]">Ảnh minh họa tạm khép lại</span>
            <span className="text-[11px] opacity-80 max-w-xs">{look.imageFallback}</span>
            <button onClick={() => generateImage(true)} className="mt-2 text-xs font-semibold text-[#1b4332] hover:underline underline-offset-2">
              Khởi tạo lại ảnh ↻
            </button>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-[#8c94a0]">
            <span className="text-xs font-serif">Chờ tạo ảnh minh họa...</span>
          </div>
        )}
        
        {/* Index badge */}
        <span className="absolute top-3 left-3 flex h-7 w-7 items-center justify-center rounded-full bg-[#1b4332] text-xs font-serif font-bold text-[#fbf9f5] border border-[#d5c398] shadow z-10">
          {index + 1}
        </span>
        {/* Validation badge */}
        {validationUiState === "validating" ? (
          <span role="status" aria-live="polite" className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-serif font-semibold bg-[#fbf9f5]/90 text-[#5c6470] border border-[#d6cbba] backdrop-blur-sm flex items-center gap-1.5 z-10 shadow-sm">
            <span className="h-1.5 w-1.5 rounded-full bg-[#c59b27] animate-pulse" />
            ĐANG KHẢO CỨU
          </span>
        ) : validationUiState === "error" ? (
          <span className="absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-serif font-semibold bg-red-50 text-[#a84232] border border-red-200 z-10 shadow-sm">
            LỖI KIỂM ĐỊNH
          </span>
        ) : (
          <span
            className={`absolute top-3 right-3 rounded-full px-3 py-1 text-xs font-serif font-semibold border backdrop-blur-sm z-10 shadow-sm ${badge.className}`}
          >
            {badge.label}
          </span>
        )}
      </div>

      {/* Content */}
      <div className="flex flex-1 flex-col gap-4 p-6 bg-gradient-to-b from-[#fbf9f5] to-[#f7f2e8]">
        {/* Header */}
        <div>
          <div className="inline-block rounded-full bg-[#f2e9dc] px-2.5 py-0.5 text-[11px] font-semibold uppercase tracking-wider text-[#a84232] border border-[#e5d8c3] mb-1.5">
            {GARMENT_LABEL[look.garment] ?? look.garment}
          </div>
          <h2 className="text-xl font-serif font-bold text-[#1b4332] leading-snug">{look.name}</h2>
        </div>

        {/* Palette */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-serif font-medium text-[#7a828e]">Sắc độ:</span>
          <div className="flex flex-wrap gap-1.5">
            {look.palette.map((color) => (
              <span
                key={color}
                className="inline-flex items-center gap-1.5 rounded-full border border-[#dcd2c1] bg-[#fdfcf9] px-2.5 py-0.5 text-xs text-[#2d3748]"
              >
                <span className="h-2 w-2 rounded-full border border-black/10 bg-current opacity-70" />
                {color.replace(/_/g, " ")}
              </span>
            ))}
          </div>
        </div>

        {/* Items */}
        {look.items.length > 0 && (
          <div className="rounded-xl border border-[#ebe4d5] bg-[#f9f6ef] p-3">
            <p className="text-xs font-serif font-bold text-[#1b4332] mb-1.5 flex items-center gap-1">
              <span>🪡</span>
              <span>Trang phục chính</span>
            </p>
            <ul className="space-y-1">
              {look.items.map((item) => (
                <li key={item} className="flex items-start gap-2 text-xs text-[#3f4753] leading-relaxed">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#1b4332]" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Accessories */}
        {look.accessories.length > 0 && (
          <div className="rounded-xl border border-[#ebe4d5] bg-[#f9f6ef] p-3">
            <p className="text-xs font-serif font-bold text-[#a84232] mb-1.5 flex items-center gap-1">
              <span>🏮</span>
              <span>Phụ kiện đi kèm</span>
            </p>
            <ul className="space-y-1">
              {look.accessories.map((acc) => (
                <li key={acc} className="flex items-start gap-2 text-xs text-[#3f4753] leading-relaxed">
                  <span className="mt-1 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-[#c59b27]" />
                  {acc}
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Reason */}
        <p className="text-xs font-serif italic leading-relaxed text-[#5c6470] bg-[#f4eee1] p-3 rounded-xl border-l-2 border-[#1b4332] break-words">
          &ldquo;{look.reason}&rdquo;
        </p>

        {/* Retry Button */}
        {validationUiState === "error" && (
          <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-3.5 flex flex-col items-center gap-2">
            <p className="text-xs text-[#a84232] text-center font-serif">Có gián đoạn khi đối chiếu quy chuẩn văn hóa.</p>
            <button
              onClick={validateLook}
              className="text-xs font-semibold text-white bg-[#a84232] hover:bg-[#8f3629] px-4 py-1.5 rounded-full shadow transition"
            >
              Thử lại khảo cứu
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
                className={`rounded-xl border px-3.5 py-2.5 text-xs leading-relaxed ${SEVERITY_COLOR[w.severity] ?? ""}`}
              >
                <div className="flex justify-between items-start gap-2 mb-1">
                  <p className="font-semibold break-words">{w.reason}</p>
                  <span className="shrink-0 rounded bg-white/60 px-1.5 py-0.5 text-[10px] font-mono opacity-80">
                    {w.ruleId}
                  </span>
                </div>
                <p className="opacity-90 break-words">💡 Gợi ý: {w.suggestedFix}</p>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <div className="mt-auto pt-3">
          <Link
            href={`/looks/${look.id}`}
            id={`btn-view-passport-${look.id}`}
            className="block w-full rounded-full border border-[#1b4332] bg-[#fbf9f5] px-4 py-2.5 text-center text-xs font-serif font-bold text-[#1b4332] shadow-sm transition hover:bg-[#1b4332] hover:text-[#fbf9f5] active:scale-[0.99]"
          >
            Mở Cultural Passport ↗
          </Link>
        </div>
      </div>
    </article>
  );
}
