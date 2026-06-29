import { useCallback } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { hrmKeys } from '@/features/hrm/keys';
import { useTaskComments, useAddComment } from '@/features/hrm/hooks';

export function useTaskChat(activeTaskId: number | undefined) {
  const qc = useQueryClient();

  const {
    data: commentsRes,
    isLoading: isLoadingComments,
  } = useTaskComments(activeTaskId);

  const addComment = useAddComment(activeTaskId);
  const taskComments = commentsRes?.data || [];

  const handleSendMessage = useCallback(async (
    message: string,
    onClearInput: () => void,
  ) => {
    if (!message.trim() || !activeTaskId || addComment.isPending) return;
    addComment.mutate(message.trim(), {
      onSuccess: () => onClearInput(),
    });
  }, [activeTaskId, addComment]);

  return {
    taskComments,
    isLoadingComments,
    isSendingMessage: addComment.isPending,
    handleSendMessage,
  };
}
