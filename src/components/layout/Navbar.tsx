import Link from "next/link";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-40 border-b border-[#eae3d5] bg-[#fbf9f5]/90 backdrop-blur-md transition-all">
      <div className="mx-auto flex h-16 w-full max-w-6xl items-center justify-between px-6 sm:px-10">
        {/* Brand logo inspired by TiCi & HuongStory */}
        <Link
          href="/"
          className="group flex items-center gap-2.5 transition-transform"
        >
          <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#1b4332] text-white shadow-sm text-sm group-hover:scale-105 transition-transform">
            🌿
          </span>
          <div className="flex flex-col">
            <div className="flex items-center gap-1.5 leading-none">
              <span className="font-serif text-lg font-bold tracking-tight text-[#1b2a22]">
                AI Arena
              </span>
              <span className="rounded-full bg-[#e8efe9] px-2 py-0.5 text-[10px] font-semibold text-[#1b4332] border border-[#d2e2d6]">
                HALlucination
              </span>
            </div>
            <span className="text-[10px] text-[#7a828a] tracking-wide mt-0.5 hidden sm:inline">
              Gìn giữ nét đẹp di sản Việt
            </span>
          </div>
        </Link>

        {/* Navigation links */}
        <nav className="flex items-center gap-6 sm:gap-8">
          <Link
            href="/"
            className="text-sm font-medium text-[#4a5056] hover:text-[#1b4332] transition-colors"
          >
            Trang chủ
          </Link>
          <Link
            href="/results?sample=1"
            className="hidden sm:inline text-sm font-medium text-[#4a5056] hover:text-[#1b4332] transition-colors"
          >
            Bản phối mẫu
          </Link>
          <Link
            id="btn-nav-create"
            href="/create"
            className="inline-flex items-center gap-1.5 rounded-full bg-[#1b4332] px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-[#255640] hover:shadow transition-all"
          >
            <span>Tạo bản phối</span>
            <span className="text-xs">🌿</span>
          </Link>
        </nav>
      </div>
    </header>
  );
}
