"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import CulturalPassport from "@/components/cultural-passport/CulturalPassport";
import type { RecommendationOutput } from "@/types/api";
import type { OutfitLook } from "@/types/outfit";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type PageState =
  | { status: "found"; look: OutfitLook; isFixture: boolean }
  | { status: "not-found" }
  | { status: "no-session" };

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

function readLookFromStorage(id: string | undefined): PageState {
  try {
    const raw = sessionStorage.getItem("recommendation_result");
    if (!raw) return { status: "no-session" };
    const stored = JSON.parse(raw) as {
      data: RecommendationOutput;
      isFixture: boolean;
    };
    const look = stored.data?.looks?.find((l) => l.id === id);
    if (!look) return { status: "not-found" };
    return { status: "found", look, isFixture: stored.isFixture };
  } catch {
    return { status: "not-found" };
  }
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function CulturalPassportPage() {
  const params = useParams<{ id: string }>();
  const id = params?.id;
  // Lazy initializer: đọc sessionStorage ngay lần đầu render, không dùng useEffect
  const [state] = useState<PageState>(() => readLookFromStorage(id));

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
  const { look, isFixture } = state;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      {/* Breadcrumb */}
      <nav className="mb-8 flex items-center gap-2 text-sm text-slate-500">
        <Link href="/results" className="hover:text-emerald-700 transition-colors">
          ← Bản phối
        </Link>
        <span>/</span>
        <span className="text-slate-900 font-medium">{look.name}</span>
      </nav>

      {/* Fixture badge */}
      {isFixture && (
        <div className="mb-6 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-700">
          📋 Đây là dữ liệu mẫu (fixture) — không phải kết quả từ API thật.
        </div>
      )}

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Cultural Passport
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">{look.name}</h1>
          <p className="mt-2 text-sm text-slate-500 font-mono">{look.id}</p>
        </div>

        <CulturalPassport look={look} />

        {/* Source IDs */}
        {look.sourceIds.length > 0 && (
          <div className="mt-8 rounded-xl border border-slate-100 bg-slate-50 px-5 py-4">
            <p className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-2">
              Nguồn tham khảo
            </p>
            <div className="flex flex-wrap gap-2">
              {look.sourceIds.map((sid) => (
                <span
                  key={sid}
                  className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-mono text-slate-600"
                >
                  {sid}
                </span>
              ))}
            </div>
          </div>
        )}

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
