import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';
import { useUpdateStatus } from '@/features/hrm/hooks';
import { toast } from 'sonner';

/**
 * Hook quản lý các thao tác hoàn thành, từ chối, nghiệm thu công việc.
 */
export function useTaskActions(activeTaskId: number | undefined) {
  const qc = useQueryClient();
  const updateStatus = useUpdateStatus(activeTaskId);

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

  return {
    handleCompleteTask,
    handleRejectTask,
    handleApproveTask,
  };
}
