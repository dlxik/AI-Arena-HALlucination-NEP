"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CulturalPassport from "@/components/cultural-passport/CulturalPassport";
import type { RecommendationOutput, RecommendationInput, RemixOutput } from "@/types/api";
import type { OutfitLook } from "@/types/outfit";
import { toValidationLook } from "@/lib/client/look-payload";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type PageState =
  | { status: "found"; look: OutfitLook; isFixture: boolean; originalInput?: RecommendationInput }
  | { status: "not-found" }
  | { status: "no-session" };

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function readLookFromStorage(id: string | undefined): PageState {
  try {
    const rawResult = sessionStorage.getItem("recommendation_result");
    const rawInput = sessionStorage.getItem("recommendation_input");
    
    if (!rawResult) return { status: "no-session" };
    
    const storedResult = JSON.parse(rawResult) as {
      data: RecommendationOutput;
      isFixture: boolean;
    };
    
    let originalInput: RecommendationInput | undefined;
    if (rawInput) {
      originalInput = JSON.parse(rawInput);
    }

    const look = storedResult.data?.looks?.find((l) => l.id === id);
    if (!look) return { status: "not-found" };
    
    return { status: "found", look, isFixture: storedResult.isFixture, originalInput };
  } catch {
    return { status: "not-found" };
  }
}

function updateStorage(originalLookId: string, updatedLook: OutfitLook) {
  try {
    const raw = sessionStorage.getItem("recommendation_result");
    if (raw) {
      const stored = JSON.parse(raw);
      const lookIndex = stored.data.looks.findIndex((l: OutfitLook) => l.id === originalLookId);
      if (lookIndex !== -1) {
        stored.data.looks[lookIndex] = updatedLook;
        sessionStorage.setItem("recommendation_result", JSON.stringify(stored));
      }
    }
  } catch {}
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function CulturalPassportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  
  // Lazy initializer: đọc sessionStorage ngay lần đầu render, không dùng useEffect
  const [state, setState] = useState<PageState>(() => readLookFromStorage(id));
  
  const [isRemixing, setIsRemixing] = useState(false);
  const [isRevalidating, setIsRevalidating] = useState(false);
  const [remixError, setRemixError] = useState("");

  const [editPalette, setEditPalette] = useState("");
  const [editAccessories, setEditAccessories] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // ── No session / not found ───────────────────────────────
  if (state.status === "no-session" || state.status === "not-found") {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            🪡
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-slate-900">
              {state.status === "not-found"
                ? "Không tìm thấy bản phối này"
                : "Phiên làm việc đã hết hạn"}
            </h1>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              {state.status === "not-found"
                ? "Bản phối không tồn tại hoặc đã bị thay đổi."
                : "Vui lòng quay lại trang kết quả hoặc tạo bản phối mới."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/results"
              className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              ← Xem bản phối
            </Link>
            <Link
              href="/create"
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
            >
              Tạo bản phối mới
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Found ─────────────────────────────────────────────────
  const { look, isFixture, originalInput } = state;

  const startEdit = () => {
    setEditPalette(look.palette.join(", "));
    setEditAccessories(look.accessories.join(", "));
    setIsEditing(true);
  };

  const handleRemix = async () => {
    setIsRemixing(true);
    setIsRevalidating(true);
    setRemixError("");

    try {
      if (!originalInput) throw new Error("Thiếu dữ liệu yêu cầu ban đầu.");

      const remixRes = await fetch("/api/remix", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          look: toValidationLook(look),
          recommendationInput: originalInput,
          changes: {
            palette: editPalette.split(",").map((s) => s.trim()).filter(Boolean),
            accessories: editAccessories.split(",").map((s) => s.trim()).filter(Boolean),
          },
        }),
      });
      const remixData = await remixRes.json();
      
      if (!remixData.success) {
        throw new Error(remixData.error?.message || "Remix thất bại.");
      }
      setIsRevalidating(false);
      const output = remixData.data as RemixOutput;
      const updatedLook: OutfitLook = {
        ...output.look,
        validation: output.validation,
        imageUrl: output.image.status === "generated" ? output.image.imageUrl : undefined,
        imageFallback: output.image.status === "fallback" ? output.image.fallbackReason : undefined,
        imageDisclaimer: output.disclaimer,
      };

      // Update state and storage
      setState({ ...state, look: updatedLook });
      updateStorage(look.id, updatedLook);
      setIsEditing(false);
    } catch (err: unknown) {
      setRemixError((err as Error).message || "Đã xảy ra lỗi khi remix.");
    } finally {
      setIsRemixing(false);
      setIsRevalidating(false);
    }
  };

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center justify-between text-sm text-slate-500">
        <div className="flex items-center gap-2">
          <Link href="/results" className="hover:text-emerald-700 transition-colors">
            ← Bản phối
          </Link>
          <span>/</span>
          <span className="text-slate-900 font-medium">{look.name}</span>
        </div>
      </nav>

      {/* Fixture badge */}
      {isFixture && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          📋 Đây là dữ liệu mẫu (fixture) — không phải kết quả từ API thật.
        </div>
      )}

      {/* Remix Controls */}
      <div className="mb-8 rounded-3xl border border-slate-200 bg-slate-50 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Remix (Tinh chỉnh)
          </h2>
          {!isEditing && (
            <button
              onClick={startEdit}
              className="text-xs font-semibold text-emerald-700 hover:underline"
            >
              Chỉnh sửa
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Bảng màu (cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                value={editPalette}
                onChange={(e) => setEditPalette(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                disabled={isRemixing}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Phụ kiện (cách nhau bằng dấu phẩy)</label>
              <input
                type="text"
                value={editAccessories}
                onChange={(e) => setEditAccessories(e.target.value)}
                className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:border-emerald-500 focus:outline-none"
                disabled={isRemixing}
              />
            </div>

            {remixError && (
              <p className="text-xs text-red-600 font-medium">{remixError}</p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleRemix}
                disabled={isRemixing}
                className="rounded-xl bg-emerald-700 px-5 py-2 text-sm font-semibold text-white transition hover:bg-emerald-800 disabled:opacity-50 flex items-center gap-2"
              >
                {isRemixing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    {isRevalidating ? "Đang kiểm duyệt..." : "Đang tạo ảnh..."}
                  </>
                ) : (
                  "Cập nhật & Chạy lại Critic"
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isRemixing}
                className="text-sm font-medium text-slate-500 hover:text-slate-700 disabled:opacity-50"
              >
                Hủy
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-slate-500">
            Bạn có thể chỉnh sửa bảng màu hoặc phụ kiện. Sau khi lưu, Cultural Critic sẽ kiểm duyệt lại và tạo ảnh mới.
          </p>
        )}
      </div>

      <div className={`rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10 transition-opacity ${isRemixing ? 'opacity-50' : 'opacity-100'}`}>
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Cultural Passport
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{look.name}</h1>
          <p className="mt-2 text-sm text-slate-500 font-mono">{look.id}</p>
        </div>

        <CulturalPassport look={look} />

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-slate-100 pt-8">
          <Link
            href="/results"
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50"
          >
            ← Xem tất cả bản phối
          </Link>
          <Link
            href="/create"
            className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800"
          >
            Tạo bản phối mới
          </Link>
        </div>
      </div>
    </main>
  );
}
