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
      <main className="mx-auto w-full max-w-3xl px-6 py-16 sm:px-10">
        <div className="heritage-card flex min-h-[55vh] flex-col items-center justify-center gap-6 p-8 sm:p-12 text-center">
          <div className="flex h-20 w-20 items-center justify-center rounded-full bg-[#f4ece1] text-4xl shadow-inner border border-[#e6dbc9]">
            🪡
          </div>
          <div className="space-y-3">
            <span className="inline-block text-xs font-semibold uppercase tracking-widest text-[#a84232]">
              Sổ tay còn để ngỏ
            </span>
            <h1 className="text-2xl sm:text-3xl font-serif font-bold text-[#1b4332]">
              Chưa có bản phối nào được ghi lại
            </h1>
            <p className="max-w-md text-sm leading-relaxed text-[#5c6470]">
              Hãy chia sẻ dịp lễ, cổ phục mong muốn hoặc câu chuyện của bạn để AI cùng các chuyên gia văn hóa khơi mở gợi ý phù hợp.
            </p>
          </div>
          <div className="flex flex-wrap justify-center gap-3 pt-2">
            <Link
              href="/create"
              id="btn-go-to-create"
              className="rounded-full bg-[#1b4332] px-7 py-3 text-sm font-semibold text-[#fbf9f5] shadow-md transition hover:bg-[#133024] active:scale-[0.98]"
            >
              🌿 Bắt đầu phối đồ →
            </Link>
            <Link
              href="/results?sample=1"
              id="btn-load-sample"
              className="rounded-full border border-[#d6cbba] bg-[#fbf9f5] px-6 py-3 text-sm font-semibold text-[#1b4332] transition hover:bg-[#f4eee1] active:scale-[0.98]"
            >
              📜 Xem bản phối mẫu
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
      <div className="mb-10 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between border-b border-[#e8dfcf] pb-6">
        <div>
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d5c398] bg-[#f6efe1] px-3 py-1 text-xs font-serif font-semibold text-[#8b6514] mb-2">
            <span>🌿</span>
            <span>Bước 2 / 2 • Kỷ yếu phối sắc di sản</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-serif font-bold text-[#1b4332]">
            {looks.length} Gợi ý Cổ phục dành riêng cho bạn
          </h1>
          <p className="mt-2 text-sm text-[#5c6470] max-w-2xl leading-relaxed">
            Mỗi bản phối đều được đối chiếu cẩn mật qua hệ thống quy tắc khảo cứu (Cultural Critic). Bấm vào từng bản phối để mở <strong className="text-[#1b4332]">Cultural Passport</strong> xem xuất xứ, điển tích và quy tắc bảo tồn.
          </p>
        </div>
        <Link
          href="/create"
          id="btn-change-request"
          className="mt-4 inline-flex items-center gap-2 rounded-full border border-[#d6cbba] bg-[#fbf9f5] px-4 py-2 text-sm font-medium text-[#1b4332] transition hover:bg-[#f4ece1] sm:mt-0"
        >
          <span>←</span>
          <span>Thay đổi yêu cầu</span>
        </Link>
      </div>

      {/* Fixture warning — chỉ hiển thị khi đang xem fixture, KHÔNG âm thầm */}
      {result.isFixture && (
        <div
          id="fixture-warning"
          className="mb-8 rounded-2xl border border-[#e6c875] bg-[#fbf6e2] px-6 py-4 text-sm text-[#845b10] shadow-sm flex items-start gap-3"
        >
          <span className="text-xl">📜</span>
          <div>
            <p className="font-serif font-bold text-base mb-1 text-[#6b4700]">Đây là bản phối mẫu đối chiếu (fixture)</p>
            <p className="leading-relaxed opacity-95">
              Dữ liệu hiển thị từ nguồn mẫu chuẩn{" "}
              <code className="rounded bg-[#f0e4b8] px-1.5 py-0.5 font-mono text-xs text-[#523700]">
                src/lib/fixtures.ts
              </code>
              . Các bộ quy tắc văn hóa và hình ảnh minh họa được áp dụng trọn vẹn theo tiêu chuẩn di sản.
            </p>
          </div>
        </div>
      )}

      {/* Result cards grid */}
      <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look, i) => (
          <ResultCard key={look.id} look={look} index={i} />
        ))}
      </div>

      {/* New look CTA */}
      <div className="mt-12 flex justify-center border-t border-[#e8dfcf] pt-8">
        <button
          id="btn-new-look"
          onClick={() => {
            sessionStorage.removeItem("recommendation_result");
            sessionStorage.removeItem("recommendation_input");
            router.push("/create");
          }}
          className="rounded-full border border-[#c8bcab] bg-[#fbf9f5] px-8 py-3.5 text-sm font-semibold text-[#1b4332] shadow-sm transition hover:bg-[#f2ebdf] hover:border-[#b5a794] active:scale-[0.98] flex items-center gap-2"
        >
          <span>✨</span>
          <span>Khởi tạo bản phối mới</span>
        </button>
      </div>
    </main>
  );
}
