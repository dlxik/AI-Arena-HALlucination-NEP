import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto flex min-h-[calc(100vh-4rem)] w-full max-w-5xl items-center px-6 py-16 sm:px-10">
      <section className="max-w-3xl space-y-8">
        <p className="text-sm font-semibold uppercase tracking-[0.24em] text-emerald-700">
          HALlucination presents
        </p>
        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-slate-950 sm:text-7xl">
            AI Arena
          </h1>
          <p className="max-w-2xl text-lg leading-8 text-slate-600 sm:text-xl">
            Khởi tạo bản phối trang phục văn hóa Việt theo dịp, phong cách và
            bảng màu, với lớp kiểm tra văn hóa trước khi tạo hình ảnh.
          </p>
        </div>
        <Link
          href="/create"
          className="inline-flex rounded-full bg-emerald-700 px-6 py-3 font-semibold text-white transition hover:bg-emerald-800 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-emerald-700"
        >
          Tạo bản phối
        </Link>
      </section>
    </main>
  );
}
