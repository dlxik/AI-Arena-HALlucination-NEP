"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import ResultCard from "@/components/results/ResultCard";
import type { RecommendationOutput } from "@/types/api";
import { fixtureInput, fixtureOutput } from "@/lib/fixtures";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type StoredResult = {
  data: RecommendationOutput;
  /** true chỉ khi đây là fixture dùng để test offline, không phải response từ API */
  isFixture: boolean;
};

type PageState =
  | { status: "ready"; result: StoredResult }
  | { status: "no-data" };

// ─────────────────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────────────────

/** Đọc kết quả từ sessionStorage một lần khi component khởi tạo */
function readResultFromStorage(): PageState {
  try {
    const raw = sessionStorage.getItem("recommendation_result");
    if (raw) {
      const stored = JSON.parse(raw) as StoredResult;
      if (stored.data?.looks && Array.isArray(stored.data.looks)) {
        return { status: "ready", result: stored };
      }
    }
    if (typeof window !== "undefined" && window.location.search.includes("sample")) {
      const sampleResult: StoredResult = { data: fixtureOutput, isFixture: true };
      sessionStorage.setItem("recommendation_input", JSON.stringify(fixtureInput));
      sessionStorage.setItem("recommendation_result", JSON.stringify(sampleResult));
      return { status: "ready", result: sampleResult };
    }
    return { status: "no-data" };
  } catch {
    return { status: "no-data" };
  }
}

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function ResultsPage() {
  const router = useRouter();
  // Lazy initializer: đọc sessionStorage ngay lần đầu render, không dùng useEffect
  const [state] = useState<PageState>(readResultFromStorage);

  // ── No data / navigated directly ─────────────────────────
  if (state.status === "no-data") {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-3xl">
            🪡
          </div>
          <div className="space-y-2">
            <h1 className="text-xl font-semibold text-slate-900">Chưa có bản phối nào</h1>
            <p className="max-w-sm text-sm leading-6 text-slate-500">
              Hãy điền form để AI tạo gợi ý phù hợp với bạn.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Link
              href="/create"
              id="btn-go-to-create"
              className="rounded-xl bg-emerald-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              Tạo bản phối →
            </Link>
            <Link
              href="/results?sample=1"
              id="btn-load-sample"
              className="rounded-xl border border-slate-200 bg-white px-6 py-2.5 text-sm font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50 active:scale-[0.98]"
            >
              📋 Xem bản phối mẫu
            </Link>
          </div>
        </div>
      </main>
    );
  }

  // ── Ready ─────────────────────────────────────────────────
  const { result } = state;
  const { looks } = result.data;

  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10">
      {/* Header */}
      <div className="mb-10 flex flex-col gap-1 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Bước 2 / 2 — Bản phối mẫu
          </p>
          <h1 className="mt-1 text-3xl font-semibold text-slate-950 sm:text-4xl">
            {looks.length} gợi ý phù hợp với bạn
          </h1>
          <p className="mt-2 text-sm text-slate-500">
            Bấm vào bản phối để xem Cultural Passport — nguồn gốc, quy tắc bảo tồn và giải
            thích chi tiết.
          </p>
        </div>
        <Link
          href="/create"
          id="btn-change-request"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition sm:mt-0"
        >
          ← Thay đổi yêu cầu
        </Link>
      </div>

      {/* Fixture warning — chỉ hiển thị khi đang xem fixture, KHÔNG âm thầm */}
      {result.isFixture && (
        <div
          id="fixture-warning"
          className="mb-8 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800"
        >
          <p className="font-semibold mb-1">📋 Đây là bản phối mẫu (fixture)</p>
          <p>
            Dữ liệu hiển thị từ{" "}
            <code className="rounded bg-amber-100 px-1 font-mono text-xs">
              src/lib/fixtures.ts
            </code>
            . Khi API được kết nối đầy đủ, các bản phối sẽ được tạo theo nhu cầu thực tế.
          </p>
        </div>
      )}

      {/* Result cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look, i) => (
          <ResultCard key={look.id} look={look} index={i} />
        ))}
      </div>

      {/* New look CTA */}
      <div className="mt-10 flex justify-center">
        <button
          id="btn-new-look"
          onClick={() => {
            sessionStorage.removeItem("recommendation_result");
            sessionStorage.removeItem("recommendation_input");
            router.push("/create");
          }}
          className="rounded-xl border border-slate-200 px-6 py-3 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
        >
          ✨ Tạo bản phối mới
        </button>
      </div>
    </main>
  );
}
