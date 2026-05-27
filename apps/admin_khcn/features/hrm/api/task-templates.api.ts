import apiClient from "@/lib/axiosInstance";
import { unwrapData, unwrapMeta } from "./utils";

export const hrmTaskTemplatesApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/task-templates", { params }).then((res: any) => ({
      data: unwrapData(res) || (res.data ? res.data.templates : res.templates) || [],
      meta: unwrapMeta(res) || { total: 0 },
    }));
  },
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/task-templates', payload).then((res: any) => res);
  },
  delete(id: string): Promise<any> {
    return apiClient.delete(`/hrm/task-templates/${id}`).then((res: any) => res);
  }
};
