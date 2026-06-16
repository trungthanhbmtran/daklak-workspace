"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData } from "@tanstack/react-query";
import { hrmTasksApi } from "../api";
import { hrmKeys } from "../keys";
import { toast } from "sonner";

// ── Cấu hình cache toàn cục cho task queries ──────────────────────────────────
const TASKS_STALE_TIME = 30_000;        // 30s: data vẫn fresh, không refetch ngầm
const TASKS_GC_TIME = 5 * 60_000;   // 5 phút giữ cache sau khi unmount
const DETAIL_STALE_TIME = 20_000;       // comments/subtasks: 20s
const DETAIL_GC_TIME = 2 * 60_000;   // 2 phút

// ─────────────────────────────────────────────────────────────────────────────

/**
 * Danh sách task với:
 * - placeholderData: giữ data cũ khi filter thay đổi (tránh flash loading)
 * - staleTime: không refetch nếu data < 30s tuổi
 * - refetchOnWindowFocus: refetch ngầm khi user quay lại tab
 */
export function useTasksList(params: any = {}) {
  return useQuery({
    queryKey: hrmKeys.tasksList(params),
    queryFn: () => hrmTasksApi.list(params),
    staleTime: TASKS_STALE_TIME,
    gcTime: TASKS_GC_TIME,
    placeholderData: keepPreviousData,
    refetchOnWindowFocus: true,
    refetchOnReconnect: true,
  });
}

/**
 * Comments của một task.
 * - enabled: chỉ fetch khi taskId có giá trị
 * - staleTime ngắn hơn vì comments thay đổi thường xuyên
 */
export function useTaskComments(taskId: number | undefined) {
  return useQuery({
    queryKey: hrmKeys.taskComments(taskId!),
    queryFn: () => {
      if (!taskId) return Promise.resolve({ data: [] });
      return hrmTasksApi.getComments(taskId);
    },
    enabled: !!taskId,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false, // chat không cần refetch khi focus lại tab
  });
}

/**
 * Cây nhiệm vụ con (delegation chain) của một task.
 * - enabled: chỉ fetch khi taskId có giá trị
 */
export function useTaskSubtasks(taskId: number | undefined) {
  return useQuery({
    queryKey: hrmKeys.taskSubtasks(taskId!),
    queryFn: () => {
      if (!taskId) return Promise.resolve({ data: [] });
      return hrmTasksApi.getSubTasks(taskId);
    },
    enabled: !!taskId,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: any) => hrmTasksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) =>
      hrmTasksApi.updateStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },
  });
}

/**
 * Gửi comment.
 * - Optimistic update: thêm comment vào cache trước khi server confirm
 * - Rollback nếu lỗi
 */
export function useAddComment(taskId: number | undefined) {
  const qc = useQueryClient();
  const key = hrmKeys.taskComments(taskId!);

  return useMutation({
    mutationFn: (content: string) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.addComment(taskId, { content });
    },

    // Optimistic: thêm ngay vào cache
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old: any) => {
        const optimisticMsg = {
          content,
          authorCode: "__optimistic__",
          authorName: "Bạn",
          createdAt: new Date().toISOString(),
          isOptimistic: true,
        };
        const existingData = old?.data || [];
        return { ...old, data: [...existingData, optimisticMsg] };
      });

      return { previous };
    },

    // Rollback nếu lỗi
    onError: (_err, _vars, ctx: any) => {
      qc.setQueryData(key, ctx?.previous);
      toast.error("Gửi tin nhắn thất bại");
    },

    // Sync lại data thật từ server
    onSettled: () => {
      qc.invalidateQueries({ queryKey: key });
    },
  });
}

/**
 * Hoàn thành / Trả lại task.
 * Sau khi thành công: invalidate task list + comments.
 */
export function useUpdateStatus(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { status: string; rejectReason?: string }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.updateStatus(taskId, payload);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      if (taskId) {
        qc.invalidateQueries({ queryKey: hrmKeys.taskComments(taskId) });
      }
    },
    onError: () => {
      toast.error("Thao tác thất bại, vui lòng thử lại");
    },
  });
}
