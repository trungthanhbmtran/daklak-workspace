import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";
import type { HrmEmployee, HrmEmployeesListParams, HrmEmployeesListResponse } from "../types";

const HRM_EMPLOYEES_PATH = "/hrm/employees";

export const hrmApi = {
  list(params: HrmEmployeesListParams = {}): Promise<HrmEmployeesListResponse> {
    return (apiClient.get(HRM_EMPLOYEES_PATH, { params }) as any as Promise<ApiResponse<any[]>>)
      .then((res) => ({
        data: res.data ?? [],
        meta: res.meta ?? {},
      }));
  },

  search(keyword: string, pageSize = 20): Promise<HrmEmployee[]> {
    if (!keyword?.trim()) return Promise.resolve([]);
    return (apiClient.get(HRM_EMPLOYEES_PATH, { params: { keyword: keyword.trim(), pageSize } }) as any as Promise<ApiResponse<any[]>>)
      .then((res) => res.data ?? []);
  },

  getOne(id: number): Promise<HrmEmployee | null> {
    return (apiClient.get(`${HRM_EMPLOYEES_PATH}/${id}`) as any as Promise<ApiResponse<any>>)
      .then((res) => res?.data ?? null);
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
