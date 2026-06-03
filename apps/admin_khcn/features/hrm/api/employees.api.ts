import apiClient from "@/lib/axiosInstance";
import type { ApiResponse } from "@/lib/api.types";
import type { HrmEmployee, HrmEmployeesListParams, HrmEmployeesListResponse } from "../types";

const HRM_EMPLOYEES_PATH = "/hrm/employees";

function parseEmployeeRow(row: Record<string, unknown>): HrmEmployee {
  return {
    // Giữ nguyên TẤT CẢ field từ backend (bao gồm priorityScore, isOverloaded, availableCapacity, rankLimit...)
    ...(row as any),
    // Override các field cần parse kiểu dữ liệu cụ thể
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
    department: {
      ...((row.department ?? row.department_info ?? row.departmentInfo) as any),
      domainIds: ((row.department ?? row.department_info ?? row.departmentInfo) as any)?.domainIds || [],
    } as HrmEmployee["department"],
    jobTitle: {
      ...((row.jobTitle ?? row.job_title ?? row.jobTitleInfo) as any),
      monitoredUnitIds: ((row.jobTitle ?? row.job_title ?? row.jobTitleInfo) as any)?.monitoredUnitIds || [],
      domainId: ((row.jobTitle ?? row.job_title ?? row.jobTitleInfo) as any)?.domainId || null,
    } as HrmEmployee["jobTitle"],
    civilServantRank: (row.civilServantRank ?? row.civil_servant_rank ?? row.civilServantRankInfo) as HrmEmployee["civilServantRank"],
    partyTitle: (row.partyTitle ?? row.party_title ?? row.partyTitleInfo) as HrmEmployee["partyTitle"],
    currentTaskCount: row.currentTaskCount != null ? Number(row.currentTaskCount) : 0,
  };
}


export const hrmApi = {
  list(params: HrmEmployeesListParams = {}): Promise<HrmEmployeesListResponse> {
    return (apiClient.get(HRM_EMPLOYEES_PATH, { params }) as any as Promise<ApiResponse<any[]>>)
      .then((res) => ({
        data: (res.data ?? []).map((row: unknown) => parseEmployeeRow(row as Record<string, unknown>)),
        meta: res.meta ?? {},
      }));
  },

  search(keyword: string, pageSize = 20): Promise<HrmEmployee[]> {
    if (!keyword?.trim()) return Promise.resolve([]);
    return (apiClient.get(HRM_EMPLOYEES_PATH, { params: { keyword: keyword.trim(), pageSize } }) as any as Promise<ApiResponse<any[]>>)
      .then((res) => (res.data ?? []).map((row: unknown) => parseEmployeeRow(row as Record<string, unknown>)));
  },

  getOne(id: number): Promise<HrmEmployee | null> {
    return (apiClient.get(`${HRM_EMPLOYEES_PATH}/${id}`) as any as Promise<ApiResponse<any>>)
      .then((res) => {
        const d = res?.data;
        if (!d || typeof d !== "object") return null;
        return parseEmployeeRow(d as Record<string, unknown>);
      });
  },

  create(payload: any): Promise<ApiResponse<HrmEmployee>> {
    return (apiClient.post(HRM_EMPLOYEES_PATH, payload) as any as Promise<ApiResponse<any>>)
      .then((res) => ({
        ...res,
        data: res?.data ? parseEmployeeRow(res.data as Record<string, unknown>) : ({} as HrmEmployee),
      }));
  },

  update(id: number, payload: any): Promise<ApiResponse<HrmEmployee>> {
    return (apiClient.put(`${HRM_EMPLOYEES_PATH}/${id}`, payload) as any as Promise<ApiResponse<any>>)
      .then((res) => ({
        ...res,
        data: res?.data ? parseEmployeeRow(res.data as Record<string, unknown>) : ({} as HrmEmployee),
      }));
  },

  deleteOne(id: number): Promise<ApiResponse<void>> {
    return apiClient.delete(`${HRM_EMPLOYEES_PATH}/${id}`) as any;
  },
};
