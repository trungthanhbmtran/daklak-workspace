import apiClient from "@/lib/axiosInstance";
import { HrmMasterPlan, HrmPlanObjective } from "../types";
import { unwrapData, unwrapMeta } from "./utils";

export const hrmPlansApi = {
  aiGenerate(payload: { text: string }): Promise<any> {
    return apiClient.post('/hrm/master-plans/ai-generate', payload).then((res: any) => res);
  },

  list(params: any = {}): Promise<{ data: HrmMasterPlan[]; meta: any }> {
    return apiClient.get('/hrm/master-plans', { params }).then((res: any) => ({
      data: unwrapData(res) || [],
      meta: unwrapMeta(res) || { total: 0 }
    }));
  },
  
  create(payload: any): Promise<{ success: boolean; data?: HrmMasterPlan }> {
    return apiClient.post('/hrm/master-plans', payload).then((res: any) => res);
  },
  
  getOne(id: number): Promise<HrmMasterPlan | null> {
    return apiClient.get(`/hrm/master-plans/${id}`).then((res: any) => (unwrapData(res) as unknown as HrmMasterPlan) || null);
  },

  update(id: number, payload: Partial<HrmMasterPlan>): Promise<{ success: boolean; data?: HrmMasterPlan }> {
    return apiClient.put(`/hrm/master-plans/${id}`, payload).then((res: any) => res);
  }
};

export const hrmObjectivesApi = {
  list(planId: number): Promise<{ data: HrmPlanObjective[] }> {
    return apiClient.get(`/hrm/master-plans/${planId}/objectives`).then((res: any) => ({
      data: unwrapData(res) || []
    }));
  },
  
  create(payload: any): Promise<{ success: boolean; data?: HrmPlanObjective }> {
    return apiClient.post('/hrm/objectives', payload).then((res: any) => res);
  }
};
