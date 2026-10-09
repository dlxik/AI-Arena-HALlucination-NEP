import Link from "next/link";

export default function Home() {
  return (
    <main className="mx-auto w-full max-w-6xl px-6 py-12 sm:px-10 space-y-20">
      {/* ── 1. HERO SECTION (Storytelling style of TiCi & HuongStory) ── */}
      <section className="relative overflow-hidden rounded-3xl border border-[#ebe4d4] bg-gradient-to-b from-[#fdfbf7] to-[#f7f3eb] p-8 sm:p-14 shadow-[0_4px_30px_rgba(45,35,20,0.04)]">
        {/* Subtle decorative background watermark */}
        <div className="absolute -right-16 -top-16 select-none text-[160px] opacity-[0.03] font-serif pointer-events-none">
          蓮
        </div>

        <div className="relative z-10 max-w-3xl space-y-6">
          <div className="inline-flex items-center gap-2 rounded-full border border-[#d6e3d9] bg-[#eef5f0] px-3.5 py-1 text-xs font-semibold text-[#1b4332]">
            <span>🌿</span>
            <span>Xin chào, chúng mình là HALlucination</span>
          </div>

          <h1 className="font-serif text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-[#1c241f] leading-[1.2]">
            Gìn giữ nét đẹp Việt phục trong từng khoảnh khắc đời sống
          </h1>

          <p className="text-base sm:text-lg leading-relaxed text-[#515860] max-w-2xl font-normal">
            Có những ngày bạn đứng trước gương thật lâu, muốn diện một tà áo truyền thống thật đẹp nhưng lại băn khoăn về quy tắc phối màu, phụ kiện hay sự trang nghiêm của dịp lễ.
            <strong className="font-semibold text-[#1b2a22]"> AI Arena </strong>
            được tạo nên như một nơi giúp việc lựa chọn trang phục văn hóa trở nên tự tin, thanh lịch và chuẩn mực hơn bao giờ hết.
          </p>

          {/* Action buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <Link
              id="btn-create-look-home"
              href="/create"
              className="inline-flex items-center gap-2 rounded-full bg-[#1b4332] px-8 py-4 text-base font-semibold text-white shadow-md hover:bg-[#255640] hover:shadow-lg transition-all transform hover:-translate-y-0.5"
            >
              <span>Bắt đầu tạo bản phối</span>
              <span>→</span>
            </Link>
            <Link
              id="btn-sample-looks-home"
              href="/results?sample=1"
              className="inline-flex items-center gap-2 rounded-full border border-[#ded5c4] bg-white px-7 py-4 text-base font-medium text-[#3b424a] shadow-sm hover:border-[#cfc2aa] hover:bg-[#faf7f2] transition-all"
            >
              <span>Xem bản phối mẫu</span>
              <span className="text-sm text-[#8c949e]">🌸</span>
            </Link>
          </div>

          {/* Trust badges */}
          <div className="pt-4 border-t border-[#ede6d8] flex flex-wrap gap-y-2 gap-x-6 text-xs text-[#636c75]">
            <span className="flex items-center gap-1.5">
              <span className="text-[#1b4332] font-bold">✓</span> Tư liệu Bảo tàng Lịch sử Quốc gia
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#1b4332] font-bold">✓</span> Cultural Critic thẩm định văn hóa
            </span>
            <span className="flex items-center gap-1.5">
              <span className="text-[#1b4332] font-bold">✓</span> Minh bạch nguồn gốc Passport
            </span>
          </div>
        </div>
      </section>

      {/* ── 2. HÀNH TRÌNH 3 MIỀN (Inspired by HuongStory) ── */}
      <section className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#a84232]">
              <span>Hành trình ký ức</span>
              <span>•</span>
              <span>HuongStory Heritage</span>
            </div>
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b2a22]">
              Di sản cổ phục dọc miền đất nước
            </h2>
          </div>
          <p className="text-xs sm:text-sm text-[#747e88] max-w-sm">
            Mỗi vùng miền mang một hơi thở và cốt cách riêng biệt qua từng lớp vải, đường thêu.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Miền Bắc */}
          <div className="heritage-card rounded-2xl p-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🏮</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#a84232] bg-[#fbf0ee] px-2.5 py-1 rounded-full border border-[#f5ded9]">
                Kinh Bắc • Thăng Long
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1c241f]">
              Áo Tứ Thân & Áo Dài Hà Thành
            </h3>
            <p className="text-sm leading-relaxed text-[#59636d]">
              Gắn liền với hội hè làng quê Bắc Bộ và vẻ đẹp đoan trang của người phụ nữ Tràng An. Vạt áo buông thướt tha, nón quai thao và dải yếm đào duyên dáng.
            </p>
            <div className="pt-2">
              <Link
                href="/create?garment=ao_tu_than"
                className="inline-flex items-center text-xs font-semibold text-[#1b4332] hover:underline gap-1"
              >
                Gợi ý bản phối Tứ Thân <span>→</span>
              </Link>
            </div>
          </div>

          {/* Miền Trung */}
          <div className="heritage-card rounded-2xl p-7 space-y-4 border-[#e5dccb]">
            <div className="flex items-center justify-between">
              <span className="text-2xl">👑</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#c59b27] bg-[#fdf8ec] px-2.5 py-1 rounded-full border border-[#f5ebd1]">
                Cố Đô Huế
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1c241f]">
              Áo Nhật Bình Cung Đình
            </h3>
            <p className="text-sm leading-relaxed text-[#59636d]">
              Trang phục quyền quý của bậc hậu phi triều Nguyễn với dải cổ áo hình chữ nhật viền hoa văn tinh xảo, tà áo thêu phượng vũ cùng dải ngũ sắc trang nghiêm.
            </p>
            <div className="pt-2">
              <Link
                href="/create?garment=nhat_binh"
                className="inline-flex items-center text-xs font-semibold text-[#1b4332] hover:underline gap-1"
              >
                Gợi ý bản phối Nhật Bình <span>→</span>
              </Link>
            </div>
          </div>

          {/* Cả nước / Miền Nam */}
          <div className="heritage-card rounded-2xl p-7 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-2xl">🌾</span>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#1b4332] bg-[#eef5f0] px-2.5 py-1 rounded-full border border-[#d6e3d9]">
                Giao lưu văn hóa
              </span>
            </div>
            <h3 className="font-serif text-xl font-bold text-[#1c241f]">
              Áo Ngũ Thân & Áo Dài Đương Đại
            </h3>
            <p className="text-sm leading-relaxed text-[#59636d]">
              Cốt cách đạo làm người qua năm thân áo tượng trưng cho tứ thân phụ mẫu và bản thân. Đơn giản, thanh lịch, thích hợp từ đời thường tới lễ tết trọng đại.
            </p>
            <div className="pt-2">
              <Link
                href="/create?garment=ao_ngu_than"
                className="inline-flex items-center text-xs font-semibold text-[#1b4332] hover:underline gap-1"
              >
                Gợi ý bản phối Ngũ Thân <span>→</span>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── 3. DỊP LỄ & TRUYỀN THỐNG (Inspired by TiCi) ── */}
      <section className="space-y-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#1b4332]">
            <span>Mùa lễ hội & Khoảnh khắc</span>
            <span>•</span>
            <span>TiCi Collection</span>
          </div>
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b2a22]">
            Chọn trang phục theo từng dịp lễ
          </h2>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            {
              id: "tet",
              title: "Tết Nguyên Đán",
              icon: "🧧",
              desc: "Đỏ đô, vàng kim, hoa mai đào mang lại may mắn, thịnh vượng đầu năm.",
            },
            {
              id: "cultural_visit",
              title: "Tham quan di tích",
              icon: "🏛️",
              desc: "Gam màu thanh nhã, cổ áo kín đáo, trang trọng nơi đền chùa, di sản.",
            },
            {
              id: "festival",
              title: "Lễ hội dân gian",
              icon: "🥁",
              desc: "Rực rỡ sắc màu truyền thống hòa cùng không khí lễ hội đình làng.",
            },
            {
              id: "photoshoot",
              title: "Chụp ảnh kỷ niệm",
              icon: "📷",
              desc: "Phối màu tương phản tinh tế, phụ kiện kiềng vàng, quạt giấy nên thơ.",
            },
          ].map((item) => (
            <Link
              key={item.id}
              href={`/create?occasion=${item.id}`}
              className="heritage-card rounded-2xl p-6 flex flex-col justify-between group hover:border-[#1b4332]/40"
            >
              <div className="space-y-3">
                <span className="text-3xl block group-hover:scale-110 transition-transform">
                  {item.icon}
                </span>
                <h3 className="font-serif text-lg font-bold text-[#1b2a22] group-hover:text-[#1b4332] transition-colors">
                  {item.title}
                </h3>
                <p className="text-xs text-[#626c76] leading-relaxed">
                  {item.desc}
                </p>
              </div>
              <div className="pt-4 mt-2 border-t border-[#f0eae0] flex items-center justify-between text-xs font-semibold text-[#1b4332]">
                <span>Phối theo dịp này</span>
                <span className="group-hover:translate-x-1 transition-transform">→</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* ── 4. HỘP MÙ CỔ PHỤC (Feature signature inspired by TiCi "Hộp Mù") ── */}
      <section className="rounded-3xl border border-[#e8dfcf] bg-gradient-to-r from-[#fbf5ea] via-[#f7f0e3] to-[#f4ebe0] p-8 sm:p-12 text-center space-y-5 shadow-sm">
        <span className="inline-block text-4xl animate-bounce">🎁</span>
        <div className="max-w-xl mx-auto space-y-2">
          <h2 className="font-serif text-2xl sm:text-3xl font-bold text-[#1b2a22]">
            Hộp Mù Cổ Phục 🌿
          </h2>
          <p className="text-sm text-[#5d6570] leading-relaxed">
            Hôm nay bạn chưa biết nên diện phong cách gì? Hãy thử mở một tín hiệu vũ trụ để đón nhận một gợi ý trang phục ngẫu nhiên đầy thi vị nhé!
          </p>
        </div>
        <div>
          <Link
            href="/results?sample=1"
            className="inline-flex items-center gap-2 rounded-full bg-[#a84232] px-7 py-3.5 text-sm font-semibold text-white shadow hover:bg-[#91372a] transition-all transform hover:scale-105"
          >
            <span>Mở hộp quà ngẫu nhiên ngay</span>
            <span>✨</span>
          </Link>
        </div>
      </section>
    </main>
  );
}
