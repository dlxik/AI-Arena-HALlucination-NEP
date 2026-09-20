import Link from "next/link";

export default async function CulturalPassportPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Cultural Passport
        </p>
        <h1 className="mt-3 text-3xl font-semibold text-slate-950">
          Hồ sơ bản phối
        </h1>
        <dl className="mt-8 grid gap-5 sm:grid-cols-2">
          <div>
            <dt className="text-sm text-slate-500">Look ID</dt>
            <dd className="mt-1 font-mono text-sm text-slate-900">{id}</dd>
          </div>
          <div>
            <dt className="text-sm text-slate-500">Trạng thái kiểm chứng</dt>
            <dd className="mt-1 text-slate-900">Dữ liệu mẫu — cần rà soát</dd>
          </div>
        </dl>
        <p className="mt-8 leading-7 text-slate-600">
          Nội dung nguồn, quy tắc bảo tồn và đánh giá chi tiết sẽ hiển thị tại
          đây sau khi Cultural Knowledge Base được đội ngũ chuyên môn duyệt.
        </p>
        <Link className="mt-8 inline-block font-semibold text-emerald-700" href="/create">
          ← Tạo bản phối khác
        </Link>
      </div>
    </main>
  );
}
