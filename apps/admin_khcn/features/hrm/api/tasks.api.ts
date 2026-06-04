import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const hrmTasksApi = {
  list(params: any = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get("/hrm/tasks", { params }) as any;
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
    planId?: number;
  }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${parentId}/breakdown`, {
      ...payload,
      assigneeCode: 'UNASSIGNED',
    }) as any;
  },

  update(id: string, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}`, payload) as any;
  },

  updateStatus(id: string, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/status`, payload) as any;
  },

  recommendAssignees(params: { rankCode: string; strategy: string }): Promise<ApiResponse<any[]>> {
    return apiClient.get('/hrm/tasks/recommend-assignees', { params }) as any;
  },

  assignTask(id: string, payload: { assigneeCode?: string; coAssigneeCodes?: string[]; departmentId?: number }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/assign`, payload) as any;
  },

  getComments(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/comments`) as any;
  },

  addComment(id: string, payload: { authorCode?: string; content: string; isSystemMessage?: boolean }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/comments`, payload) as any;
  },

  getSubTasks(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/subtasks`) as any;
  },
};
