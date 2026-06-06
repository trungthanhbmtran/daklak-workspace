import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hrmTasksApi } from '@/features/hrm/api';
import { hrmKeys } from '@/features/hrm/keys';
import {
  useTaskComments,
  useTaskSubtasks,
  useAddComment,
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
export function useTaskDetail(activeTaskId: number | undefined, rootTaskId: number | undefined, onRefetch: () => void) {
  const qc = useQueryClient();

  // ── Queries ──────────────────────────────────────────────────────────────
  const {
    data: commentsRes,
    isLoading: isLoadingComments,
  } = useTaskComments(activeTaskId);

  const {
    data: subtasksRes,
    isLoading: isLoadingChain,
    refetch: refetchChain,
  } = useTaskSubtasks(rootTaskId);

  const taskComments   = commentsRes?.data  || [];
  const delegationChain = subtasksRes?.data || [];

  // ── Mutations ─────────────────────────────────────────────────────────────
  const addComment   = useAddComment(activeTaskId);
  const updateStatus = useUpdateStatus(activeTaskId);

  // ── Stable action handlers ────────────────────────────────────────────────

  const handleSendMessage = useCallback(async (
    message: string,
    onClearInput: () => void,
  ) => {
    if (!message.trim() || !activeTaskId || addComment.isPending) return;
    addComment.mutate(message.trim(), {
      onSuccess: () => onClearInput(),
    });
  }, [activeTaskId, addComment]);

  const handleCompleteTask = useCallback(async (onClose: () => void) => {
    if (!activeTaskId) return;
    updateStatus.mutate(
      { status: 'DONE' },
      {
        onSuccess: () => {
          toast.success('Đã hoàn thành công việc!');
          onRefetch();
          onClose();
        },
        onError: () => toast.error('Lỗi khi hoàn thành công việc'),
      },
    );
  }, [activeTaskId, updateStatus, onRefetch]);

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
          onRefetch();
          onClose();
        },
        onError: () => toast.error('Lỗi khi trả lại công việc'),
      },
    );
  }, [activeTaskId, updateStatus, onRefetch]);

  /** Refresh comments thủ công (dùng sau khi CoordinationModal thành công) */
  const fetchComments = useCallback((silent = false) => {
    if (!activeTaskId) return;
    qc.invalidateQueries({ queryKey: hrmKeys.taskComments(activeTaskId) });
  }, [activeTaskId, qc]);

  /** Refresh cây công việc (dùng sau khi tạo SubTask) */
  const fetchDelegationChain = useCallback(() => {
    refetchChain();
  }, [refetchChain]);

  return {
    // data
    taskComments,
    isLoadingComments,
    isSendingMessage: addComment.isPending,
    delegationChain,
    isLoadingChain,
    // actions
    fetchComments,
    fetchDelegationChain,
    handleSendMessage,
    handleCompleteTask,
    handleRejectTask,
  };
}
