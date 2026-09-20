const fieldClass =
  "mt-2 w-full rounded-xl border border-slate-300 bg-white px-4 py-3 text-slate-900 outline-none transition focus:border-emerald-700 focus:ring-2 focus:ring-emerald-100";

export default function CreatePage() {
  return (
    <main className="mx-auto w-full max-w-3xl px-6 py-12 sm:px-10">
      <div className="mb-8 space-y-2">
        <p className="text-sm font-semibold uppercase tracking-widest text-emerald-700">
          Mock experience
        </p>
        <h1 className="text-3xl font-semibold text-slate-950 sm:text-4xl">
          Tạo bản phối
        </h1>
        <p className="text-slate-600">
          Form này xác nhận cấu trúc UI. Luồng Gemini chưa được kết nối.
        </p>
      </div>

      <form className="grid gap-6 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:grid-cols-2 sm:p-8">
        <label className="text-sm font-medium text-slate-700">
          Dịp
          <input className={fieldClass} defaultValue="Tham quan Văn Miếu" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Trang phục
          <select className={fieldClass} defaultValue="ao_ngu_than">
            <option value="auto">Tự động đề xuất</option>
            <option value="ao_ngu_than">Áo ngũ thân</option>
          </select>
        </label>
        <label className="text-sm font-medium text-slate-700">
          Phong cách
          <input className={fieldClass} defaultValue="Thanh lịch, tối giản" />
        </label>
        <label className="text-sm font-medium text-slate-700">
          Màu sắc
          <input className={fieldClass} defaultValue="Xanh pastel" />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Mức độ remix: 40
          <input className="mt-3 w-full accent-emerald-700" type="range" min="0" max="100" defaultValue="40" />
        </label>
        <label className="text-sm font-medium text-slate-700 sm:col-span-2">
          Mô tả thêm
          <textarea className={fieldClass} rows={4} placeholder="Không bắt buộc" />
        </label>
        <button
          type="button"
          className="rounded-xl bg-emerald-700 px-5 py-3 font-semibold text-white sm:col-span-2"
        >
          Xem bản phối mẫu
        </button>
      </form>
    </main>
  );
}
