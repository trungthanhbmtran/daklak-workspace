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
  const queryParams = { summary: true, ...params };
  return useQuery({
    queryKey: hrmKeys.tasksList(queryParams),
    queryFn: () => hrmTasksApi.list(queryParams),
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

export function useTaskDetail(taskId: number | undefined, options?: { enabled?: boolean }) {
  const isEnabled = (options?.enabled ?? true) && Boolean(taskId);
  return useQuery({
    queryKey: [...hrmKeys.tasks(), 'detail', taskId],
    queryFn: isEnabled && taskId ? () => hrmTasksApi.getTask(taskId) : skipToken,
    enabled: isEnabled,
    staleTime: TASKS_STALE_TIME,
    placeholderData: keepPreviousData,
  });
}

/**
 * Comments của một task.
 * - enabled: chỉ fetch khi taskId có giá trị
 * - staleTime ngắn hơn vì comments thay đổi thường xuyên
 */
export function useTaskComments(conversationId: string | undefined, options?: { enabled?: boolean }) {
  const isEnabled = (options?.enabled ?? true) && Boolean(conversationId);
  return useQuery({
    queryKey: conversationId ? hrmKeys.taskComments(conversationId as any) : [...hrmKeys.tasks(), 'comments', 'none'],
    queryFn: isEnabled && conversationId ? () => hrmTasksApi.getComments(conversationId) : skipToken,
    enabled: isEnabled,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false, // chat không cần refetch khi focus lại tab
  });
}

/**
 * Cây nhiệm vụ con (delegation chain) của một task.
 * - enabled: chỉ fetch khi taskId có giá trị và options.enabled !== false
 */
export function useTaskSubtasks(taskId: number | undefined, options?: { enabled?: boolean }) {
  const isEnabled = (options?.enabled ?? true) && Boolean(taskId);
  return useQuery({
    queryKey: taskId ? hrmKeys.taskSubtasks(taskId) : [...hrmKeys.tasks(), 'subtasks', 'none'],
    queryFn: isEnabled && taskId ? () => hrmTasksApi.getSubTasks(taskId) : skipToken,
    enabled: isEnabled,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

// ─────────────────────────────────────────────────────────────────────────────

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({

    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: (payload: any) => hrmTasksApi.create(payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: any }) => hrmTasksApi.update(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: [...hrmKeys.tasks(), 'detail', variables.id] });
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      toast.success("Cập nhật thông tin công việc thành công");
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Cập nhật công việc thất bại");
    },
  });
}

export function useUpdateTaskStatus() {
  const qc = useQueryClient();
  return useMutation({

    onError: (error: any) => { toast.error(error?.response?.data?.message || "Đã có lỗi xảy ra"); },
    mutationFn: ({ id, payload }: { id: number; payload: { status: string; rejectReason?: string; actionName?: string; evidence?: string; evidenceData?: any } }) =>
      hrmTasksApi.updateStatus(id, payload),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },
  });
}

export function useExtendTask() {
  const qc = useQueryClient();
  return useMutation({
    onError: (error: any) => { toast.error(error?.response?.data?.message || "Gia hạn thất bại"); },
    mutationFn: ({ id, payload }: { id: number; payload: { dueDate: string; reason: string } }) =>
      hrmTasksApi.extendTask(id, payload),
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: hrmKeys.taskDetail(variables.id) });
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      toast.success("Gia hạn công việc thành công");
    },
  });
}

/**
 * Gửi comment.
 * - Optimistic update: thêm comment vào cache trước khi server confirm
 * - Rollback nếu lỗi
 */
export function useAddComment(conversationId: string | undefined) {
  const qc = useQueryClient();
  const key = hrmKeys.taskComments(conversationId as any);

  return useMutation({
    mutationFn: (content: string) => {
      if (!conversationId) return Promise.reject(new Error("Missing conversationId"));
      // Assuming senderId will be handled by gateway auth or we can pass empty and let gateway inject
      return hrmTasksApi.addComment(conversationId, { content });
    },

    // Optimistic: thêm ngay vào cache
    onMutate: async (content) => {
      await qc.cancelQueries({ queryKey: key });
      const previous = qc.getQueryData(key);

      qc.setQueryData(key, (old: any) => {
        const optimisticMsg = {
          content,
          senderId: "__optimistic__",
          createdAt: new Date().toISOString(),
          isOptimistic: true,
        };
        const existingData = old?.data?.items || [];
        return { ...old, data: { ...old?.data, items: [...existingData, optimisticMsg] } };
      });

      return { previous };
    },

    // Rollback nếu lỗi
    onError: (error: any, _vars, ctx: any) => {
      qc.setQueryData(key, ctx?.previous);
      const message = error.response?.data?.message || "Gửi tin nhắn thất bại";
      toast.error(message);
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
    mutationFn: (payload: { status: string; rejectReason?: string; actionName?: string; evidence?: string; evidenceData?: any }) => {
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

    onError: (error: any) => {
      const message = error.response?.data?.message || "Thao tác thất bại, vui lòng thử lại";
      toast.error(message);
    },
  });
}

/** Dữ liệu thô gửi lên backend khi thẩm định — cấm kèm điểm tổng hợp/xếp loại tự tính. */
interface EvaluateTaskScores {
  volumePct?: number;
  difficultyK?: number;
  isUnexpected?: boolean;
  qualityGrade?: string;
  attitudeScore?: number;
  c1Timeliness?: number;
  c2Quality?: number;
  c3Proactiveness?: number;
  c4Discipline?: number;
  bonusPenalty?: number;
  baseScore?: number;
  primaryPercentage?: number;
}

/**
 * Ghép chuỗi minh chứng lưu workflow history CHỈ từ RAW INPUTS — không nhúng điểm
 * tổng hợp hay rank client tự tính (đó là phạm vi recompute của backend).
 */
function buildApproveEvidence(scores: EvaluateTaskScores | undefined, feedback?: string): string {
  const s = scores || {};
  const rows = [
    s.volumePct != null ? `- Khối lượng chủ trì: ${s.volumePct}%` : null,
    s.primaryPercentage != null ? `- Tỷ lệ gánh vác: ${s.primaryPercentage}%` : null,
    s.difficultyK != null ? `- Hệ số độ khó K: ${s.difficultyK}` : null,
    s.baseScore != null ? `- Cơ số điểm: ${s.baseScore}` : null,
    s.c1Timeliness != null ? `- C1 Tiến độ & Thời hạn: ${s.c1Timeliness}đ` : null,
    s.c2Quality != null ? `- C2 Chất lượng sản phẩm: ${s.c2Quality}đ` : null,
    s.c3Proactiveness != null ? `- C3 Chủ động & Sáng tạo: ${s.c3Proactiveness}đ` : null,
    s.c4Discipline != null ? `- C4 Kỷ luật & Phối hợp: ${s.c4Discipline}đ` : null,
    s.bonusPenalty ? `- Thưởng/Phạt đột xuất: ${s.bonusPenalty}đ` : null,
    s.qualityGrade ? `- Mức chất lượng quy định: ${s.qualityGrade}` : null,
    s.attitudeScore != null ? `- Thái độ: ${s.attitudeScore}` : null,
    s.isUnexpected ? `- Nhiệm vụ phát sinh đột xuất: Có` : null,
  ].filter(Boolean);
  return `⭐ [LÃNH ĐẠO ĐÁNH GIÁ & PHÊ DUYỆT]:\n${rows.join("\n") || "(Không có dữ liệu chấm điểm chi tiết)"}\n- Ý kiến chỉ đạo: ${feedback || "Hoàn thành tốt"}`;
}

/**
 * Hook dành cho Lãnh đạo / Người phụ trách thẩm định, phê duyệt và chốt điểm đánh giá công việc.
 */
export function useEvaluateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: {
      id: number;
      payload: {
        action: 'APPROVE' | 'RETURN';
        /**
         * RAW INPUTS ONLY (ledger #21 — "Frontend là dumb client"):
         * scores chỉ chứa dữ liệu thô do người dùng nhập / tham số quy định trên task
         * (điểm 4 thành tố Đề án 01-BTCTU, thưởng-phạt, cơ số, hệ số K, tỷ lệ gánh vác).
         * Các giá trị tổng hợp (totalScore/rawWeightedScore, finalKpiScore, rankGrade/xếp loại)
         * PHẢI do backend (hrm-service) recompute — client không tự tính và không gửi giá trị tự tính.
         */
        scores?: EvaluateTaskScores;
        feedback?: string;
        rejectReason?: string;
      };
    }) => {
      const status = payload.action === 'APPROVE' ? 'COMPLETED' : 'RETURNED';
      const evidence = payload.action === 'APPROVE'
        ? buildApproveEvidence(payload.scores, payload.feedback)
        : `⚠️ [LÃNH ĐẠO YÊU CẦU BỔ SUNG MINH CHỨNG / LÀM LẠI]:\n${payload.rejectReason || payload.feedback || 'Yêu cầu kiểm tra và hoàn thiện lại kết quả công việc'}`;

      return hrmTasksApi.updateStatus(id, {
        status,
        actionName: payload.action === 'APPROVE' ? 'EVALUATE_APPROVE' : 'RETURN',
        rejectReason: payload.action === 'RETURN' ? (payload.rejectReason || payload.feedback) : undefined,
        evidence,
        evidenceData: {
          itemType: 'evaluation',
          itemTitle: 'Thẩm định & Đánh giá công việc của Lãnh đạo',
          scores: payload.scores,
          feedback: payload.feedback,
          action: payload.action,
        },
      });
    },
    onSuccess: (_, variables) => {
      qc.invalidateQueries({ queryKey: hrmKeys.taskDetail(variables.id) });
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      qc.invalidateQueries({ queryKey: hrmKeys.taskHistory(variables.id) });
      toast.success(
        variables.payload.action === 'APPROVE'
          ? "Đã phê duyệt và chốt điểm đánh giá nhiệm vụ"
          : "Đã chuyển yêu cầu hoàn thiện lại cho cán bộ"
      );
    },
    onError: (error: any) => {
      toast.error(error?.response?.data?.message || "Đánh giá thất bại, vui lòng thử lại");
    },
  });
}

/** Phản hồi nhận việc (ACCEPT / REJECT / REQUEST_COORDINATION) */
export function useRespondTask(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { action: string; rejectReason?: string; message?: string }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.respondTask(taskId, payload);
    },
    onSuccess: (res) => {
      if (taskId && res?.data) {
        qc.setQueryData(hrmKeys.taskDetail(taskId), res.data);
      }
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
      if (taskId) {
        qc.invalidateQueries({ queryKey: hrmKeys.taskComments(taskId) });
      }
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Thao tác thất bại, vui lòng thử lại";
      toast.error(message);
    },
  });
}

/** Lịch sử thao tác của một task. */
export function useTaskHistory(taskId: number | undefined, options?: { enabled?: boolean }) {
  const isEnabled = (options?.enabled ?? true) && Boolean(taskId);
  return useQuery({
    queryKey: taskId ? hrmKeys.taskHistory(taskId) : [...hrmKeys.tasks(), "history", "none"],
    queryFn: isEnabled && taskId ? () => hrmTasksApi.getHistory(taskId) : skipToken,
    enabled: isEnabled,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
    refetchOnWindowFocus: false,
  });
}

/** Danh sách các bước thực hiện (steps/checklist) của một task. */
export function useTaskSteps(taskId: number | undefined, options?: { enabled?: boolean }) {
  const isEnabled = (options?.enabled ?? true) && Boolean(taskId);
  return useQuery({
    queryKey: taskId ? hrmKeys.taskSteps(taskId) : [...hrmKeys.tasks(), "steps", "none"],
    queryFn: isEnabled && taskId ? () => hrmTasksApi.listSteps(taskId) : skipToken,
    enabled: isEnabled,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}

/** Tạo bước thực hiện mới cho một task. */
export function useCreateStep(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (payload: { title: string; order?: number; assigneeCode?: string; assignee?: string; baseScore?: number | ""; }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.createStep(taskId, payload);
    },
    onSuccess: () => {
      if (taskId) qc.invalidateQueries({ queryKey: hrmKeys.taskSteps(taskId) });
      toast.success("Đã thêm bước thực hiện");
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "Thêm bước thất bại, vui lòng thử lại";
      toast.error(message);
    },
  });
}

/** Toggle trạng thái bước (TODO → COMPLETED và ngược lại). */
export function useUpdateStep(taskId: number | undefined) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ stepId, payload }: { stepId: number; payload: { title?: string; status?: string; baseScore?: number; evidence?: string; evidenceData?: any } }) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.updateStep(taskId, stepId, payload);
    },
    onSuccess: () => {
      if (taskId) {
        qc.invalidateQueries({ queryKey: hrmKeys.taskSteps(taskId) });
        qc.invalidateQueries({ queryKey: hrmKeys.taskDetail(taskId) });
      }
      qc.invalidateQueries({ queryKey: hrmKeys.tasks() });
    },

    onError: (error: any) => {
      const message = error.response?.data?.message || "Cập nhật bước thất bại";
      toast.error(message);
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

    onError: (error: any) => {
      const message = error.response?.data?.message || "Tạo nhiệm vụ con thất bại, vui lòng thử lại";
      toast.error(message);
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
        assignee?: string;
        departmentId?: number;
        coAssigneeCodes?: string[];
        coordinators?: string[];
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

    onError: (error: any) => {
      const message = error.response?.data?.message || "Giao việc thất bại, vui lòng thử lại";
      toast.error(message);
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

    onError: (error: any) => {
      const message = error.response?.data?.message || "Gửi yêu cầu phối hợp thất bại, vui lòng thử lại";
      toast.error(message);
    },
  });
}

/** Ghi nhận tham gia (điểm danh) sự kiện/họp. */
export function useRecordAttendance() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (taskId: number) => {
      if (!taskId) return Promise.reject(new Error("Missing taskId"));
      return hrmTasksApi.recordAttendance(taskId);
    },
    onSuccess: (_, taskId) => {
      qc.invalidateQueries({ queryKey: [...hrmKeys.tasks(), 'attendance-stats', taskId] });
      toast.success("Đã điểm danh thành công");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Điểm danh thất bại";
      toast.error(message);
    },
  });
}

/** Lấy thống kê điểm danh của sự kiện/họp. */
export function useAttendanceStats(taskId: number | undefined) {
  return useQuery({
    queryKey: taskId ? [...hrmKeys.tasks(), 'attendance-stats', taskId] : [...hrmKeys.tasks(), 'attendance-stats', 'none'],
    queryFn: taskId ? () => hrmTasksApi.getAttendanceStats(taskId) : skipToken,
    staleTime: DETAIL_STALE_TIME,
    gcTime: DETAIL_GC_TIME,
  });
}

/** Gợi ý cán bộ thông minh theo tải công việc phòng ban và KPI */
export function useTaskRecommendations(params: {
  departmentId?: number;
  domainId?: number;
  jobTitleId?: number;
  strategy?: string;
  enabled?: boolean;
}) {
  const { enabled = true, ...rest } = params;
  return useQuery({
    queryKey: [...hrmKeys.tasks(), 'recommendations', rest],
    queryFn: () => hrmTasksApi.getRecommendations(rest),
    enabled,
    staleTime: 15_000,
    gcTime: 2 * 60_000,
  });
}

/** Lấy bối cảnh giao việc chuẩn hóa tại server (Lãnh đạo, nhân viên, bước thực hiện, domain VTVL, điểm KPI) */
export function useTaskContext(
  params: {
    departmentId?: number | string;
    assignee?: string;
    coordinatorIds?: string;
    priority?: string;
  },
  options?: { enabled?: boolean },
) {
  const isEnabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [...hrmKeys.tasks(), 'context', params],
    queryFn: () => hrmTasksApi.getTaskContext(params),
    enabled: isEnabled,
    staleTime: 10_000,
    gcTime: 60_000,
  });
}

/** Tự động cân bằng tỷ lệ % đóng góp chuẩn hóa tại server */
export function useBalancePercentages() {
  return useMutation({
    mutationFn: (payload: { coordinatorCount?: number; coordinatorCodes?: string[] }) =>
      hrmTasksApi.balancePercentages(payload),
    onError: (error: any) => {
      const message = error.response?.data?.message || "Cân bằng tỷ lệ đóng góp thất bại";
      toast.error(message);
    },
  });
}

/** Dữ liệu Bàn làm việc Cá nhân (6 chỉ số, việc cần làm, việc gần đây, tải phòng ban) tính toán tại server */
export function usePersonalWorkbench(
  params?: {
    startDate?: string;
    endDate?: string;
    unitScope?: string;
    search?: string;
    category?: string;
  },
  options?: { enabled?: boolean },
) {
  const isEnabled = options?.enabled ?? true;
  return useQuery({
    queryKey: [...hrmKeys.tasks(), 'personal-workbench', params],
    queryFn: () => hrmTasksApi.getPersonalWorkbench(params),
    enabled: isEnabled,
    staleTime: 15_000,
    gcTime: 2 * 60_000,
    placeholderData: keepPreviousData,
  });
}

