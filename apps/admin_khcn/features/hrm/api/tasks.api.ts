import apiClient from "@/lib/axiosInstance";


export const hrmTasksApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any; stats?: any }> {
    return apiClient.get("/hrm/tasks", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { pagination: { total: 0 } },
      stats: res.stats || undefined,
    }));
  },
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/tasks', payload).then((res: any) => res);
  },
  updateStatus(id: string, payload: any): Promise<any> {
    return apiClient.put(`/hrm/tasks/${id}/status`, payload).then((res: any) => res);
  },
  recommendAssignees(params: { rankCode: string; strategy: string }): Promise<any> {
    return apiClient.get('/hrm/tasks/recommend-assignees', { params }).then((res: any) => res);
  },
  assignTask(id: string, payload: { assigneeCode?: string; departmentId?: number }): Promise<any> {
    return apiClient.put(`/hrm/tasks/${id}/assign`, payload).then((res: any) => res);
  },
  getComments(id: string): Promise<{ data: any[] }> {
    return apiClient.get(`/hrm/tasks/${id}/comments`).then((res: any) => ({
      data: res.data || []
    }));
  },
  addComment(id: string, payload: { authorCode: string; content: string; isSystemMessage?: boolean }): Promise<any> {
    return apiClient.post(`/hrm/tasks/${id}/comments`, payload).then((res: any) => res.data || res);
  }
};
