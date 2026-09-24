import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-slate-200/70 bg-[#f6f7f2]/90 backdrop-blur-sm">
      <div className="mx-auto flex h-14 w-full max-w-5xl items-center justify-between px-6 sm:px-10">
        <Link
          href="/"
          className="flex items-center gap-2 font-semibold text-slate-900 hover:text-emerald-700 transition-colors"
        >
          <span className="text-emerald-700 font-bold">AI</span>
          <span>Arena</span>
          <span className="hidden sm:inline text-xs font-normal text-slate-400 tracking-wide ml-1">
            HALlucination
          </span>
        </Link>

        <nav className="flex items-center gap-6">
          <Link
            href="/create"
            className="text-sm text-slate-600 hover:text-emerald-700 transition-colors"
          >
            Tạo bản phối
          </Link>
        </nav>
      </div>
    </header>
  );
}
