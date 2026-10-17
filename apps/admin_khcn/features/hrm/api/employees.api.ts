/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import type { ApiResponse } from "@/lib/api.types";
import type { HrmEmployee, HrmEmployeesListParams, HrmEmployeesListResponse } from "../types";

const HRM_EMPLOYEES_PATH = "/hrm/employees";

export const hrmApi = {
  list(params: HrmEmployeesListParams = {}): Promise<HrmEmployeesListResponse> {
    return (apiClient.get(HRM_EMPLOYEES_PATH, { params }) as any)
      .then((res: any) => ({
        data: unwrapData<HrmEmployee[]>(res, []),
        meta: res?.meta ?? {},
      }));
  },

  search(keyword: string, pageSize = 20): Promise<HrmEmployee[]> {
    return (apiClient.get(HRM_EMPLOYEES_PATH, { params: { keyword: keyword?.trim() || "", pageSize } }) as any)
      .then((res: any) => unwrapData<HrmEmployee[]>(res, []));
  },

  getOne(id: number): Promise<HrmEmployee | null> {
    return (apiClient.get(`${HRM_EMPLOYEES_PATH}/${id}`) as any)
      .then((res: any) => unwrapData<HrmEmployee | null>(res, null));
  },

  create(payload: any): Promise<ApiResponse<HrmEmployee>> {
    return apiClient.post(HRM_EMPLOYEES_PATH, payload) as any;
  },

  update(id: number, payload: any): Promise<ApiResponse<HrmEmployee>> {
    return apiClient.put(`${HRM_EMPLOYEES_PATH}/${id}`, payload) as any;
  },

  deleteOne(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${HRM_EMPLOYEES_PATH}/${id}`) as any;
  },
};
