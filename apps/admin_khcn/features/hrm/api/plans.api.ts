/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import type { ApiResponse } from "@/lib/api.types";
import type { HrmMasterPlan } from "../types";

export const hrmPlansApi = {
  list(params: any = {}): Promise<ApiResponse<HrmMasterPlan[]>> {
    return apiClient.get('/hrm/master-plans', { params }) as any;
  },

  create(payload: any): Promise<ApiResponse<HrmMasterPlan>> {
    return apiClient.post('/hrm/master-plans', payload) as any;
  },

  getOne(id: number): Promise<HrmMasterPlan | null> {
    return (apiClient.get(`/hrm/master-plans/${id}`) as any)
      .then((res: any) => unwrapData<HrmMasterPlan | null>(res, null));
  },

  update(id: number, payload: Partial<HrmMasterPlan>): Promise<ApiResponse<HrmMasterPlan>> {
    return apiClient.put(`/hrm/master-plans/${id}`, payload) as any;
  },
};
