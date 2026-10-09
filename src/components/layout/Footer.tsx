import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-auto border-t border-[#ebe4d6] bg-[#f7f4ed]/90 text-[#4a4f56]">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-10">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-4">
          {/* Brand & Story */}
          <div className="space-y-4 md:col-span-2">
            <div className="flex items-center gap-2">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#1b4332] text-white shadow-sm text-base">
                🌿
              </span>
              <span className="font-serif text-xl font-bold tracking-tight text-[#1b2a22]">
                AI Arena
              </span>
              <span className="text-xs uppercase tracking-widest text-[#2d5a3f] font-semibold bg-[#e7efe9] px-2.5 py-0.5 rounded-full border border-[#d2e3d6]">
                HALlucination
              </span>
            </div>
            <p className="max-w-md text-sm leading-relaxed text-[#5a626a]">
              Một góc nhỏ dành cho những ai trân quý cổ phục Việt 🌿. Chúng mình kết hợp trí tuệ nhân tạo cùng dữ liệu văn hóa bảo tàng đã qua kiểm duyệt để mang lại những gợi ý phối trang phục thanh nhã, đúng dịp và trọn vẹn tinh thần truyền thống.
            </p>
            <p className="text-xs italic text-[#78828c]">
              “A small place for big memories & cultural heritage”
            </p>
          </div>

          {/* Cổ phục & Dịp lễ */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1b2a22]">
              Dịp lễ & Di sản
            </h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/create?occasion=tet" className="hover:text-[#1b4332] transition-colors">
                  Tết Nguyên Đán
                </Link>
              </li>
              <li>
                <Link href="/create?occasion=cultural_visit" className="hover:text-[#1b4332] transition-colors">
                  Tham quan di tích
                </Link>
              </li>
              <li>
                <Link href="/create?occasion=festival" className="hover:text-[#1b4332] transition-colors">
                  Lễ hội truyền thống
                </Link>
              </li>
              <li>
                <Link href="/create?occasion=photoshoot" className="hover:text-[#1b4332] transition-colors">
                  Chụp ảnh kỷ niệm
                </Link>
              </li>
            </ul>
          </div>

          {/* Dữ liệu & Kiểm chứng */}
          <div className="space-y-3">
            <h4 className="font-serif text-sm font-bold uppercase tracking-wider text-[#1b2a22]">
              Kiểm chứng văn hóa
            </h4>
            <ul className="space-y-2 text-sm text-[#5a626a]">
              <li className="flex items-center gap-1.5">
                <span className="text-[#1b4332]">✓</span> Nguồn Bảo tàng Lịch sử
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#1b4332]">✓</span> Tư liệu nghiên cứu phục dựng
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#1b4332]">✓</span> Cultural Critic độc lập
              </li>
              <li className="flex items-center gap-1.5">
                <span className="text-[#1b4332]">✓</span> Cultural Passport minh bạch
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-[#e8dfcf] pt-8 text-xs text-[#7c858e] sm:flex-row">
          <p>© 2026 AI Arena • HALlucination. Đồng hành cùng di sản phục trang Việt Nam 🌿</p>
          <div className="flex items-center gap-6">
            <Link href="/" className="hover:text-[#1b4332] transition-colors">
              Trang chủ
            </Link>
            <Link href="/create" className="hover:text-[#1b4332] transition-colors">
              Tạo bản phối
            </Link>
            <Link href="/results?sample=1" className="hover:text-[#1b4332] transition-colors">
              Bản phối mẫu
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
