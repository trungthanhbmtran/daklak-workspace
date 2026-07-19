/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";
import type { HrmMasterPlan, HrmPlanObjective } from "../types";

export const hrmPlansApi = {
  aiGenerate(payload: { text: string }): Promise<ApiResponse<any>> {
    return apiClient.post('/hrm/master-plans/ai-generate', payload) as any;
  },

  list(params: any = {}): Promise<ApiResponse<HrmMasterPlan[]>> {
    return apiClient.get('/hrm/master-plans', { params }) as any;
  },

  create(payload: any): Promise<ApiResponse<HrmMasterPlan>> {
    return apiClient.post('/hrm/master-plans', payload) as any;
  },

  getOne(id: number): Promise<HrmMasterPlan | null> {
    return (apiClient.get(`/hrm/master-plans/${id}`) as any as Promise<ApiResponse<HrmMasterPlan>>)
      .then((res) => res.data ?? null);
  },

  update(id: number, payload: Partial<HrmMasterPlan>): Promise<ApiResponse<HrmMasterPlan>> {
    return apiClient.put(`/hrm/master-plans/${id}`, payload) as any;
  },
};

export const hrmObjectivesApi = {
  list(planId: number): Promise<ApiResponse<HrmPlanObjective[]>> {
    return apiClient.get(`/hrm/master-plans/${planId}/objectives`) as any;
  },

  create(payload: any): Promise<ApiResponse<HrmPlanObjective>> {
    return apiClient.post('/hrm/objectives', payload) as any;
  },
};
