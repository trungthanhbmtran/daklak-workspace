/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const hrmTaskTemplatesApi = {
  list(params: any = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get("/hrm/task-templates", { params }) as any;
  },

  create(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/task-templates', payload) as any;
  },

  bulkUpdate(templates: any[]): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/task-templates/bulk', { templates }) as any;
  },

  delete(id: string): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hrm/task-templates/${id}`) as any;
  },

  update(id: string, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/task-templates/${id}`, payload) as any;
  },
};
