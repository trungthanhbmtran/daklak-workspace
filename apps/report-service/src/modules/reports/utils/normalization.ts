/**
 * Module Chuẩn hóa Tiếng Việt & Đa ngôn ngữ (Server-side Normalization & Search Engine)
 *
 * Chịu trách nhiệm:
 * 1. Chuyển đổi toàn diện các mã (codes), trạng thái (statuses), mức độ ưu tiên (priorities),
 *    nhãn cột (field labels) cũ sang Tiếng Việt chuẩn hành chính công.
 * 2. Cung cấp bộ máy tìm kiếm thông minh đồng nhất trên backend: không phân biệt hoa thường,
 *    không phân biệt dấu tiếng Việt (accent-insensitive), nhận diện cả mã tiếng Anh và tiếng Việt.
 */

export const STATUS_VIETNAMESE_MAP: Record<string, string> = {
  TODO: 'Chờ thực hiện',
  IN_PROGRESS: 'Đang thực hiện',
  PROCESSING: 'Đang thực hiện',
  PENDING_ACCEPTANCE: 'Chờ tiếp nhận',
  PENDING_APPROVAL: 'Chờ phê duyệt',
  PENDING_REVIEW: 'Chờ duyệt',
  REVIEWING: 'Chờ duyệt',
  COMPLETED: 'Đã hoàn thành',
  DONE: 'Đã hoàn thành',
  CANCELLED: 'Đã hủy',
  REJECTED: 'Đã từ chối',
  DRAFT: 'Bản nháp',
  ASSIGNED: 'Đã phân công',
  PUBLISHED: 'Đã xuất bản',
  SUBMITTED: 'Đã gửi duyệt',
  APPROVED: 'Đã phê duyệt',
  ARCHIVED: 'Đã lưu trữ',
};

export const PRIORITY_VIETNAMESE_MAP: Record<string, string> = {
  LOW: 'Ưu tiên thấp',
  NORMAL: 'Bình thường',
  MEDIUM: 'Bình thường',
  HIGH: 'Ưu tiên cao',
  URGENT: 'Khẩn cấp',
};

export const URGENCY_VIETNAMESE_MAP: Record<string, string> = {
  NORMAL: 'Bình thường',
  URGENT: 'Khẩn',
  EXPRESS: 'Hỏa tốc',
  VERY_URGENT: 'Thượng khẩn',
};

export const SECURITY_VIETNAMESE_MAP: Record<string, string> = {
  NORMAL: 'Thường',
  CONFIDENTIAL: 'Mật',
  SECRET: 'Tối mật',
  TOP_SECRET: 'Tuyệt mật',
};

export const FIELD_LABEL_VIETNAMESE_MAP: Record<string, string> = {
  id: 'Mã định danh',
  code: 'Mã hiệu',
  name: 'Tên / Tiêu đề',
  title: 'Tiêu đề',
  employeeName: 'Họ và tên',
  departmentName: 'Phòng ban',
  departmentId: 'Mã phòng ban',
  taskCount: 'Tổng nhiệm vụ',
  completedCount: 'Đã hoàn thành',
  inProgressCount: 'Đang thực hiện',
  pendingCount: 'Chờ xử lý',
  qualityScore: 'Điểm chất lượng (100)',
  ranking: 'Xếp loại thi đua',
  status: 'Trạng thái',
  createdAt: 'Ngày tạo',
  updatedAt: 'Ngày cập nhật',
  hours: 'Số giờ làm việc',
  issueDate: 'Ngày ban hành',
  type: 'Phân loại',
  progress: 'Tiến độ (%)',
  viewCount: 'Lượt xem',
  likeCount: 'Lượt thích',
  shareCount: 'Lượt chia sẻ',
  commentCount: 'Lượt bình luận',
  priority: 'Mức độ ưu tiên',
  assignee: 'Người thực hiện',
  assigneeName: 'Người thực hiện',
  assigneeCode: 'Mã người thực hiện',
  creator: 'Người tạo',
  description: 'Mô tả chi tiết',
  email: 'Email',
  phone: 'Số điện thoại',
  docId: 'Mã văn bản',
  taskId: 'Mã nhiệm vụ',
  postId: 'Mã bài viết',
  targetCode: 'Mã đối tượng',
  dueDate: 'Hạn hoàn thành',
  isOverdue: 'Trạng thái hạn',
  isCompleted: 'Tình trạng thực hiện',
  documentNumber: 'Số hiệu văn bản',
  abstract: 'Trích yếu',
  isIncoming: 'Hình thức văn bản',
  urgency: 'Độ khẩn',
  securityLevel: 'Độ mật',
  pageCount: 'Số trang',
  isLate: 'Tiến độ xử lý',
  categoryName: 'Chuyên mục',
  authorName: 'Tác giả',
  isFeatured: 'Nổi bật',
  publishedDate: 'Ngày xuất bản',
  totalScore: 'Tổng điểm',
  periodId: 'Kỳ đánh giá',
  // Các trường API Liên thông & Thống kê văn bản (Document Statistics)
  totalDocuments: 'Tổng số văn bản',
  incomingDocuments: 'Văn bản đến',
  outgoingDocuments: 'Văn bản đi',
  processedDocuments: 'Đã xử lý',
  pendingDocuments: 'Đang xử lý',
  completionRate: 'Tỷ lệ hoàn thành (%)',
  reportPeriod: 'Kỳ báo cáo',
  // Các trường API IOC Tài chính & Kinh tế xã hội
  thang_bc: 'Tháng báo cáo',
  loai_hinh: 'Loại hình xuất nhập khẩu',
  kim_ngach_usd: 'Kim ngạch (USD)',
  thue_xnk_vnd: 'Thuế XNK (VNĐ)',
  dia_ban: 'Địa bàn / Huyện thị',
  ghi_chu: 'Ghi chú',
  du_toan_nam: 'Dự toán năm (VNĐ)',
  so_thuc_thu: 'Số thực thu (VNĐ)',
  tien_do_dat: 'Tiến độ đạt (%)',
  linh_vuc_chi: 'Lĩnh vực chi',
  du_toan_giao: 'Dự toán giao (VNĐ)',
  so_da_chi: 'Số đã chi (VNĐ)',
  ty_le_giai_ngan: 'Tỷ lệ giải ngân (%)',
  ten_du_an: 'Tên dự án',
  chu_dau_tu: 'Chủ đầu tư',
  ke_hoach_von: 'Kế hoạch vốn (VNĐ)',
  da_giai_ngan: 'Đã giải ngân (VNĐ)',
  ty_le_dat: 'Tỷ lệ đạt (%)',
  tuan_bao_cao: 'Tuần báo cáo',
  loai_hinh_dn: 'Loại hình doanh nghiệp',
  so_thanh_lap_moi: 'Số thành lập mới',
  so_giai_the: 'Số giải thể',
  tong_von_dang_ky_ty: 'Tổng vốn đăng ký (Tỷ VNĐ)',
  thoi_diem: 'Thời điểm',
  huyen_thi_xa: 'Huyện / Thị xã / TP',
  so_htx_hoat_dong: 'Số HTX hoạt động',
  so_thanh_vien: 'Số thành viên',
  doanh_thu_tb_trieu: 'Doanh thu TB (Triệu VNĐ)',
  nam: 'Năm',
  so_du_an_moi: 'Số dự án mới',
  von_ngoai_ns_ty: 'Vốn ngoài NS (Tỷ VNĐ)',
  tien_do_trien_khai: 'Tiến độ triển khai',
};

/**
 * Loại bỏ dấu tiếng Việt chuẩn để tìm kiếm không phụ thuộc dấu (accent-insensitive)
 */
export function removeVietnameseTones(str: string): string {
  if (!str) return '';
  return str
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .trim();
}

/**
 * Lấy nhãn tiếng Việt thân thiện cho trường dữ liệu
 */
export function getFriendlyFieldLabel(field: string): string {
  if (!field) return '';
  if (FIELD_LABEL_VIETNAMESE_MAP[field]) {
    return FIELD_LABEL_VIETNAMESE_MAP[field];
  }
  const words = field
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();
  return words.charAt(0).toUpperCase() + words.slice(1);
}

/**
 * Chuyển đổi mã trạng thái sang tiếng Việt chuẩn
 */
export function translateStatus(status: string | null | undefined): string {
  if (!status) return '—';
  const raw = String(status).trim();
  const upper = raw.toUpperCase();
  return STATUS_VIETNAMESE_MAP[upper] || raw;
}

/**
 * Chuyển đổi mức độ ưu tiên sang tiếng Việt chuẩn
 */
export function translatePriority(priority: string | null | undefined): string {
  if (!priority) return '—';
  const raw = String(priority).trim();
  const upper = raw.toUpperCase();
  return PRIORITY_VIETNAMESE_MAP[upper] || raw;
}

const CP1252_REVERSE_MAP: Record<string, number> = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87,
  '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E,
  '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F,
};

/**
 * Tự động khắc phục lỗi font chữ / mojibake UTF-8 bị chuyển mã nhầm qua CP1252/Latin-1
 */
export function fixMojibake(str: string): string {
  if (typeof str !== 'string' || !str) return str;
  if (!/[\u00C0-\u00FF\u0152\u0153\u0160\u0161\u0178\u017D\u017E\u0192\u02C6\u02DC\u2013\u2014\u2018\u2019\u201A\u201C\u201D\u201E\u2020\u2021\u2022\u2026\u2030\u2039\u203A\u20AC\u2122]/.test(str)) {
    return str;
  }
  const bytes: number[] = [];
  for (let i = 0; i < str.length; i++) {
    const ch = str[i];
    if (CP1252_REVERSE_MAP[ch] !== undefined) {
      bytes.push(CP1252_REVERSE_MAP[ch]);
    } else {
      const code = str.charCodeAt(i);
      if (code <= 0xff) {
        bytes.push(code);
      } else {
        return str;
      }
    }
  }
  try {
    const decoded = Buffer.from(bytes).toString('utf8');
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch {
    // Return original on error
  }
  return str;
}

/**
 * Chuẩn hóa một dòng dữ liệu (chuyển đổi toàn bộ code tiếng Anh sang tiếng Việt chuẩn và tự động sửa lỗi font chữ)
 */
export function normalizeRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const out: any = {};

  for (const [k, v] of Object.entries(row)) {
    if (typeof v === 'string') {
      out[k] = fixMojibake(v);
    } else {
      out[k] = v;
    }
  }

  if (out.status != null) {
    out.status = translateStatus(out.status);
  }
  if (out.priority != null) {
    out.priority = translatePriority(out.priority);
  }
  if (out.urgency != null) {
    const raw = String(out.urgency).trim().toUpperCase();
    out.urgency = URGENCY_VIETNAMESE_MAP[raw] || out.urgency;
  }
  if (out.securityLevel != null) {
    const raw = String(out.securityLevel).trim().toUpperCase();
    out.securityLevel = SECURITY_VIETNAMESE_MAP[raw] || out.securityLevel;
  }

  return out;
}

/**
 * Chuẩn hóa schema báo cáo, đảm bảo 100% cột có nhãn tiếng Việt thân thiện
 */
export function normalizeSchema(
  schema: Array<{ key: string; label?: string; type?: string }> = [],
): Array<{ key: string; label: string; type: string }> {
  if (!Array.isArray(schema)) return [];
  return schema.map((col) => ({
    key: col.key,
    label:
      col.label && col.label !== col.key
        ? col.label
        : getFriendlyFieldLabel(col.key),
    type: col.type || 'string',
  }));
}

/**
 * Bộ từ điển đồng nghĩa (Synonyms) phục vụ tìm kiếm chéo giữa mã tiếng Anh và tiếng Việt
 */
const STATUS_CROSS_TERMS: Array<{ code: string; vi: string; viNoTone: string }> = [
  { code: 'todo', vi: 'chờ thực hiện', viNoTone: 'cho thuc hien' },
  { code: 'in_progress', vi: 'đang thực hiện', viNoTone: 'dang thuc hien' },
  { code: 'processing', vi: 'đang thực hiện', viNoTone: 'dang thuc hien' },
  { code: 'pending_acceptance', vi: 'chờ tiếp nhận', viNoTone: 'cho tiep nhan' },
  { code: 'pending_approval', vi: 'chờ phê duyệt', viNoTone: 'cho phe duyet' },
  { code: 'pending_review', vi: 'chờ duyệt', viNoTone: 'cho duyet' },
  { code: 'reviewing', vi: 'chờ duyệt', viNoTone: 'cho duyet' },
  { code: 'completed', vi: 'đã hoàn thành', viNoTone: 'da hoan thanh' },
  { code: 'done', vi: 'đã hoàn thành', viNoTone: 'da hoan thanh' },
  { code: 'cancelled', vi: 'đã hủy', viNoTone: 'da huy' },
  { code: 'rejected', vi: 'đã từ chối', viNoTone: 'da tu choi' },
  { code: 'draft', vi: 'bản nháp', viNoTone: 'ban nhap' },
  { code: 'published', vi: 'đã xuất bản', viNoTone: 'da xuat ban' },
];

/**
 * Kiểm tra xem một đối tượng bản ghi có khớp với từ khóa tìm kiếm hay không.
 * Hỗ trợ đồng nhất:
 * - Tiếng Việt có dấu ("Chờ thực hiện", "Hoàn thành")
 * - Tiếng Việt không dấu ("cho thuc hien", "hoan thanh", "du lieu", "ioc")
 * - Mã tiếng Anh tương ứng ("todo", "in_progress", "done", "completed")
 * - Không phân biệt hoa/thường (case-insensitive)
 */
export function matchSearchQuery(item: any, query: string): boolean {
  if (!query || !query.trim()) return true;
  if (!item || typeof item !== 'object') return false;

  const qRaw = query.trim().toLowerCase();
  const qNoTone = removeVietnameseTones(qRaw).toLowerCase();

  // Tìm danh sách từ khóa tương đương (ví dụ nếu gõ 'todo' -> thêm 'chờ thực hiện', 'cho thuc hien')
  const expandedTerms = new Set<string>([qRaw, qNoTone]);

  for (const cross of STATUS_CROSS_TERMS) {
    if (
      cross.code.includes(qRaw) ||
      cross.vi.includes(qRaw) ||
      cross.viNoTone.includes(qNoTone)
    ) {
      expandedTerms.add(cross.code);
      expandedTerms.add(cross.vi);
      expandedTerms.add(cross.viNoTone);
    }
  }

  // Duyệt qua tất cả các trường dữ liệu của bản ghi
  for (const val of Object.values(item)) {
    if (val == null) continue;
    const strVal = String(val).toLowerCase();
    const strValNoTone = removeVietnameseTones(strVal).toLowerCase();

    for (const term of expandedTerms) {
      if (strVal.includes(term) || strValNoTone.includes(term)) {
        return true;
      }
    }
  }

  return false;
}
