import type { RecommendationInput, RecommendationOutput } from "@/types/api";

/** Fixture input mẫu — dùng để test UI khi chưa có Gemini */
export const fixtureInput: RecommendationInput = {
  occasion: "cultural_visit",
  garment: "auto",
  style: "minimal",
  colors: ["pastel_blue"],
  remixLevel: 40,
  description: "Đi Văn Miếu, thích nữ tính nhưng không quá cổ.",
};

/** Fixture output mẫu — 3 looks đúng schema */
export const fixtureOutput: RecommendationOutput = {
  looks: [
    {
      id: "look_01",
      name: "Thanh Lam",
      garment: "ao_ngu_than",
      style: "minimal",
      palette: ["pastel_blue", "ivory"],
      items: ["Áo ngũ thân cổ tròn", "Quần lĩnh đen"],
      accessories: ["Nón quai thao nhỏ", "Giày thêu vải"],
      reason:
        "Áo ngũ thân phù hợp cho bối cảnh tham quan di tích văn hoá. Tông xanh pastel nhẹ nhàng, kiểu dáng minimal tránh cầu kỳ quá mức.",
      culturalNote:
        "Áo ngũ thân là trang phục truyền thống của người Việt, có năm thân vải tượng trưng cho tứ thân phụ mẫu và bản thân người mặc. Cổ đứng và khuy bên phải là đặc trưng cần giữ nguyên.",
      sourceIds: ["src_001", "src_002"],
      validation: {
        status: "pass",
        warnings: [],
      },
      imagePrompt:
        "Vietnamese woman wearing minimal ao ngu than in pastel blue with ivory pants, standing in a traditional Vietnamese temple courtyard, soft natural light, elegant pose",
      imageUrl: undefined,
    },
    {
      id: "look_02",
      name: "Ngọc Ngà",
      garment: "ao_dai",
      style: "elegant",
      palette: ["soft_white", "gold_accent"],
      items: ["Áo dài cổ thuyền", "Quần trắng"],
      accessories: ["Trâm cài tóc mạ vàng", "Túi nhỏ thêu hoa"],
      reason:
        "Áo dài trắng ánh vàng mang cảm giác trang nhã, phù hợp với không gian Văn Miếu. Cổ thuyền là biến thể hiện đại được chấp nhận trong bối cảnh chụp ảnh kỷ niệm.",
      culturalNote:
        "Áo dài hiện đại cho phép điều chỉnh kiểu cổ và chiều dài tà, tuy nhiên cần giữ độ che phủ phù hợp khi đến nơi thờ tự. Màu trắng là màu trung tính và được chấp nhận rộng rãi.",
      sourceIds: ["src_003"],
      validation: {
        status: "warning",
        warnings: [
          {
            ruleId: "RULE_AO_DAI_NECKLINE",
            severity: "low",
            reason:
              "Cổ thuyền sâu hơn thiết kế truyền thống. Phù hợp chụp ảnh nhưng cân nhắc khi vào khu vực thờ tự.",
            suggestedFix:
              "Thêm khăn lụa mỏng hoặc chọn cổ cao hơn nếu vào khu thờ phụng bên trong.",
          },
        ],
      },
      imagePrompt:
        "Vietnamese woman wearing elegant white ao dai with gold accents, traditional Confucian temple background, professional photography style, graceful",
      imageUrl: undefined,
    },
    {
      id: "look_03",
      name: "Hồng Mơ",
      garment: "ao_tu_than",
      style: "romantic",
      palette: ["dusty_rose", "warm_beige"],
      items: ["Áo tứ thân hồng cánh sen", "Váy đen"],
      accessories: ["Thắt lưng bao hoa lý", "Khăn vấn đầu đơn giản"],
      reason:
        "Áo tứ thân hồng mơ tạo cảm giác dịu dàng, lãng mạn. Phù hợp với bối cảnh tham quan di tích và phong cách romantic mà người dùng yêu thích.",
      culturalNote:
        "Áo tứ thân là trang phục dân gian miền Bắc, thường gắn với hội lễ Kinh Bắc. Cách buộc vạt trước thành nơ là đặc trưng cần giữ. Không phải trang phục cung đình nên có thể remix màu sắc linh hoạt hơn.",
      sourceIds: ["src_001", "src_004"],
      validation: {
        status: "pass",
        warnings: [],
      },
      imagePrompt:
        "Vietnamese woman in traditional ao tu than in dusty rose color, black skirt, traditional northern Vietnamese style, temple garden background, natural light",
      imageUrl: undefined,
    },
  ],
};
