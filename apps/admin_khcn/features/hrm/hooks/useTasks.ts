/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useQuery, useMutation, useQueryClient, keepPreviousData, skipToken } from "@tanstack/react-query";
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

export function useTaskStats(params: any = {}) {
  return useQuery({
    queryKey: [...hrmKeys.tasksList(params), "stats"],
    queryFn: () => hrmTasksApi.getStats(params),
    staleTime: TASKS_STALE_TIME,
    gcTime: TASKS_GC_TIME,
    refetchOnWindowFocus: true,
  });
}

export function useTaskDetail(taskId: number | undefined) {
  return useQuery({
    queryKey: [...hrmKeys.tasks(), 'detail', taskId],
    queryFn: taskId ? () => hrmTasksApi.getTask(taskId) : skipToken,
    staleTime: TASKS_STALE_TIME,
  });
}

/**
 * Comments của một task.
 * - enabled: chỉ fetch khi taskId có giá trị
 * - staleTime ngắn hơn vì comments thay đổi thường xuyên
 */
export function useTaskComments(taskId: number | undefined) {
  return useQuery({
    queryKey: taskId ? hrmKeys.taskComments(taskId) : [...hrmKeys.tasks(), 'comments', 'none'],
    queryFn: taskId ? () => hrmTasksApi.getComments(taskId) : skipToken,
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
    queryKey: taskId ? hrmKeys.taskSubtasks(taskId) : [...hrmKeys.tasks(), 'subtasks', 'none'],
    queryFn: taskId ? () => hrmTasksApi.getSubTasks(taskId) : skipToken,
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
    mutationFn: (payload: { status?: string; rejectReason?: string; actionName?: string }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.updateStatus(taskId, payload);
    },
    onSuccess: (res) => {
      if (taskId && res) {
        qc.setQueryData(hrmKeys.taskDetail(taskId), res);
      }
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

/** Lịch sử thao tác của một task. */
export function useTaskHistory(taskId: number | undefined) {
  return useQuery({
    queryKey: taskId ? hrmKeys.taskHistory(taskId) : [...hrmKeys.tasks(), "history", "none"],
    queryFn: taskId ? () => hrmTasksApi.getHistory(taskId) : skipToken,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/** Danh sách các bước thực hiện (steps/checklist) của một task. */
export function useTaskSteps(taskId: number | undefined) {
  return useQuery({
    queryKey: taskId ? hrmKeys.taskSteps(taskId) : [...hrmKeys.tasks(), "steps", "none"],
    queryFn: taskId ? () => hrmTasksApi.listSteps(taskId) : skipToken,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}

/** Tạo bước thực hiện mới cho một task. */
export function useCreateStep(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; order?: number; assigneeCode?: string; baseScore?: number }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.createStep(taskId, payload);
    },
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: hrmKeys.taskSteps(taskId) });
      toast.success("Đã thêm bước thực hiện");
    },
    onError: () => {
      toast.error("Thêm bước thất bại, vui lòng thử lại");
    },
  });
}

/** Toggle trạng thái bước (TODO → COMPLETED và ngược lại). */
export function useUpdateStep(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, payload }: { stepId: number; payload: { title?: string; status?: string; baseScore?: number } }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.updateStep(taskId, stepId, payload);
    },
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: hrmKeys.taskSteps(taskId) });
    },
    onError: () => {
      toast.error("Cập nhật bước thất bại");
    },
  });
}

/** Tạo nhiệm vụ con (phân rã) từ task cha. */
export function useCreateSubTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ parentId, payload }: {
      parentId: number;
      payload: {
        title: string;
        description?: string;
        priority?: string;
        dueDate?: string;
        assigneeCode?: string;
      };
    }) => hrmTasksApi.createSubTask(parentId, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      toast.success("Đã tạo nhiệm vụ con thành công");
    },
    onError: () => {
      toast.error("Tạo nhiệm vụ con thất bại, vui lòng thử lại");
    },
  });
}

/** Cập nhật % tiến độ công việc. */
export function useUpdateProgress(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (progress: number) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.updateProgress(taskId, progress);
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      toast.success("Đã cập nhật tiến độ");
    },
    onError: () => {
      toast.error("Cập nhật tiến độ thất bại");
    },
  });
}

/** Giao việc: chỉ định người thực hiện chính và người phối hợp. */
export function useAssignTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: {
      id: number;
      payload: {
        assigneeCode?: string;
        departmentId?: number;
        coAssigneeCodes?: string[];
      };
    }) => hrmTasksApi.assignTask(id, payload),
    onSuccess: (res, variables) => {
      if (variables.id && res) {
        qc.setQueryData(hrmKeys.taskDetail(variables.id), res);
        qc.invalidateQueries({ queryKey: hrmKeys.taskHistory(variables.id) });
      }
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      toast.success("Giao việc thành công");
    },
    onError: () => {
      toast.error("Giao việc thất bại, vui lòng thử lại");
    },
  });
}

/** Xin phối hợp xử lý công việc. */
export function useRequestCoordination(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { message?: string; coordinatorCodes?: string[] }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.requestCoordination(taskId, payload);
    },
    onSuccess: (res) => {
      if (taskId && res?.data) {
        qc.setQueryData(hrmKeys.taskDetail(taskId), res.data);
      }
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      if (taskId) {
        qc.invalidateQueries({ queryKey: hrmKeys.taskComments(taskId) });
      }
      toast.success("Đã gửi yêu cầu phối hợp");
    },
    onError: () => {
      toast.error("Gửi yêu cầu phối hợp thất bại, vui lòng thử lại");
    },
  });
}
