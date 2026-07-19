/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

/**
 * Lấy map code → name từ danh mục dùng chung.
 * staleTime = 5 phút (cache tốt vì danh mục ít thay đổi).
 */
export function useCategoryMap(group: string): Record<string, string> {
  const { data }: any = useGetCategoryByGroup(group);
  const items: { code: string; name: string }[] = data?.data || data || [];
  return Object.fromEntries(items.map((c: any) => [c.code, c.name]));
}

/**
 * Trạng thái công việc (TASK_STATUS)
 * Fallback sang label tiếng Việt nếu danh mục chưa load.
 */
export const TASK_STATUS_FALLBACK: Record<string, string> = {
  TEMPLATE:         'Chờ giao',
  TODO:             'Chờ thực hiện',
  IN_PROGRESS:      'Đang thực hiện',
  PENDING_APPROVAL: 'Chờ nghiệm thu',
  DONE:             'Hoàn thành',
  OVERDUE:          'Quá hạn',
  RETURNED:         'Trả lại',
  UNASSIGNED:       'Chưa giao',
  PENDING:          'Chờ xử lý',
  PROCESSING:       'Đang xử lý',
  REJECTED:         'Từ chối',
  CANCELED:         'Hủy bỏ',
};

/**
 * Thao tác quy trình (TASK_WORKFLOW_ACTION)
 * Fallback sang label tiếng Việt nếu danh mục chưa load.
 */
export const TASK_WORKFLOW_ACTION_FALLBACK: Record<string, string> = {
  PLAN_ASSIGNMENT: 'Chờ phân công',
  ASSIGN:          'Chờ giao việc',
  IN_PROGRESS:     'Đang thực hiện',
  COMPLETE:        'Báo cáo hoàn thành',
  APPROVE:         'Nghiệm thu / Phê duyệt',
  MONITOR:         'Theo dõi',
  FORWARD:         'Chuyển tiếp',
  COORDINATE:      'Phối hợp',
  REJECT:          'Từ chối',
  RETURN:          'Trả lại',
  ADD_SUBTASK:     'Thêm việc con',
};

/** Keys của các workflow step action (cần hiển thị chip bước) */
export const WORKFLOW_STEP_ACTIONS = ['PLAN_ASSIGNMENT', 'ASSIGN', 'IN_PROGRESS', 'COMPLETE', 'APPROVE'] as const;
