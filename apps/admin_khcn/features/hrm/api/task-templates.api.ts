import apiClient from "@/lib/axiosInstance";


export const hrmTaskTemplatesApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/task-templates", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { pagination: { total: 0 } },
    }));
  },
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/task-templates', payload).then((res: any) => res);
  },
  delete(id: string): Promise<any> {
    return apiClient.delete(`/hrm/task-templates/${id}`).then((res: any) => res);
  },
  update(id: string, payload: any): Promise<any> {
    return apiClient.put(`/hrm/task-templates/${id}`, payload).then((res: any) => res);
  }
};
