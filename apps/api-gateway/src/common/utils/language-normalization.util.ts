/**
 * Central Language Normalization Utility (API Gateway)
 *
 * Chịu trách nhiệm chuyển đổi và đính kèm nhãn Tiếng Việt chuẩn hành chính công
 * cho toàn bộ các đối tượng dữ liệu từ các microservices (HRM, Documents, Posts, Workflow, User)
 * trước khi gửi về cho Frontend hiển thị.
 */

export const TASK_STATUS_VIETNAMESE_MAP: Record<string, string> = {
  TEMPLATE: 'Chờ giao',
  TODO: 'Chờ thực hiện',
  PENDING_ACCEPTANCE: 'Chờ tiếp nhận',
  PENDING_APPROVAL: 'Chờ phê duyệt',
  IN_PROGRESS: 'Đang thực hiện',
  PROCESSING: 'Đang thực hiện',
  REVIEWING: 'Chờ duyệt',
  DONE: 'Hoàn thành',
  COMPLETED: 'Đã hoàn thành',
  OVERDUE: 'Quá hạn',
  RETURNED: 'Trả lại',
  REJECTED: 'Đã từ chối',
  CANCELLED: 'Đã hủy',
  CANCELED: 'Đã hủy',
  UNASSIGNED: 'Chờ phân công',
};

export const DOCUMENT_STATUS_VIETNAMESE_MAP: Record<string, string> = {
  DRAFT: 'Dự thảo',
  RECEIVED: 'Đã tiếp nhận',
  PROCESSING: 'Đang xử lý',
  PENDING_APPROVAL: 'Chờ phê duyệt',
  PUBLISHED: 'Đã ban hành',
  RESOLVED: 'Đã giải quyết',
  RETURNED: 'Trả lại',
  OVERDUE: 'Quá hạn',
  ARCHIVED: 'Lưu trữ',
};

export const POST_STATUS_VIETNAMESE_MAP: Record<string, string> = {
  DRAFT: 'Bản nháp',
  SUBMITTED: 'Đã gửi duyệt',
  UNDER_REVIEW: 'Đang kiểm duyệt',
  PENDING_APPROVAL: 'Chờ phê duyệt',
  APPROVED: 'Đã phê duyệt',
  PUBLISHED: 'Đã xuất bản',
  UNPUBLISHED: 'Hạ bài',
  ARCHIVED: 'Lưu trữ',
  REJECTED: 'Đã từ chối',
};

export const WORKFLOW_STATUS_VIETNAMESE_MAP: Record<string, string> = {
  DRAFT: 'Bản nháp',
  ACTIVE: 'Đang hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  COMPLETED: 'Đã hoàn thành',
  RUNNING: 'Đang chạy',
  SUSPENDED: 'Tạm dừng',
  FAILED: 'Thất bại',
  CANCELLED: 'Đã hủy',
};

export const USER_STATUS_VIETNAMESE_MAP: Record<string, string> = {
  ACTIVE: 'Hoạt động',
  INACTIVE: 'Ngừng hoạt động',
  SUSPENDED: 'Tạm khóa',
  LOCKED: 'Đã khóa',
  PENDING: 'Chờ kích hoạt',
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
  FLASH: 'Hỏa tốc',
  EXPRESS: 'Hỏa tốc',
};

export const SECURITY_VIETNAMESE_MAP: Record<string, string> = {
  NORMAL: 'Thường',
  CONFIDENTIAL: 'Mật',
  SECRET: 'Tối mật',
  TOP_SECRET: 'Tuyệt mật',
};

export function getTaskStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const upper = String(status).trim().toUpperCase();
  return TASK_STATUS_VIETNAMESE_MAP[upper] || String(status);
}

export function getDocumentStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const upper = String(status).trim().toUpperCase();
  return DOCUMENT_STATUS_VIETNAMESE_MAP[upper] || String(status);
}

export function getPostStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const upper = String(status).trim().toUpperCase();
  return POST_STATUS_VIETNAMESE_MAP[upper] || String(status);
}

export function getWorkflowStatusLabel(status: string | null | undefined): string {
  if (!status) return '—';
  const upper = String(status).trim().toUpperCase();
  return WORKFLOW_STATUS_VIETNAMESE_MAP[upper] || String(status);
}

export function getPriorityLabel(priority: string | null | undefined): string {
  if (!priority) return '—';
  const upper = String(priority).trim().toUpperCase();
  return PRIORITY_VIETNAMESE_MAP[upper] || String(priority);
}

export function getUrgencyLabel(urgency: string | null | undefined): string {
  if (!urgency) return 'Bình thường';
  const upper = String(urgency).trim().toUpperCase();
  return URGENCY_VIETNAMESE_MAP[upper] || String(urgency);
}

export function getSecurityLevelLabel(sec: string | null | undefined): string {
  if (!sec) return 'Thường';
  const upper = String(sec).trim().toUpperCase();
  return SECURITY_VIETNAMESE_MAP[upper] || String(sec);
}

/**
 * Chuẩn hóa một bản ghi nhiệm vụ (Task)
 */
export function normalizeTask<T extends Record<string, any>>(task: T): T {
  if (!task || typeof task !== 'object') return task;
  const target = task as Record<string, any>;
  const statusLabel = getTaskStatusLabel(target.statusLabel || target.status);
  const priorityLabel = getPriorityLabel(target.priorityLabel || target.priority);
  target.statusLabel = statusLabel;
  target.priorityLabel = priorityLabel;
  if (Array.isArray(target.children)) {
    target.children = target.children.map(normalizeTask);
  }
  if (Array.isArray(target.subTasks)) {
    target.subTasks = target.subTasks.map(normalizeTask);
  }
  return target as T;
}

/**
 * Chuẩn hóa một bản ghi văn bản (Document)
 */
export function normalizeDocument<T extends Record<string, any>>(doc: T): T {
  if (!doc || typeof doc !== 'object') return doc;
  return {
    ...doc,
    statusLabel: getDocumentStatusLabel(doc.status),
    urgencyLabel: getUrgencyLabel(doc.urgency),
    securityLevelLabel: getSecurityLevelLabel(doc.securityLevel),
  };
}

/**
 * Chuẩn hóa một bản ghi bài viết (Post)
 */
export function normalizePost<T extends Record<string, any>>(post: T): T {
  if (!post || typeof post !== 'object') return post;
  return {
    ...post,
    statusLabel: getPostStatusLabel(post.status),
  };
}

/**
 * Chuẩn hóa một bản ghi quy trình (Workflow)
 */
export function normalizeWorkflow<T extends Record<string, any>>(wf: T): T {
  if (!wf || typeof wf !== 'object') return wf;
  return {
    ...wf,
    statusLabel: getWorkflowStatusLabel(wf.status),
  };
}

/**
 * Chuẩn hóa danh sách mảng dữ liệu hoặc object đơn lẻ
 */
export function normalizeResponsePayload(payload: any, type: 'task' | 'document' | 'post' | 'workflow' = 'task'): any {
  if (!payload) return payload;

  const normalizer =
    type === 'task'
      ? normalizeTask
      : type === 'document'
      ? normalizeDocument
      : type === 'post'
      ? normalizePost
      : normalizeWorkflow;

  if (Array.isArray(payload)) {
    return payload.map(normalizer);
  }

  if (payload.data && Array.isArray(payload.data)) {
    return {
      ...payload,
      data: payload.data.map(normalizer),
    };
  }

  if (payload.items && Array.isArray(payload.items)) {
    return {
      ...payload,
      items: payload.items.map(normalizer),
    };
  }

  if (typeof payload === 'object') {
    return normalizer(payload);
  }

  return payload;
}

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
 * Bộ từ điển đồng nghĩa (Synonyms) phục vụ tìm kiếm chéo giữa mã tiếng Anh và tiếng Việt
 */
export const STATUS_CROSS_TERMS: Array<{ code: string; vi: string; viNoTone: string }> = [
  { code: 'todo', vi: 'chờ thực hiện', viNoTone: 'cho thuc hien' },
  { code: 'in_progress', vi: 'đang thực hiện', viNoTone: 'dang thuc hien' },
  { code: 'processing', vi: 'đang thực hiện', viNoTone: 'dang thuc hien' },
  { code: 'pending_acceptance', vi: 'chờ tiếp nhận', viNoTone: 'cho tiep nhan' },
  { code: 'pending_approval', vi: 'chờ phê duyệt', viNoTone: 'cho phe duyet' },
  { code: 'reviewing', vi: 'chờ duyệt', viNoTone: 'cho duyet' },
  { code: 'completed', vi: 'đã hoàn thành', viNoTone: 'da hoan thanh' },
  { code: 'done', vi: 'đã hoàn thành', viNoTone: 'da hoan thanh' },
  { code: 'overdue', vi: 'quá hạn', viNoTone: 'qua han' },
  { code: 'returned', vi: 'trả lại', viNoTone: 'tra lai' },
  { code: 'rejected', vi: 'đã từ chối', viNoTone: 'da tu choi' },
  { code: 'cancelled', vi: 'đã hủy', viNoTone: 'da huy' },
  { code: 'draft', vi: 'bản nháp', viNoTone: 'ban nhap' },
  { code: 'published', vi: 'đã xuất bản', viNoTone: 'da xuat ban' },
  { code: 'received', vi: 'đã tiếp nhận', viNoTone: 'da tiep nhan' },
  { code: 'archived', vi: 'lưu trữ', viNoTone: 'luu tru' },
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

  for (const val of Object.values(item)) {
    if (val == null) continue;
    if (typeof val === 'object') continue;
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

/**
 * Lọc danh sách bản ghi theo từ khóa tìm kiếm thông minh
 */
export function filterBySearchQuery<T>(items: T[], query: string): T[] {
  if (!query || !query.trim()) return items;
  return items.filter((item) => matchSearchQuery(item, query));
}

/**
 * Chuyển đổi một input trạng thái nhiệm vụ (có thể là tiếng Việt hoặc tiếng Anh)
 * sang mã chuẩn database.
 */
export function resolveTaskStatusCodes(input: string | null | undefined): string[] {
  if (!input || input === 'ALL') return [];
  const normalized = removeVietnameseTones(input).toLowerCase().trim();
  const results: string[] = [];

  for (const [code, vi] of Object.entries(TASK_STATUS_VIETNAMESE_MAP)) {
    const codeNorm = code.toLowerCase();
    const viNorm = removeVietnameseTones(vi).toLowerCase();
    if (codeNorm === normalized || viNorm === normalized) {
      results.push(code);
    }
  }

  if (results.length === 0) {
    results.push(input.toUpperCase().trim());
  }

  return Array.from(new Set(results));
}

