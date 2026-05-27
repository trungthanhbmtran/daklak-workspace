"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmTasksApi } from "../api";
import { hrmKeys } from "../keys";

export function useTasksList(params: any = {}) {
  return useQuery({
    queryKey: hrmKeys.tasksList(params),
    queryFn: () => hrmTasksApi.list(params),
  });
}

export function useCreateTask() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => hrmTasksApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => hrmTasksApi.updateStatus(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },
  });
}
