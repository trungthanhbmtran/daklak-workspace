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
    startDate: String(row.startDate ?? row.start_date ?? ""),
    birthday: String(row.birthday ?? ""),
    department: row.department as HrmEmployee["department"],
    jobTitle: row.jobTitle as HrmEmployee["jobTitle"],
    civilServantRank: row.civilServantRank as HrmEmployee["civilServantRank"],
    partyTitle: row.partyTitle as HrmEmployee["partyTitle"],
    // Mock dữ liệu cho thuật toán Cân bằng tải (Load Balancing)
    currentTaskCount: Math.floor(Math.random() * 5),
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

  /**
   * Cập nhật một nhân viên (PUT /hrm/employees/:id).
   */
  update(id: number, payload: any): Promise<{ success: boolean; message?: string; data?: HrmEmployee }> {
    return apiClient.put(`${HRM_EMPLOYEES_PATH}/${id}`, payload).then((res: any) => {
      return {
        success: res?.success ?? true,
        message: res?.message,
        data: res?.data ? parseEmployeeRow(res.data as Record<string, unknown>) : undefined,
      };
    });
  },

  /**
   * Xóa một nhân viên (DELETE /hrm/employees/:id).
   */
  deleteOne(id: number): Promise<{ success: boolean; message?: string }> {
    return apiClient.delete(`${HRM_EMPLOYEES_PATH}/${id}`).then((res: any) => {
      return {
        success: res?.success ?? true,
        message: res?.message,
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
    // Return mock data for UI development
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({
          data: [
            { id: 1, name: "Ban Giám Đốc", code: "BGD" },
            { id: 2, name: "Phòng Kỹ Thuật", code: "IT" },
            { id: 3, name: "Phòng Hành Chính Nhân Sự", code: "HR" },
            { id: 4, name: "Phòng Kế Toán", code: "ACC" },
            { id: 5, name: "Phòng Kinh Doanh", code: "SALE" }
          ],
          meta: { total: 5, page: 1, pageSize: 20, totalPages: 1 }
        });
      }, 300);
    });
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
import { HrmPlanObjective, HrmTaskTheme, HrmMasterPlan } from "./types";

const defaultPerspectives = [
  { id: "FINANCIAL", title: "Tài chính", colorClass: "emerald" },
  { id: "CUSTOMER", title: "Khách hàng", colorClass: "blue" },
  { id: "INTERNAL_PROCESS", title: "Quy trình nội bộ", colorClass: "amber" },
  { id: "LEARNING_GROWTH", title: "Học hỏi & Phát triển", colorClass: "purple" }
];

// Giả lập (Mock) dữ liệu cho kế hoạch tổng do backend chưa có endpoint thực sự
let mockPlans: HrmMasterPlan[] = [
  { id: 1, title: "Kế hoạch năm 2026", description: "Các nhiệm vụ trọng tâm 2026", startDate: "2026-01-01", endDate: "2026-12-31", status: "ACTIVE", createdAt: "2026-01-01T00:00:00Z", perspectives: [...defaultPerspectives] },
  { id: 2, title: "Kế hoạch Quý III/2026", description: "Đẩy mạnh chuyển đổi số", startDate: "2026-07-01", endDate: "2026-09-30", status: "ACTIVE", createdAt: "2026-06-25T00:00:00Z", perspectives: [...defaultPerspectives] }
];

export const hrmPlansApi = {
  aiGenerate(payload: { text: string }): Promise<any> {
    return apiClient.post('/hrm/master-plans/ai-generate', payload).then((res: any) => res);
  },

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
    return apiClient.post('/hrm/master-plans', payload).then((res: any) => res);
  },
  
  getOne(id: number): Promise<HrmMasterPlan | null> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const plan = mockPlans.find(p => p.id === id);
        if (plan && !plan.perspectives) {
          plan.perspectives = [...defaultPerspectives];
        }
        resolve(plan || null);
      }, 300);
    });
  },

  update(id: number, payload: Partial<HrmMasterPlan>): Promise<{ success: boolean; data?: HrmMasterPlan }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const index = mockPlans.findIndex(p => p.id === id);
        if (index > -1) {
          mockPlans[index] = { ...mockPlans[index], ...payload };
          resolve({ success: true, data: mockPlans[index] });
        } else {
          resolve({ success: false });
        }
      }, 400);
    });
  }
};

let mockObjectives: HrmPlanObjective[] = [
  { id: 1, planId: 1, perspective: "FINANCIAL", title: "Tối ưu ngân sách Q3", metric: "Tỷ lệ tiết kiệm", target: "10%", weight: 30, status: "IN_PROGRESS", departmentIds: [4] },
  { id: 2, planId: 1, perspective: "CUSTOMER", title: "Nâng cao độ hài lòng", metric: "NPS Score", target: "> 85", weight: 20, status: "TODO", departmentIds: [5] },
  { id: 3, planId: 1, perspective: "INTERNAL_PROCESS", title: "Số hóa quy trình duyệt", metric: "Thời gian xử lý", target: "< 24h", weight: 30, status: "DONE", departmentIds: [2, 3] },
  { id: 4, planId: 1, perspective: "LEARNING_GROWTH", title: "Đào tạo nhân sự mới", metric: "Tỷ lệ pass test", target: "100%", weight: 20, status: "TODO", departmentIds: [3] },
];

export const hrmObjectivesApi = {
  list(planId: number): Promise<{ data: HrmPlanObjective[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockObjectives.filter(o => o.planId === planId) });
      }, 400);
    });
  },
  
  create(payload: any): Promise<{ success: boolean; data?: HrmPlanObjective }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        const newObj: HrmPlanObjective = {
          id: Date.now(),
          ...payload,
          status: payload.status || "TODO"
        };
        mockObjectives.push(newObj);
        resolve({ success: true, data: newObj });
      }, 500);
    });
  }
};

let mockTaskThemes: HrmTaskTheme[] = [
  {
    id: 1,
    title: "Tuyển dụng nhân sự mới",
    description: "Tuyển dụng nhân sự theo yêu cầu định biên của các phòng ban",
    defaultMetric: "Thời gian đóng vị trí",
    defaultTarget: "< 30 ngày",
    defaultCases: ["Đăng tuyển", "Lọc CV", "Phỏng vấn vòng 1", "Offer"],
    targetDepartmentIds: [1, 2, 3, 4, 5] // Phù hợp với tất cả các bộ phận HR hoặc cấp quản lý
  },
  {
    id: 2,
    title: "Phát triển tính năng mới",
    description: "Lập trình và kiểm thử tính năng theo yêu cầu sản phẩm",
    defaultMetric: "Bug rate sau release",
    defaultTarget: "< 5%",
    defaultCases: ["Phân tích tài liệu", "Lập trình", "Tự test (Unit Test)", "Tạo Pull Request"],
    targetDepartmentIds: [2, 3] // Giả sử bộ phận Kỹ thuật
  },
  {
    id: 3,
    title: "Quyết toán thuế tháng",
    description: "Thực hiện rà soát và nộp báo cáo thuế đúng hạn",
    defaultMetric: "Tỷ lệ sai sót",
    defaultTarget: "0%",
    defaultCases: ["Kiểm tra hóa đơn", "Đối chiếu sổ phụ ngân hàng", "Lập tờ khai thuế", "Nộp thuế"],
    targetDepartmentIds: [4, 5] // Giả sử bộ phận Kế toán/Tài chính
  }
];

export const hrmTaskThemesApi = {
  list(): Promise<{ data: HrmTaskTheme[] }> {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve({ data: mockTaskThemes });
      }, 300);
    });
  }
};

export const hrmTasksApi = {
  create(payload: any): Promise<any> {
    return apiClient.post('/hrm/tasks', payload).then((res: any) => res);
  }
};

export const hrmKpiCriteriaApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get('/hrm/kpis/criteria', { params }).then((res: any) => {
      // res từ gateway: { criteria: [...] } hoặc { data: { criteria: [...] } }
      const data = res?.criteria || res?.data?.criteria || [];
      return {
        data,
        meta: { total: data.length, page: 1, pageSize: 20, totalPages: 1 }
      };
    });
  },

  create(payload: any): Promise<{ success: boolean; data?: any }> {
    return apiClient.post('/hrm/kpis/criteria', payload).then((res: any) => ({
      success: true,
      data: res
    }));
  },

  update(id: number, payload: any): Promise<{ success: boolean; data?: any }> {
    return apiClient.put(`/hrm/kpis/criteria/${id}`, payload).then((res: any) => ({
      success: true,
      data: res
    }));
  },

  deleteOne(id: number): Promise<{ success: boolean }> {
    return apiClient.delete(`/hrm/kpis/criteria/${id}`).then((res: any) => ({
      success: res?.success ?? true
    }));
  }
};
