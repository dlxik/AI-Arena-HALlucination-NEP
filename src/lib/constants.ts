export const PROJECT_NAME = "AI Arena";
export const MOCK_SOURCE_ID = "SOURCE_PLACEHOLDER";
export const RECOMMENDATION_COUNT = 3;

/** Danh sách lựa chọn dùng chung giữa UI và structured intent validation. */
export const OCCASIONS = [
  { value: "tet", label: "Tết Nguyên Đán" },
  { value: "cultural_visit", label: "Tham quan di tích / không gian văn hóa" },
  { value: "festival", label: "Lễ hội truyền thống" },
  { value: "photoshoot", label: "Chụp ảnh kỷ yếu / kỷ niệm" },
  { value: "casual", label: "Đi chơi thường ngày" },
] as const;

export const GARMENTS = [
  { value: "auto", label: "Tự động đề xuất" },
  { value: "ao_dai", label: "Áo dài" },
  { value: "ao_ngu_than", label: "Áo ngũ thân" },
  { value: "ao_tu_than", label: "Áo tứ thân" },
  { value: "nhat_binh", label: "Nhật Bình" },
] as const;

export const STYLES = [
  { value: "traditional", label: "Traditional — Truyền thống thuần túy" },
  { value: "minimal", label: "Minimal — Tối giản hiện đại" },
  { value: "elegant", label: "Elegant — Trang nhã, thanh lịch" },
  { value: "romantic", label: "Romantic — Lãng mạn, dịu dàng" },
  { value: "street", label: "Street — Phong cách đường phố" },
] as const;

export const OCCASION_IDS = OCCASIONS.map(({ value }) => value);
export const GARMENT_IDS = GARMENTS.map(({ value }) => value);
export const STYLE_IDS = STYLES.map(({ value }) => value);

export const COLORS = [
  { value: "pastel_blue", label: "Xanh pastel" },
  { value: "soft_white", label: "Trắng ngà" },
  { value: "dusty_rose", label: "Hồng cánh sen" },
  { value: "forest_green", label: "Xanh lá rừng" },
  { value: "terracotta", label: "Đất nung" },
  { value: "deep_burgundy", label: "Đỏ đô" },
  { value: "lavender", label: "Tím lavender" },
  { value: "warm_beige", label: "Beige ấm" },
  { value: "gold_accent", label: "Vàng nhạt" },
  { value: "midnight_navy", label: "Xanh navy đêm" },
] as const;

export const GARMENT_LABEL: Record<string, string> = {
  ao_dai: "Áo dài",
  ao_ngu_than: "Áo ngũ thân",
  ao_tu_than: "Áo tứ thân",
  nhat_binh: "Nhật Bình",
  auto: "Tự chọn",
};

export const STYLE_LABEL: Record<string, string> = {
  traditional: "Traditional",
  minimal: "Minimal",
  elegant: "Elegant",
  romantic: "Romantic",
  street: "Street",
};

export const SEVERITY_COLOR: Record<string, string> = {
  low: "text-amber-600 bg-amber-50 border-amber-200",
  medium: "text-orange-600 bg-orange-50 border-orange-200",
  high: "text-red-600 bg-red-50 border-red-200",
};

export const VALIDATION_BADGE: Record<
  string,
  { label: string; className: string }
> = {
  pass: {
    label: "PASS",
    className: "bg-emerald-100 text-emerald-800 border border-emerald-200",
  },
  warning: {
    label: "WARNING",
    className: "bg-amber-100 text-amber-800 border border-amber-200",
  },
  revise: {
    label: "REVISE",
    className: "bg-red-100 text-red-800 border border-red-200",
  },
};

export const DEFAULT_GEMINI_MODEL = "gemini-3.8-flash";
export const DEFAULT_GEMINI_TIMEOUT_MS = 15_000;
