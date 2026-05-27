import apiClient from "@/lib/axiosInstance";
import type { HrmEmployee, HrmEmployeesListParams, HrmEmployeesListResponse } from "../types";

const HRM_EMPLOYEES_PATH = "/hrm/employees";

function parseEmployeeRow(row: Record<string, unknown>): HrmEmployee {
  return {
    id: Number(row.id),
    firstname: String(row.firstname ?? ""),
    lastname: String(row.lastname ?? ""),
    employeeCode: String(row.employeeCode ?? row.employee_code ?? ""),
    email: String(row.email ?? ""),
    phone: String(row.phone ?? ""),
    identityCard: String(row.identityCard ?? row.identity_card ?? ""),
    avatar: String(row.avatar ?? ""),
    departmentId: row.departmentId != null ? Number(row.departmentId) : row.department_id != null ? Number(row.department_id) : undefined,
    jobTitleId: row.jobTitleId != null ? Number(row.jobTitleId) : row.job_title_id != null ? Number(row.job_title_id) : undefined,
    civilServantRankId: row.civilServantRankId != null ? Number(row.civilServantRankId) : row.civil_servant_rank_id != null ? Number(row.civil_servant_rank_id) : undefined,
    partyTitleId: row.partyTitleId != null ? Number(row.partyTitleId) : row.party_title_id != null ? Number(row.party_title_id) : undefined,
    startDate: String(row.startDate ?? row.start_date ?? ""),
    birthday: String(row.birthday ?? ""),
    department: (row.department ?? row.department_info ?? row.departmentInfo) as HrmEmployee["department"],
    jobTitle: (row.jobTitle ?? row.job_title ?? row.jobTitleInfo) as HrmEmployee["jobTitle"],
    civilServantRank: (row.civilServantRank ?? row.civil_servant_rank ?? row.civilServantRankInfo) as HrmEmployee["civilServantRank"],
    partyTitle: (row.partyTitle ?? row.party_title ?? row.partyTitleInfo) as HrmEmployee["partyTitle"],
    currentTaskCount: Math.floor(Math.random() * 5),
  };
}

export const hrmApi = {
  list(params: HrmEmployeesListParams = {}): Promise<HrmEmployeesListResponse> {
    return apiClient.get(HRM_EMPLOYEES_PATH, { params }).then((res: any) => {
      const data = res.data || [];
      return {
        data: data.map((row: unknown) => parseEmployeeRow(row as Record<string, unknown>)),
        meta: res.meta || {},
      };
    });
  },

  search(keyword: string, pageSize = 20): Promise<HrmEmployee[]> {
    if (!keyword?.trim()) return Promise.resolve([]);
    return apiClient
      .get(HRM_EMPLOYEES_PATH, { params: { keyword: keyword.trim(), pageSize } })
      .then((res: any) => {
        const data = res.data || [];
        return data.map((row: unknown) => parseEmployeeRow(row as Record<string, unknown>));
      });
  },

  getOne(id: number): Promise<HrmEmployee | null> {
    return apiClient.get(`${HRM_EMPLOYEES_PATH}/${id}`).then((res: any) => {
      const d = res?.data;
      if (!d || typeof d !== "object") return null;
      return parseEmployeeRow(d as Record<string, unknown>);
    });
  },

  create(payload: any): Promise<{ success: boolean; message?: string; data?: HrmEmployee }> {
    return apiClient.post(HRM_EMPLOYEES_PATH, payload).then((res: any) => ({
      success: res?.success ?? true,
      message: res?.message,
      data: res?.data ? parseEmployeeRow(res.data as Record<string, unknown>) : undefined,
    }));
  },

  update(id: number, payload: any): Promise<{ success: boolean; message?: string; data?: HrmEmployee }> {
    return apiClient.put(`${HRM_EMPLOYEES_PATH}/${id}`, payload).then((res: any) => ({
      success: res?.success ?? true,
      message: res?.message,
      data: res?.data ? parseEmployeeRow(res.data as Record<string, unknown>) : undefined,
    }));
  },

  deleteOne(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${HRM_EMPLOYEES_PATH}/${id}`).then((res: any) => ({
      success: res?.success ?? true,
      message: res?.message,
    }));
  },
};
