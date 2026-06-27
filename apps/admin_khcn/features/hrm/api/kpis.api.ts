import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";

export const hrmKpiCriteriaApi = {
  list(params: any = {}): Promise<ApiResponse<any[]>> {
    return apiClient.get('/hrm/kpis/criteria', { params }) as any;
  },

  create(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/kpis/criteria', payload) as any;
  },

  update(id: number, payload: any): Promise<ApiResponse<any>> {
    return apiClient.put(`/hrm/kpis/criteria/${id}`, payload) as any;
  },

  deleteOne(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`/hrm/kpis/criteria/${id}`) as any;
  },
};

export const hrmKpiPlansApi = {
  create(payload: any): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/kpi-plans', payload) as any;
  },
};

export const hrmKpiEvaluationsApi = {
  list: (params?: any) => {
    return apiClient.get('/hrm/kpis/evaluations', { params }) as any;
  },
  calculatePersonal: (payload: { periodId: number; employeeCode?: string }) => {
    return apiClient.post('/hrm/kpis/evaluations/calculate-personal', payload) as any;
  }
};
