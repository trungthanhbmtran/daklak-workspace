import { ColumnType, AggregateFunction } from '../types';

export const FIELD_LABEL_MAP: Record<string, string> = {
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
  creator: 'Người tạo',
  description: 'Mô tả chi tiết',
  email: 'Email',
  phone: 'Số điện thoại',
  docId: 'Mã văn bản',
  taskId: 'Mã nhiệm vụ',
  postId: 'Mã bài viết',
  targetCode: 'Mã đối tượng',
  cadreCode: 'Mã cán bộ',
  jobTitle: 'Vị trí việc làm (VTVL)',
  sChung: 'Điểm chung (30đ)',
  sNhiemVu: 'Điểm nhiệm vụ (70đ)',
  sTong: 'Tổng điểm (100đ)',
  proposedRank: 'Xếp loại đề xuất (Mẫu 02/03)',
  approvedRank: 'Xếp loại phê duyệt (Mẫu 05)',
  hasMau04: 'Mẫu 04 (Nổi trội)',
  sopStep: 'Tiến trình SOP',
  quarterYear: 'Kỳ đánh giá',
  // Thống kê văn bản & Liên thông API
  totalDocuments: 'Tổng số văn bản',
  incomingDocuments: 'Văn bản đến',
  outgoingDocuments: 'Văn bản đi',
  processedDocuments: 'Đã xử lý',
  pendingDocuments: 'Đang xử lý',
  completionRate: 'Tỷ lệ hoàn thành (%)',
  reportPeriod: 'Kỳ báo cáo',
  // IOC Tài chính & Kinh tế xã hội
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

export const STATUS_LABEL_MAP: Record<string, string> = {
  TODO: 'Chờ thực hiện',
  IN_PROGRESS: 'Đang thực hiện',
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
  PROCESSING: 'Đang xử lý',
  NORMAL: 'Bình thường',
  HIGH: 'Ưu tiên cao',
  URGENT: 'Khẩn cấp',
  LOW: 'Ưu tiên thấp',
};

export function translateStatus(status: string | null | undefined): string {
  return status != null && status !== '' ? String(status) : '—';
}

export function getStatusBadgeCls(status: string | null | undefined): string {
  if (!status) return 'text-slate-600 bg-slate-50 border-slate-200';
  const upper = String(status).trim().toUpperCase();
  switch (upper) {
    case 'COMPLETED':
    case 'DONE':
    case 'PUBLISHED':
    case 'ĐÃ HOÀN THÀNH':
    case 'HOÀN THÀNH':
      return 'text-emerald-700 bg-emerald-50 border-emerald-200';
    case 'IN_PROGRESS':
    case 'PROCESSING':
    case 'ĐANG THỰC HIỆN':
    case 'ĐANG XỬ LÝ':
      return 'text-blue-700 bg-blue-50 border-blue-200';
    case 'PENDING_ACCEPTANCE':
    case 'CHỜ TIẾP NHẬN':
      return 'text-amber-700 bg-amber-50 border-amber-200';
    case 'PENDING_APPROVAL':
    case 'CHỜ PHÊ DUYỆT':
      return 'text-purple-700 bg-purple-50 border-purple-200';
    case 'TODO':
    case 'CHỜ THỰC HIỆN':
      return 'text-slate-700 bg-slate-100 border-slate-300';
    case 'CANCELLED':
    case 'REJECTED':
    case 'ĐÃ HỦY':
    case 'TỪ CHỐI':
      return 'text-rose-700 bg-rose-50 border-rose-200';
    default:
      return 'text-slate-600 bg-slate-50 border-slate-200';
  }
}

export function getFriendlyFieldLabel(field: string): string {
  if (!field) return '';
  if (FIELD_LABEL_MAP[field]) return FIELD_LABEL_MAP[field];

  const words = field
    .replace(/_/g, ' ')
    .replace(/([a-z])([A-Z])/g, '$1 $2')
    .toLowerCase();

  return words.charAt(0).toUpperCase() + words.slice(1);
}

export function inferFieldType(field: string): ColumnType {
  const lower = (field || '').toLowerCase();
  if (
    lower.includes('count') ||
    lower.includes('score') ||
    lower.includes('hours') ||
    lower.includes('amount') ||
    lower.includes('total') ||
    lower.includes('progress') ||
    lower.includes('rate') ||
    lower.includes('price') ||
    lower.includes('quantity') ||
    lower === 'id' ||
    lower.endsWith('id')
  ) {
    if (lower.endsWith('id') || lower === 'id') return 'string';
    return 'number';
  }
  if (
    lower.startsWith('is') ||
    lower.startsWith('has') ||
    lower.includes('active') ||
    lower.includes('enabled')
  ) {
    return 'boolean';
  }
  return 'string';
}

export const AGGREGATE_OPTIONS: Array<{ value: AggregateFunction; label: string; short: string }> = [
  { value: 'none', label: 'Nguyên bản (Không tính toán)', short: 'None' },
  { value: 'count', label: 'Đếm số lượng (COUNT)', short: 'COUNT' },
  { value: 'sum', label: 'Tính tổng cộng (SUM)', short: 'SUM' },
  { value: 'avg', label: 'Trung bình cộng (AVG)', short: 'AVG' },
  { value: 'min', label: 'Giá trị nhỏ nhất (MIN)', short: 'MIN' },
  { value: 'max', label: 'Giá trị lớn nhất (MAX)', short: 'MAX' },
];

export const TYPE_OPTIONS: Array<{ value: ColumnType; label: string }> = [
  { value: 'string', label: 'Chuỗi văn bản (String)' },
  { value: 'number', label: 'Số học (Number)' },
  { value: 'boolean', label: 'Đúng / Sai (Boolean)' },
  { value: 'mixed', label: 'Đa hình (Mixed)' },
];

const CP1252_REVERSE_MAP: Record<string, number> = {
  '\u20AC': 0x80, '\u201A': 0x82, '\u0192': 0x83, '\u201E': 0x84, '\u2026': 0x85, '\u2020': 0x86, '\u2021': 0x87,
  '\u02C6': 0x88, '\u2030': 0x89, '\u0160': 0x8A, '\u2039': 0x8B, '\u0152': 0x8C, '\u017D': 0x8E,
  '\u2018': 0x91, '\u2019': 0x92, '\u201C': 0x93, '\u201D': 0x94, '\u2022': 0x95, '\u2013': 0x96, '\u2014': 0x97,
  '\u02DC': 0x98, '\u2122': 0x99, '\u0161': 0x9A, '\u203A': 0x9B, '\u0153': 0x9C, '\u017E': 0x9E, '\u0178': 0x9F,
};

/**
 * Tự động sửa lỗi font chữ UTF-8 bị chuyển mã nhầm (CP1252/Latin-1 Mojibake)
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
    const uint8 = new Uint8Array(bytes);
    const decoded = new TextDecoder('utf-8', { fatal: false }).decode(uint8);
    if (!decoded.includes('\uFFFD')) {
      return decoded;
    }
  } catch {
    // Giữ nguyên chuỗi nếu decode lỗi
  }
  return str;
}

const SHORT_CHART_LABELS: Record<string, string> = {
  'Ban Tổ chức Tỉnh ủy Đắk Lắk': 'Ban Tổ chức TU',
  'Ban Tuyên giáo Tỉnh ủy Đắk Lắk': 'Ban Tuyên giáo TU',
  'Cơ quan Ủy ban Kiểm tra Tỉnh ủy': 'UBKT Tỉnh ủy',
  'Sở Khoa học và Công nghệ Đắk Lắk': 'Sở KH&CN',
  'Sở Tài chính Đắk Lắk': 'Sở Tài chính',
  'Văn phòng UBND Tỉnh Đắk Lắk': 'VP UBND Tỉnh',
  'UBND TP. Buôn Ma Thuột': 'TP. Buôn Ma Thuột',
  'UBND Huyện Krông Pắc': 'Huyện Krông Pắc',
  'Phòng Quản lý Công nghệ & Đổi mới sáng tạo': 'Phòng QL Công nghệ',
  'Phòng Chính sách - Đào tạo cán bộ': 'Phòng CS-ĐT-CB',
  'Chi cục Tiêu chuẩn Đo lường Chất lượng': 'Chi cục TC-ĐL-CL',
  'Phòng Lý luận chính trị & Lịch sử Đảng': 'Phòng LLCT & LS Đảng',
  'Phòng Tài chính Hành chính Sự nghiệp': 'Phòng TCHCSN',
  'Phòng Quản lý Ngân sách': 'Phòng QL Ngân sách',
  'Phòng Kinh tế TP. Buôn Ma Thuột': 'Phòng Kinh tế TP',
  'Phòng Nội vụ TP. Buôn Ma Thuột': 'Phòng Nội vụ TP',
  'Thường trực UBND Thành phố': 'TT UBND Thành phố',
  'Thường trực UBKT Tỉnh ủy': 'TT UBKT Tỉnh ủy',
  'Thường trực UBND Huyện Krông Pắc': 'TT UBND Huyện',
  'Phòng Tổ chức cán bộ': 'Phòng TCCB',
  'Phòng Tổ chức đảng - Đảng viên': 'Phòng TCĐ-ĐV',
  'Văn phòng Ban': 'Văn phòng Ban',
  'Lãnh đạo Ban': 'Lãnh đạo Ban',
};

/**
 * Trả về tên hiển thị ngắn gọn, tối ưu độ hiển thị cho trục tọa độ biểu đồ
 */
export function getShortChartLabel(label: string): string {
  const clean = fixMojibake(label);
  if (!clean) return '';
  return SHORT_CHART_LABELS[clean] || clean;
}
