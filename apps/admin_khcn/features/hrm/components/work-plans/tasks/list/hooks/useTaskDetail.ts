import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';
import {
  useTaskSubtasks,
  useUpdateStatus,
} from '@/features/hrm/hooks';
import { toast } from 'sonner';

/**
 * Hook tổng hợp cho TaskDetailDialog.
 *
 * Dùng React Query để:
 *  - Cache comments + subtasks (tránh refetch thừa khi đóng/mở lại dialog)
 *  - Optimistic update khi gửi comment
 *  - Tự dedup nếu nhiều nơi cùng query cùng taskId
 */
export function useTaskDetail(activeTaskId: number | undefined, rootTaskId: number | undefined) {
  const qc = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────

  const {
    data: subtasksRes,
    isLoading: isLoadingChain,
    refetch: refetchChain,
  } = useTaskSubtasks(rootTaskId);


  const delegationChain = subtasksRes?.data || [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const updateStatus = useUpdateStatus(activeTaskId);

  // ── Stable action handlers ────────────────────────────────────────────────

  const handleCompleteTask = useCallback(async (onClose: () => void) => {
    if (!activeTaskId) return;
    updateStatus.mutate(
      { status: 'DONE' },
      {
        onSuccess: () => {
          toast.success('Đã hoàn thành công việc!');
          qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
          onClose();
        },
        onError: () => toast.error('Lỗi khi hoàn thành công việc'),
      },
    );
  }, [activeTaskId, updateStatus, qc]);

  const handleRejectTask = useCallback(async (
    reason: string,
    onClose: () => void,
  ) => {
    if (!reason.trim() || !activeTaskId) return;
    updateStatus.mutate(
      { status: 'RETURNED', rejectReason: reason },
      {
        onSuccess: () => {
          toast.success('Đã trả lại công việc');
          qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
          onClose();
        },
        onError: () => toast.error('Lỗi khi trả lại công việc'),
      },
    );
  }, [activeTaskId, updateStatus, qc]);

  const handleApproveTask = useCallback(async (onClose: () => void) => {
    if (!activeTaskId) return;
    updateStatus.mutate(
      { status: 'DONE' },
      {
        onSuccess: () => {
          toast.success('Đã nghiệm thu công việc');
          qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
          onClose();
        },
        onError: () => toast.error('Lỗi khi nghiệm thu công việc'),
      },
    );
  }, [activeTaskId, updateStatus, qc]);

  /** Refresh comments thủ công (dùng sau khi CoordinationModal thành công) */
  const fetchComments = useCallback(() => {
    if (!activeTaskId) return;
    qc.invalidateQueries({ queryKey: hrmKeys.taskComments(activeTaskId) });
  }, [activeTaskId, qc]);

  /** Refresh cây công việc (dùng sau khi tạo SubTask) */
  const fetchDelegationChain = useCallback(() => {
    refetchChain();
  }, [refetchChain]);

  return {
    // data
    delegationChain,
    isLoadingChain,
    // actions
    fetchComments,
    fetchDelegationChain,
    handleCompleteTask,
    handleRejectTask,
    handleApproveTask,
  };
}
