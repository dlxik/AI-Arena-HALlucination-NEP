import Link from "next/link";
import { notFound } from "next/navigation";
import { fixtureOutput } from "@/lib/fixtures";
import CulturalPassport from "@/components/cultural-passport/CulturalPassport";

export default async function CulturalPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const look = fixtureOutput.looks.find((l) => l.id === id);

  if (!look) {
    notFound();
  }

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

      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        {/* Header */}
        <div className="mb-8 border-b border-slate-100 pb-6">
          <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
            Cultural Passport
          </p>
          <h1 className="mt-2 text-3xl font-semibold text-slate-950">
            {look.name}
          </h1>
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
