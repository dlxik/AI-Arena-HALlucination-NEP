import Link from "next/link";
import { fixtureOutput } from "@/lib/fixtures";
import ResultCard from "@/components/results/ResultCard";

export default function ResultsPage() {
  const { looks } = fixtureOutput;

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
            Bấm vào bản phối để xem Cultural Passport — nguồn gốc, quy tắc bảo tồn và giải thích chi tiết.
          </p>
        </div>
        <Link
          href="/create"
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-emerald-700 hover:text-emerald-800 transition sm:mt-0"
        >
          ← Thay đổi yêu cầu
        </Link>
      </div>

      {/* Loading messages (static preview) */}
      <div className="mb-8 hidden">
        {[
          "Đang phân tích nhu cầu…",
          "Đang tìm dữ liệu văn hóa phù hợp…",
          "Đang phối Việt phục…",
          "Đang kiểm tra mức độ phù hợp…",
          "Đang tạo hình ảnh minh họa…",
        ].map((msg) => (
          <p key={msg} className="text-sm text-slate-500">
            {msg}
          </p>
        ))}
      </div>

      {/* Result cards grid */}
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
        {looks.map((look, i) => (
          <ResultCard key={look.id} look={look} index={i} />
        ))}
      </div>

      {/* Schema notes */}
      <div className="mt-10 rounded-2xl border border-amber-200 bg-amber-50 px-5 py-4 text-sm text-amber-800">
        <p className="font-semibold mb-1">📋 Đây là bản phối mẫu (fixture)</p>
        <p>
          Dữ liệu hiển thị từ{" "}
          <code className="rounded bg-amber-100 px-1 font-mono text-xs">
            src/lib/fixtures.ts
          </code>
          . Khi Lan Anh kết nối Gemini API, các bản phối sẽ được tạo theo nhu cầu thực tế.
        </p>
      </div>
    </main>
  );
}
