/**
 * UNIT CATEGORY TAXONOMY — Phân loại đơn vị tổ chức
 *
 * Định nghĩa những gì CÂY TỔ CHỨC không thể biết:
 *  - Loại hệ thống (Đảng / Hành chính / Sự nghiệp) → kiểu ký ban hành
 *  - Chức danh lãnh đạo & nhân viên phù hợp → filter job titles
 *  - Có được ký văn bản đối ngoại không
 *  - Kiểu định biên (staffing pattern)
 *  - Thông tin bổ sung cần thu thập khi thiết lập đơn vị
 *
 * KHÔNG định nghĩa: quan hệ cha-con, thứ bậc leo thang
 * → Đã có trong cây tổ chức.
 */

// ============================================================================
// TYPES
// ============================================================================

export type UnitCategoryCode =
  | "CHINH_QUYEN"    // Cơ quan hành chính nhà nước (Sở, UBND, Chi cục...)
  | "DANG"           // Tổ chức đảng (Đảng bộ, Chi bộ, Tỉnh ủy...)
  | "THAM_MUU"       // Phòng ban tham mưu tổng hợp (Văn phòng, Thanh tra...)
  | "CHUYEN_MON"     // Phòng ban chuyên môn nghiệp vụ
  | "SU_NGHIEP"      // Đơn vị sự nghiệp công lập (TT, Trường, BV...)
  | "PHONG_THUOC_SN"; // Phòng/Tổ nội bộ thuộc đơn vị sự nghiệp

/** Nhóm hệ thống chính trị — quyết định kiểu ký ban hành */
export type PoliticalSystem =
  | "HANH_CHINH"  // Hành chính nhà nước — ký QĐ, CV, TB theo thẩm quyền phân cấp
  | "DANG"        // Tổ chức đảng — ký NQ, CT, TB đảng; không thay thế văn bản hành chính
  | "SU_NGHIEP";  // Sự nghiệp công lập — ký nội bộ, HĐ dịch vụ; vượt thẩm quyền trình cơ quan chủ quản

/** Quyền ký văn bản đối ngoại */
export type SigningAuthority =
  | "FULL"        // Được ký ban hành văn bản ra bên ngoài theo thẩm quyền
  | "DELEGATED"   // Chỉ được ký khi được ủy quyền / thừa lệnh
  | "INTERNAL";   // Chỉ ký văn bản nội bộ, không đối ngoại

/** Kiểu định biên */
export type StaffingPattern =
  | "LEADER_DEPT"   // Giám đốc/Phó GĐ + Trưởng/Phó phòng + Chuyên viên
  | "PARTY_ORG"     // Bí thư/Phó BT + Ủy viên + Chuyên viên đảng
  | "DEPT_UNIT"     // Trưởng phòng/Phó phòng + Chuyên viên + Nhân viên
  | "SERVICE_ORG"   // Giám đốc TT/Phó GĐ + Viên chức chuyên môn
  | "SUB_TEAM";     // Tổ trưởng/Tổ phó + Nhân viên/Kỹ thuật viên

// ============================================================================
// TAXONOMY CONFIG
// ============================================================================

export interface UnitCategoryConfig {
  code: UnitCategoryCode;

  /** Nhóm hệ thống chính trị — quyết định kiểu ký */
  politicalSystem: PoliticalSystem;

  /** Quyền ký văn bản đối ngoại */
  signingAuthority: SigningAuthority;

  /** Từ khoá chức danh lãnh đạo (dùng filter job-title list từ server) */
  leaderTitleKeywords: string[];

  /** Từ khoá chức danh chuyên môn/nhân viên */
  staffTitleKeywords: string[];

  /** Kiểu định biên */
  staffingPattern: StaffingPattern;

  /** Trường bổ sung cần thu thập khi tạo/sửa đơn vị */
  requiredFields: ("domainIds" | "geographicAreaIds" | "scope")[];

  /** Ghi chú thẩm quyền ký (hiển thị trong UI để admin hiểu) */
  signingNote: string;

  /** Ghi chú về nhiệm vụ đặc thù của loại đơn vị này */
  purposeNote: string;
}

// ============================================================================
// DATA
// ============================================================================

export const UNIT_CATEGORY_TAXONOMY: Record<UnitCategoryCode, UnitCategoryConfig> = {

  CHINH_QUYEN: {
    code: "CHINH_QUYEN",
    politicalSystem: "HANH_CHINH",
    signingAuthority: "FULL",
    leaderTitleKeywords: [
      "Giám đốc", "Phó Giám đốc",
      "Chủ tịch UBND", "Phó Chủ tịch UBND",
    ],
    staffTitleKeywords: [
      "Chuyên viên cao cấp", "Chuyên viên chính", "Chuyên viên", "Nhân viên",
    ],
    staffingPattern: "LEADER_DEPT",
    requiredFields: ["domainIds", "geographicAreaIds"],
    signingNote: "Ký ban hành văn bản quản lý nhà nước theo thẩm quyền được phân cấp (QĐ, CV, TB).",
    purposeNote: "Thực hiện chức năng quản lý hành chính nhà nước trong lĩnh vực được giao.",
  },

  DANG: {
    code: "DANG",
    politicalSystem: "DANG",
    signingAuthority: "FULL",
    leaderTitleKeywords: [
      "Bí thư", "Phó Bí thư",
      "Ủy viên Ban Thường vụ", "Tỉnh ủy viên",
    ],
    staffTitleKeywords: [
      "Chuyên viên đảng", "Nhân viên văn phòng Đảng ủy",
    ],
    staffingPattern: "PARTY_ORG",
    requiredFields: [],
    signingNote: "Ký ban hành nghị quyết, chỉ thị, thông báo kết luận của Đảng. Không thay thế văn bản hành chính nhà nước.",
    purposeNote: "Lãnh đạo chính trị theo hệ thống Đảng, song song với hệ thống hành chính chính quyền.",
  },

  THAM_MUU: {
    code: "THAM_MUU",
    politicalSystem: "HANH_CHINH",
    signingAuthority: "DELEGATED",
    leaderTitleKeywords: [
      "Chánh Văn phòng", "Phó Chánh Văn phòng",
      "Chánh Thanh tra", "Phó Chánh Thanh tra",
      "Trưởng phòng", "Phó Trưởng phòng",
    ],
    staffTitleKeywords: [
      "Chuyên viên", "Kế toán viên", "Nhân viên",
    ],
    staffingPattern: "DEPT_UNIT",
    requiredFields: ["domainIds"],
    signingNote: "Ký thừa lệnh hoặc theo ủy quyền. Không ban hành văn bản quy phạm pháp luật độc lập.",
    purposeNote: "Tham mưu tổng hợp, điều phối nội bộ, hành chính quản trị cho lãnh đạo cơ quan.",
  },

  CHUYEN_MON: {
    code: "CHUYEN_MON",
    politicalSystem: "HANH_CHINH",
    signingAuthority: "DELEGATED",
    leaderTitleKeywords: [
      "Trưởng phòng", "Phó Trưởng phòng",
      "Chi cục trưởng", "Phó Chi cục trưởng",
    ],
    staffTitleKeywords: [
      "Chuyên viên", "Chuyên viên chính", "Chuyên viên cao cấp",
      "Kiểm soát viên", "Kiểm định viên",
    ],
    staffingPattern: "DEPT_UNIT",
    requiredFields: ["domainIds", "geographicAreaIds"],
    signingNote: "Tham mưu và thực thi chuyên ngành. Chi cục có thể ký một số loại văn bản theo thẩm quyền được phân cấp cụ thể.",
    purposeNote: "Quản lý chuyên môn theo ngành dọc; thực hiện thanh tra, kiểm tra, hướng dẫn nghiệp vụ.",
  },

  SU_NGHIEP: {
    code: "SU_NGHIEP",
    politicalSystem: "SU_NGHIEP",
    signingAuthority: "FULL",
    leaderTitleKeywords: [
      "Giám đốc", "Phó Giám đốc",
      "Hiệu trưởng", "Phó Hiệu trưởng",
      "Trưởng ban", "Phó Trưởng ban",
    ],
    staffTitleKeywords: [
      "Viên chức", "Giáo viên", "Bác sĩ", "Điều dưỡng", "Kỹ sư",
      "Giảng viên", "Nghiên cứu viên",
    ],
    staffingPattern: "SERVICE_ORG",
    requiredFields: ["domainIds", "scope"],
    signingNote: "Ký hợp đồng dịch vụ, văn bản quản lý nội bộ đơn vị. Vượt thẩm quyền phải trình cơ quan chủ quản (Sở).",
    purposeNote: "Cung cấp dịch vụ công theo cơ chế tự chủ (toàn phần hoặc một phần). Hoạt động theo Luật Viên chức.",
  },

  PHONG_THUOC_SN: {
    code: "PHONG_THUOC_SN",
    politicalSystem: "SU_NGHIEP",
    signingAuthority: "INTERNAL",
    leaderTitleKeywords: [
      "Trưởng phòng", "Phó Trưởng phòng",
      "Tổ trưởng", "Tổ phó",
    ],
    staffTitleKeywords: [
      "Viên chức", "Nhân viên", "Kỹ thuật viên", "Y tá", "Hộ lý",
    ],
    staffingPattern: "SUB_TEAM",
    requiredFields: ["domainIds"],
    signingNote: "Không ký văn bản đối ngoại. Mọi trao đổi ra ngoài đơn vị phải qua Giám đốc/Hiệu trưởng.",
    purposeNote: "Thực hiện chức năng chuyên môn nội bộ trong đơn vị sự nghiệp. Không có tư cách pháp nhân độc lập.",
  },
};

// ============================================================================
// UTILS
// ============================================================================

export function getUnitCategoryConfig(code: string): UnitCategoryConfig | undefined {
  return UNIT_CATEGORY_TAXONOMY[code as UnitCategoryCode];
}

export function isValidCategoryCode(code: string): code is UnitCategoryCode {
  return code in UNIT_CATEGORY_TAXONOMY;
}

/** Label ngắn gọn cho quyền ký */
export const SIGNING_AUTHORITY_LABEL: Record<SigningAuthority, { label: string; color: string }> = {
  FULL:      { label: "Ký đối ngoại",   color: "emerald" },
  DELEGATED: { label: "Ký ủy quyền",    color: "amber" },
  INTERNAL:  { label: "Nội bộ",         color: "slate" },
};

/** Label ngắn gọn cho hệ thống chính trị */
export const POLITICAL_SYSTEM_LABEL: Record<PoliticalSystem, { label: string; color: string }> = {
  HANH_CHINH: { label: "Hành chính NN",  color: "blue" },
  DANG:       { label: "Tổ chức Đảng",   color: "red" },
  SU_NGHIEP:  { label: "Sự nghiệp CL",  color: "amber" },
};

export const UNIT_CATEGORY_CODES: UnitCategoryCode[] = [
  "CHINH_QUYEN", "DANG", "THAM_MUU", "CHUYEN_MON", "SU_NGHIEP", "PHONG_THUOC_SN",
];
