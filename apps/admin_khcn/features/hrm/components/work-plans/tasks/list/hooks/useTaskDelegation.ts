import { useCallback } from 'react';
import { useTaskSubtasks } from '@/features/hrm/hooks';

/**
 * Hook quản lý việc fetch cây công việc (delegation chain).
 */
export function useTaskDelegation(rootTaskId: number | undefined) {
  const {
    data: subtasksRes,
    isLoading: isLoadingChain,
    refetch: refetchChain,
  } = useTaskSubtasks(rootTaskId);

  const delegationChain = subtasksRes?.data || [];

  /** Refresh cây công việc (dùng sau khi tạo SubTask) */
  const fetchDelegationChain = useCallback(() => {
    refetchChain();
  }, [refetchChain]);

  return {
    delegationChain,
    isLoadingChain,
    fetchDelegationChain,
  };
}
