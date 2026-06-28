import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const hrmTasksApi = {
  list(params: any = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get("/hrm/tasks", { params }) as any;
  },

  getStats(params: any = {}): Promise<ApiResponse<any>> {
    return apiClient.get("/hrm/tasks/stats", { params }) as any;
  },

  /** Lấy TOÀN BỘ task của 1 kế hoạch (flat list, bao gồm sub-tasks mọi cấp).
   *  Client tự build tree theo parentId. Auth filter bị bỏ qua — plan visibility đã kiểm tra.
   */
  listByPlan(planId: number): Promise<ApiResponse<any[]>> {
    return apiClient.get("/hrm/tasks", { params: { planId } }) as any;
  },

  create(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/tasks', payload) as any;
  },

  /** Tạo nhiệm vụ con dưới task được giao. planId tự động propagate từ task cha phía backend. */
  createSubTask(parentId: string | number, payload: {
    title: string;
    description?: string;
    priority?: string;
    dueDate?: string;
    assignerCode?: string;
    assigneeCode?: string;
    planId?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${parentId}/breakdown`, {
      ...payload,
      assigneeCode: payload.assigneeCode || 'UNASSIGNED',
    }) as any;
  },

  update(id: number, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}`, payload) as any;
  },

  updateStatus(id: number, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/status`, payload) as any;
  },

  recommendAssignees(params: { rankCode?: string; strategy?: string; domainId?: number; jobTitleId?: number }): Promise<ApiResponse<any[]>> {
    return apiClient.get('/hrm/tasks/recommend-assignees', { params }) as any;
  },

  assignTask(id: number, payload: { assigneeCode?: string; coAssigneeCodes?: string[]; departmentId?: number }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/assign`, payload) as any;
  },

  getComments(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/comments`) as any;
  },

  addComment(id: number, payload: { authorCode?: string; content: string; isSystemMessage?: boolean }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/comments`, payload) as any;
  },

  getSubTasks(id: number): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/subtasks`) as any;
  },

  /** Gửi yêu cầu phối hợp lên LÃNH ĐẠO TRỰC TIẾP (người đang xử lý gọi). */
  requestCoordination(id: number, payload?: { message?: string }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/coordinate`, payload || {}) as any;
  },

  /** Supervisor assigns Lead + Coordinators for task (no sub-task creation). */
  assignCoordination(id: number, payload: { leadCode: string; coordinatorCodes: string[] }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/coordinate`, payload) as any;
  },

  /** Cập nhật % tiến độ hoàn thành của task (0–100). */
  updateProgress(id: number, progress: number): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/progress`, { progress }) as any;
  },
};
