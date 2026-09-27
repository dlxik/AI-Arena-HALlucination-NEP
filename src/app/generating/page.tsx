"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import type { RecommendationInput, RecommendationOutput, ApiResponse } from "@/types/api";

// ─────────────────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────────────────

type PageState =
  | { status: "loading"; step: number }
  | { status: "error"; code: string; message: string; canRetry: boolean };

// ─────────────────────────────────────────────────────────
// Constants
// ─────────────────────────────────────────────────────────

const STEPS = [
  "Đang phân tích nhu cầu…",
  "Đang tìm dữ liệu văn hóa phù hợp…",
  "Đang phối Việt phục…",
  "Đang kiểm tra mức độ phù hợp văn hóa…",
  "Đang hoàn thiện gợi ý…",
];

/** Mã lỗi có thể retry (không phải lỗi input của người dùng) */
const RETRYABLE_CODES = new Set([
  "GEMINI_TIMEOUT",
  "GEMINI_UPSTREAM_ERROR",
  "INVALID_MODEL_OUTPUT",
  "NETWORK_ERROR",
]);

// ─────────────────────────────────────────────────────────
// Component
// ─────────────────────────────────────────────────────────

export default function GeneratingPage() {
  const router = useRouter();
  const [state, setState] = useState<PageState>({ status: "loading", step: 0 });
  // retrySignal: tăng lên để kích hoạt retry
  const [retrySignal, setRetrySignal] = useState(0);

  // Advance loading steps every 1.2s for UX
  useEffect(() => {
    if (state.status !== "loading") return;
    const timer = setInterval(() => {
      setState((prev) => {
        if (prev.status !== "loading") return prev;
        return { ...prev, step: Math.min(prev.step + 1, STEPS.length - 1) };
      });
    }, 1200);
    return () => clearInterval(timer);
  }, [state.status]);

  // Gọi API khi mount hoặc khi retry (retrySignal thay đổi)
  useEffect(() => {
    let cancelled = false;

    async function run() {
      // Đọc input từ sessionStorage (được lưu bởi /create)
      const raw = sessionStorage.getItem("recommendation_input");
      if (!raw) {
        if (!cancelled)
          setState({
            status: "error",
            code: "MISSING_INPUT",
            message: "Không tìm thấy thông tin yêu cầu. Vui lòng quay lại và điền lại form.",
            canRetry: false,
          });
        return;
      }

      let input: RecommendationInput;
      try {
        input = JSON.parse(raw) as RecommendationInput;
      } catch {
        if (!cancelled)
          setState({
            status: "error",
            code: "INVALID_INPUT_STORAGE",
            message: "Dữ liệu yêu cầu bị lỗi. Vui lòng quay lại và thử lại.",
            canRetry: false,
          });
        return;
      }

      if (!cancelled) setState({ status: "loading", step: 0 });

      try {
        const res = await fetch("/api/recommend", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(input),
        });

        const json: ApiResponse<RecommendationOutput> = await res.json();

        if (res.ok && json.success) {
          // Lưu kết quả API thật vào sessionStorage (không phải fixture)
          sessionStorage.setItem(
            "recommendation_result",
            JSON.stringify({ data: json.data, isFixture: false })
          );
          if (!cancelled) router.replace("/results");
          return;
        }

        // API trả về lỗi có cấu trúc
        const errCode = !json.success ? json.error.code : `HTTP_${res.status}`;
        const errMsg = !json.success
          ? json.error.message
          : `Máy chủ phản hồi lỗi ${res.status}`;

        if (!cancelled)
          setState({
            status: "error",
            code: errCode,
            message: errMsg,
            canRetry: RETRYABLE_CODES.has(errCode),
          });
      } catch {
        if (!cancelled)
          setState({
            status: "error",
            code: "NETWORK_ERROR",
            message: "Không thể kết nối đến máy chủ. Kiểm tra kết nối mạng rồi thử lại.",
            canRetry: true,
          });
      }
    }

    void run();
    return () => {
      cancelled = true;
    };
  }, [retrySignal, router]);

  // ── Render: loading ──────────────────────────────────────
  if (state.status === "loading") {
    return (
      <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
        <div className="flex min-h-[60vh] flex-col items-center justify-center gap-8 px-6 text-center">
          {/* Spinner */}
          <div className="relative flex h-16 w-16 items-center justify-center">
            <div className="absolute inset-0 rounded-full border-2 border-slate-200" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-emerald-600" />
            <span className="text-2xl">👗</span>
          </div>

          {/* Steps */}
          <div className="space-y-3">
            {STEPS.map((step, i) => (
              <p
                key={step}
                className={`text-sm transition-all duration-300 ${
                  i < state.step
                    ? "text-emerald-600 line-through opacity-50"
                    : i === state.step
                    ? "font-medium text-slate-900"
                    : "text-slate-300"
                }`}
              >
                {i < state.step && "✓ "}
                {step}
              </p>
            ))}
          </div>

          <p className="text-xs text-slate-400">AI đang xử lý — thường mất 5–15 giây</p>
        </div>
      </main>
    );
  }

  // ── Render: error ────────────────────────────────────────
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 text-center">
        {/* Icon */}
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-50 text-3xl">
          ⚠️
        </div>

        {/* Message */}
        <div className="space-y-2">
          <h1 className="text-xl font-semibold text-slate-900">Không thể tạo bản phối</h1>
          <p className="max-w-md text-sm leading-6 text-slate-600">{state.message}</p>
          {state.code !== "MISSING_INPUT" && state.code !== "INVALID_INPUT_STORAGE" && (
            <p className="text-xs text-slate-400">Mã lỗi: {state.code}</p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-wrap justify-center gap-3">
          {state.canRetry && (
            <button
              id="btn-retry"
              onClick={() => setRetrySignal((s) => s + 1)}
              className="rounded-xl bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-800 active:scale-[0.98]"
            >
              🔄 Thử lại
            </button>
          )}
          <button
            id="btn-back-to-form"
            onClick={() => router.push("/create")}
            className="rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-50 active:scale-[0.98]"
          >
            ← Quay lại form
          </button>
        </div>
      </div>
    </main>
  );
}
