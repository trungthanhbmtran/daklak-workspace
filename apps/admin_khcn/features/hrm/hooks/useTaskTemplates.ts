/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { hrmTaskTemplatesApi } from "../api";
import { hrmKeys } from "../keys";

export function useTaskTemplatesList(rank?: string) {
  return useQuery({
    queryKey: hrmKeys.taskTemplatesList(rank),
    queryFn: () => hrmTaskTemplatesApi.list({ rank }),
  });
}

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => hrmTaskTemplatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.taskTemplates() });
    },
  });
}

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => hrmTaskTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.taskTemplates() });
    },
  });
}

export function useUpdateTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: string, payload: any }) => hrmTaskTemplatesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.taskTemplates() });
    },
  });
}
