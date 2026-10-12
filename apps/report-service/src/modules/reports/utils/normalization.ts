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

/**
 * Chuẩn hóa một dòng dữ liệu (chuyển đổi toàn bộ code tiếng Anh sang tiếng Việt chuẩn)
 */
export function normalizeRow(row: any): any {
  if (!row || typeof row !== 'object') return row;
  const out = { ...row };

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
