import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const hrmTasksApi = {
  list(params: any = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get("/hrm/tasks", { params }) as any;
  },

  create(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/tasks', payload) as any;
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

  assignTask(id: string, payload: { assigneeCode?: string; departmentId?: number }): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/tasks/${id}/assign`, payload) as any;
  },

  getComments(id: string): Promise<ApiResponse<any[]>> {
    return apiClient.get(`/hrm/tasks/${id}/comments`) as any;
  },

  addComment(id: string, payload: { authorCode?: string; content: string; isSystemMessage?: boolean }): Promise<ApiResponse<any>> {
    return apiClient.post(`/hrm/tasks/${id}/comments`, payload) as any;
  },
};
