/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { unwrapData } from "@/lib/api-helper";
import { hrmTaskTemplatesApi } from "../api";
import { hrmKeys } from "../keys";
import { toast } from "sonner";

export function useTaskTemplatesList(
  params?: string | { rank?: string; classification?: string },
  options?: { enabled?: boolean }
) {
  const rank = typeof params === 'string' ? params : params?.rank;
  const classification = typeof params === 'object' ? params?.classification : undefined;
  return useQuery({
    queryKey: [...hrmKeys.taskTemplates(), { rank, classification }],
    queryFn: () => hrmTaskTemplatesApi.list({ rank, classification }),
    select: (res) => unwrapData<any[]>(res, []),
    enabled: options?.enabled ?? true,
    staleTime: 60_000,
  });
}

export function useCreateTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (payload: any) => hrmTaskTemplatesApi.create(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.taskTemplates() });
    },
  });
}

export function useDeleteTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (id: string) => hrmTaskTemplatesApi.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.taskTemplates() });
    },
  });
}

export function useUpdateTaskTemplate() {
  const queryClient = useQueryClient();
  return useMutation({
     
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, payload }: { id: string, payload: any }) => hrmTaskTemplatesApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hrmKeys.taskTemplates() });
    },
  });
}
