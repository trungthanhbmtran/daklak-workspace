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
};

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
