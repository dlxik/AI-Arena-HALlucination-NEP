"use client";

import { useEffect, useState } from "react";

const STEPS = [
  "Đang phân tích nhu cầu…",
  "Đang tìm dữ liệu văn hóa phù hợp…",
  "Đang phối Việt phục…",
  "Đang kiểm tra mức độ phù hợp văn hóa…",
  "Đang tạo hình ảnh minh họa…",
];

interface LoadingScreenProps {
  /** Khoảng thời gian mỗi bước (ms). Default: 1200 */
  stepMs?: number;
}

export default function LoadingScreen({ stepMs = 1200 }: LoadingScreenProps) {
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev < STEPS.length - 1 ? prev + 1 : prev));
    }, stepMs);
    return () => clearInterval(interval);
  }, [stepMs]);

  return (
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
              i < currentStep
                ? "text-emerald-600 line-through opacity-50"
                : i === currentStep
                ? "font-medium text-slate-900"
                : "text-slate-300"
            }`}
          >
            {i < currentStep && "✓ "}
            {step}
          </p>
        ))}
      </div>

      <p className="text-xs text-slate-400">
        AI đang xử lý — thường mất 5–10 giây
      </p>
    </div>
  );
}
