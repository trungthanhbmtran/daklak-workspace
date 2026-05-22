/**
 * HRM microservice – API client.
 * Gọi gateway REST (proxy tới hrm-service gRPC). Base URL từ config (API_BASE_URL).
 *
 * Gateway dùng TransformInterceptor: response = { success: true, data: <controller result>, timestamp }.
 * Controller HRM trả về { success, message, data: [...], meta } nên res.data = { data: array, meta }.
 */
import apiClient from "@/lib/axiosInstance";
import type { HrmEmployee, HrmEmployeesListParams, HrmEmployeesListResponse } from "./types";

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
    departmentId:
      row.departmentId != null ? Number(row.departmentId) : row.department_id != null ? Number(row.department_id) : undefined,
    jobTitleId:
      row.jobTitleId != null ? Number(row.jobTitleId) : row.job_title_id != null ? Number(row.job_title_id) : undefined,
    civilServantRankId:
      row.civilServantRankId != null ? Number(row.civilServantRankId) : row.civil_servant_rank_id != null ? Number(row.civil_servant_rank_id) : undefined,
    partyTitleId:
      row.partyTitleId != null ? Number(row.partyTitleId) : row.party_title_id != null ? Number(row.party_title_id) : undefined,
    department: row.department as HrmEmployee["department"],
    jobTitle: row.jobTitle as HrmEmployee["jobTitle"],
    civilServantRank: row.civilServantRank as HrmEmployee["civilServantRank"],
    partyTitle: row.partyTitle as HrmEmployee["partyTitle"],
  };
}

/**
 * Lấy mảng data từ response gateway chuẩn hóa { success, data, meta }.
 */
function unwrapData(res: any): any[] {
  if (!res) return [];
  // Nếu microservice trả { data: [...], meta }, gateway sẽ giữ nguyên bọc ngoài success: true
  // Axios trả res = { success: true, data: [...], meta }
  if (Array.isArray(res.data)) return res.data;
  // Fallback nếu data là object chứa data (trường hợp hiếm)
  if (res.data?.data && Array.isArray(res.data.data)) return res.data.data;
  return [];
}

/** Lấy meta từ response gateway chuẩn hóa. */
function unwrapMeta(res: any): HrmEmployeesListResponse["meta"] {
  return res?.meta || res?.data?.meta;
}

export const hrmApi = {
  /**
   * Danh sách nhân viên có phân trang (trang HRM).
   */
  list(params: HrmEmployeesListParams = {}): Promise<HrmEmployeesListResponse> {
    return apiClient.get(HRM_EMPLOYEES_PATH, { params }).then((res: unknown) => {
      console.log("res", res);
      const data = unwrapData(res);
      if (process.env.NODE_ENV === "development" && res != null && data.length === 0) {
        console.warn("[HRM list] API trả 200 nhưng data rỗng. Kiểm tra Network: GET", HRM_EMPLOYEES_PATH, "→ response:", res);
      }
      return {
        data: data.map((row: unknown) => parseEmployeeRow(row as Record<string, unknown>)),
        meta: unwrapMeta(res),
      };
    });
  },

  /**
   * Tìm kiếm nhân viên theo keyword (cho tra cứu khi tạo user). Trả về tối đa pageSize bản ghi.
   */
  search(keyword: string, pageSize = 20): Promise<HrmEmployee[]> {
    if (!keyword?.trim()) return Promise.resolve([]);
    return apiClient
      .get(HRM_EMPLOYEES_PATH, { params: { keyword: keyword.trim(), pageSize } })
      .then((res: unknown) => {
        const data = unwrapData(res);
        return data.map((row: unknown) => parseEmployeeRow(row as Record<string, unknown>));
      });
  },

  /**
   * Chi tiết một nhân viên (GET /hrm/employees/:id).
   */
  getOne(id: number): Promise<HrmEmployee | null> {
    return apiClient.get(`${HRM_EMPLOYEES_PATH}/${id}`).then((res: any) => {
      const d = res?.data;
      if (!d || typeof d !== "object") return null;
      return parseEmployeeRow(d as Record<string, unknown>);
    });
  },

  create(payload: any): Promise<{ success: boolean; message?: string; data?: HrmEmployee }> {
    return apiClient.post(HRM_EMPLOYEES_PATH, payload).then((res: any) => {
      return {
        success: res?.success ?? true,
        message: res?.message,
        data: res?.data ? parseEmployeeRow(res.data as Record<string, unknown>) : undefined,
      };
    });
  },
};

// ==========================================
// THỰC THI GỌI API THẬT CHO PHÂN HỆ MỞ RỘNG HRM
// Giao tiếp qua Gateway: /api/v1/hrm/...
// ==========================================

export const hrmDepartmentsApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/departments", { params }).then((res: any) => ({
      data: unwrapData(res),
      meta: unwrapMeta(res) || { total: 0 },
    }));
  }
};

export const hrmLeaveApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/leaves", { params }).then((res: any) => ({
      data: unwrapData(res),
      meta: unwrapMeta(res) || { total: 0 },
    }));
  }
};

export const hrmAttendanceApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/attendance", { params }).then((res: any) => ({
      data: unwrapData(res),
      meta: unwrapMeta(res) || { total: 0 },
    }));
  }
};

export const hrmContractsApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/contracts", { params }).then((res: any) => ({
      data: unwrapData(res),
      meta: unwrapMeta(res) || { total: 0 },
    }));
  }
};

export const hrmPayrollApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/payroll", { params }).then((res: any) => ({
      data: unwrapData(res),
      meta: unwrapMeta(res) || { total: 0 },
    }));
  }
};
export interface HrmMasterPlan {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
}

// Giả lập (Mock) dữ liệu cho kế hoạch tổng do backend chưa có endpoint thực sự
let mockPlans: HrmMasterPlan[] = [
  { id: 1, title: "Kế hoạch năm 2026", description: "Các nhiệm vụ trọng tâm 2026", startDate: "2026-01-01", endDate: "2026-12-31", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z" },
  { id: 2, title: "Kế hoạch Quý III/2026", description: "Đẩy mạnh chuyển đổi số", startDate: "2026-07-01", endDate: "2026-09-30", status: "ACTIVE", createdAt: "2026-06-25T00:00:00Z" }
];

export const hrmPlansApi = {
  list(params: any = {}): Promise<{ data: HrmMasterPlan[]; meta: any }> {
    // Trả về mock data thay vì gọi API thật
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [...mockPlans],
          meta: { total: mockPlans.length, page: 1, pageSize: 20, totalPages: 1 }
        });
      }, 500);
    });
  },
  
  create(payload: any): Promise<{ success: boolean; data?: HrmMasterPlan }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newPlan: HrmMasterPlan = {
          id: Date.now(),
          title: payload.title,
          description: payload.description,
          startDate: payload.startDate,
          endDate: payload.endDate,
          status: payload.status || "ACTIVE",
          createdAt: new Date().toISOString()
        };
        mockPlans.unshift(newPlan);
        resolve({ success: true, data: newPlan });
      }, 600);
    });
  }
};
