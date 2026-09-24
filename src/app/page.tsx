import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-3.5rem)] w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <section className="max-w-3xl space-y-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          HALlucination presents
        </p>
        <div className="space-y-5">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
            AI Arena
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Trợ lý phối Việt phục thông minh — đề xuất bản phối theo dịp và
            phong cách, kèm{" "}
            <span className="font-semibold text-slate-900">
              Cultural Guardrail
            </span>{" "}
            kiểm tra tính phù hợp văn hóa trước khi tạo hình ảnh.
          </p>
        </div>

        {/* Feature highlights */}
        <ul className="grid gap-3 sm:grid-cols-2">
          {[
            { icon: "👗", text: "Đề xuất 3 bản phối theo nhu cầu" },
            { icon: "🏛️", text: "Cultural KB từ nguồn bảo tàng, nghiên cứu" },
            { icon: "✅", text: "Cultural Critic kiểm tra độc lập" },
            { icon: "📜", text: "Cultural Passport: nguồn & giải thích" },
          ].map(({ icon, text }) => (
            <li
              key={text}
              className="flex items-start gap-3 rounded-xl border border-slate-200/70 bg-white/60 px-4 py-3 text-sm text-slate-700"
            >
              <span className="text-base">{icon}</span>
              {text}
            </li>
          ))}
        </ul>

        <div className="flex flex-wrap gap-4">
          <Link
            id="btn-create-look-home"
            href="/create"
            className="inline-flex rounded-full bg-emerald-700 px-7 py-3.5 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
          >
            Tạo bản phối →
          </Link>
          <Link
            href="/results"
            className="inline-flex rounded-full border border-slate-200 bg-white px-7 py-3.5 font-semibold text-slate-700 transition hover:border-slate-300 hover:bg-slate-50"
          >
            Xem bản phối mẫu
          </Link>
        </div>
      </section>
    </main>
  );
}
