"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CulturalPassport from "@/components/cultural-passport/CulturalPassport";
import type { RecommendationOutput, RecommendationInput, RemixOutput } from "@/types/api";
import type { OutfitLook } from "@/types/outfit";
import { toValidationLook } from "@/lib/client/look-payload";
import { fixtureInput, fixtureOutput } from "@/lib/fixtures";

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
    let rawResult = sessionStorage.getItem("recommendation_result");
    let rawInput = sessionStorage.getItem("recommendation_input");
    
    if (!rawResult && id && fixtureOutput.looks.some((l) => l.id === id)) {
      rawResult = JSON.stringify({ data: fixtureOutput, isFixture: true });
      rawInput = JSON.stringify(fixtureInput);
      sessionStorage.setItem("recommendation_result", rawResult);
      sessionStorage.setItem("recommendation_input", rawInput);
    }
    
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
      <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
        <div className="heritage-card flex min-h-[55vh] flex-col items-center justify-center gap-6 p-8 sm:p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ece1] text-4xl shadow-inner border border-[#e6dbc9]">
            🪡
          </div>
          <div className="space-y-2">
            <h1 className="text-2xl font-serif font-bold text-[#1b4332]">
              {state.status === "not-found"
                ? "Không tìm thấy bản phối này"
                : "Phiên làm việc đã khép lại"}
            </h1>
            <p className="max-w-sm text-sm leading-relaxed text-[#5c6470]">
              {state.status === "not-found"
                ? "Bản phối không tồn tại hoặc đã bị thay đổi trong quá trình lưu trữ."
                : "Vui lòng quay lại trang danh sách hoặc khởi tạo lại bản phối mới."}
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/results"
              className="rounded-full border border-[#d6cbba] bg-[#fbf9f5] px-6 py-2.5 text-sm font-semibold text-[#1b4332] transition hover:bg-[#f4ece1]"
            >
              ← Xem danh mục bản phối
            </Link>
            <Link
              href="/create"
              className="rounded-full bg-[#1b4332] px-6 py-2.5 text-sm font-semibold text-[#fbf9f5] shadow transition hover:bg-[#133024]"
            >
              🌿 Tạo bản phối mới
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
    <main className="mx-auto w-full max-w-4xl px-6 py-12 sm:px-10">
      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center justify-between text-sm text-[#7a828e]">
        <div className="flex items-center gap-2">
          <Link href="/results" className="hover:text-[#1b4332] transition-colors flex items-center gap-1 font-serif">
            <span>←</span>
            <span>Bản phối</span>
          </Link>
          <span>/</span>
          <span className="text-[#1b4332] font-serif font-bold">{look.name}</span>
        </div>
      </nav>

      {/* Fixture badge */}
      {isFixture && (
        <div className="mb-6 rounded-2xl border border-[#e6c875] bg-[#fbf6e2] px-5 py-3 text-xs text-[#845b10] flex items-center gap-2">
          <span>📜</span>
          <span>Đây là dữ liệu mẫu đối chiếu (fixture) — trích xuất từ kho lưu trữ mẫu chuẩn.</span>
        </div>
      )}

      {/* Remix Controls */}
      <div className="heritage-card mb-8 p-6 shadow-sm">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <span className="text-base">🪡</span>
            <h2 className="text-xs font-serif font-bold uppercase tracking-widest text-[#1b4332]">
              Xưởng tinh chỉnh phối sắc (Remix Atelier)
            </h2>
          </div>
          {!isEditing && (
            <button
              onClick={startEdit}
              className="rounded-full border border-[#d6cbba] bg-[#fbf9f5] px-3.5 py-1 text-xs font-serif font-semibold text-[#1b4332] hover:bg-[#f4ece1] transition"
            >
              Chỉnh sửa sắc thái ✎
            </button>
          )}
        </div>

        {isEditing ? (
          <div className="space-y-4">
            <div>
              <label htmlFor="remix-palette" className="block text-xs font-serif font-bold text-[#1b4332] mb-1">
                Bảng màu (ngăn cách bằng dấu phẩy)
              </label>
              <input
                id="remix-palette"
                type="text"
                value={editPalette}
                onChange={(e) => setEditPalette(e.target.value)}
                className="w-full rounded-xl border border-[#d6cbba] bg-[#fdfcf9] px-3.5 py-2.5 text-sm text-[#1b4332] focus:border-[#1b4332] focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
                disabled={isRemixing}
              />
            </div>
            <div>
              <label htmlFor="remix-accessories" className="block text-xs font-serif font-bold text-[#1b4332] mb-1">
                Phụ kiện (ngăn cách bằng dấu phẩy)
              </label>
              <input
                id="remix-accessories"
                type="text"
                value={editAccessories}
                onChange={(e) => setEditAccessories(e.target.value)}
                className="w-full rounded-xl border border-[#d6cbba] bg-[#fdfcf9] px-3.5 py-2.5 text-sm text-[#1b4332] focus:border-[#1b4332] focus:outline-none focus:ring-1 focus:ring-[#1b4332]"
                disabled={isRemixing}
              />
            </div>

            {remixError && (
              <p role="alert" className="text-xs text-[#a84232] font-medium bg-red-50 p-2.5 rounded-lg border border-red-200">
                {remixError}
              </p>
            )}

            <div className="flex items-center gap-3 mt-4">
              <button
                onClick={handleRemix}
                disabled={isRemixing}
                className="rounded-full bg-[#1b4332] px-6 py-2.5 text-sm font-semibold text-[#fbf9f5] transition hover:bg-[#133024] disabled:opacity-50 flex items-center gap-2 shadow"
              >
                {isRemixing ? (
                  <>
                    <span className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                    <span role="status" aria-live="polite">
                      {isRevalidating ? "Đang đối chiếu Critic..." : "Đang họa tác ảnh..."}
                    </span>
                  </>
                ) : (
                  "Cập nhật & Chạy lại Critic ✦"
                )}
              </button>
              <button
                onClick={() => setIsEditing(false)}
                disabled={isRemixing}
                className="text-sm font-serif font-medium text-[#7a828e] hover:text-[#1b4332] disabled:opacity-50"
              >
                Hủy bỏ
              </button>
            </div>
          </div>
        ) : (
          <p className="text-xs text-[#5c6470] leading-relaxed">
            Bạn có thể tùy biến sắc độ vải hoặc chi tiết phụ kiện theo cảm hứng riêng. Sau khi lưu, Cultural Critic sẽ tiến hành khảo cứu độc lập để đảm bảo không vi phạm các cấm kỵ trang phục.
          </p>
        )}
      </div>

      <div className={`heritage-card p-6 sm:p-10 shadow-md transition-opacity ${isRemixing ? 'opacity-50' : 'opacity-100'}`}>
        {/* Header */}
        <div className="mb-8 border-b border-[#e8dfcf] pb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 rounded-full border border-[#d5c398] bg-[#f6efe1] px-3 py-0.5 text-xs font-serif font-semibold text-[#8b6514] mb-2">
              <span>📜</span>
              <span>Cultural Passport • Hồ Sơ Di Sản</span>
            </div>
            <h1 className="text-3xl font-serif font-bold text-[#1b4332]">{look.name}</h1>
          </div>
          <p className="text-xs font-mono text-[#8c94a0] bg-[#f4ece1] px-3 py-1 rounded-full border border-[#e0d6c4] self-start sm:self-auto">
            Mã định danh: {look.id}
          </p>
        </div>

        <CulturalPassport look={look} />

        {/* Actions */}
        <div className="mt-10 flex flex-wrap items-center gap-4 border-t border-[#e8dfcf] pt-8">
          <Link
            href="/results"
            className="rounded-full border border-[#d6cbba] bg-[#fbf9f5] px-6 py-2.5 text-sm font-semibold text-[#1b4332] transition hover:bg-[#f4ece1]"
          >
            ← Xem tất cả bản phối
          </Link>
          <Link
            href="/create"
            className="rounded-full bg-[#1b4332] px-6 py-2.5 text-sm font-semibold text-[#fbf9f5] shadow transition hover:bg-[#133024]"
          >
            🌿 Tạo bản phối mới
          </Link>
        </div>
      </div>
    </main>
  );
}
