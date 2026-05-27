import apiClient from "@/lib/axiosInstance";


export const hrmTasksApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/tasks", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { total: 0 },
    }));
  },
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/tasks', payload).then((res: any) => res);
  },
  updateStatus(id: string, payload: any): Promise<any> {
    return apiClient.put(`/hrm/tasks/${id}/status`, payload).then((res: any) => res);
  }
};
