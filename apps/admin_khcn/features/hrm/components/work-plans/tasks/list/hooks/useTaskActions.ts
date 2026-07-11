import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';
import { useUpdateStatus } from '@/features/hrm/hooks';
import { toast } from 'sonner';
import { TASK_WORKFLOW_ACTION_FALLBACK } from '@/features/hrm/hooks/useCategoryMaps';

/**
 * Hook quản lý các thao tác thực thi quy trình (workflow actions).
 */
export function useTaskActions(activeTaskId: number | undefined) {
  const qc = useQueryClient();
  const updateStatus = useUpdateStatus(activeTaskId);

  // Dùng fallback từ danh mục dùng chung, không hardcode riêng
  const translateAction = (action: string): string =>
    TASK_WORKFLOW_ACTION_FALLBACK[action] || action;

  const handleProcessTask = useCallback(async (actionName: string, reason?: string, onClose?: () => void) => {
    if (!activeTaskId) return;
    
    // We pass both status (for legacy compatibility) and actionName (for WorkflowEngine)
    // The backend's task-shared.service.ts calls getWorkflowActionContext using actionName
    let payload: any = { actionName };
    if (actionName === 'COMPLETE' || actionName === 'APPROVE') payload.status = 'DONE';
    if (actionName === 'RETURN') payload.status = 'RETURNED';
    if (reason) payload.rejectReason = reason;

    updateStatus.mutate(
      payload,
      {
        onSuccess: () => {
          toast.success(`Đã thực hiện: ${translateAction(actionName)}`);
          qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
          onClose?.();
        },
        onError: () => toast.error('Lỗi hệ thống khi xử lý công việc'),
      },
    );
  }, [activeTaskId, updateStatus, qc]);

  return {
    handleProcessTask,
    translateAction
  };
}
