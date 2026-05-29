import apiClient from "@/lib/axiosInstance";

export const hrmDepartmentsApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
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
          meta: {
            pagination: { total: 5, page: 1, pageSize: 20, totalPages: 1 }
          }
        });
      }, 300);
    });
  }
};

export const hrmLeaveApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/leaves", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { total: 0 },
    }));
  }
};

export const hrmAttendanceApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/attendance", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { total: 0 },
    }));
  }
};

export const hrmContractsApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/contracts", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { total: 0 },
    }));
  }
};

export * from "./employees.api";
export * from "./plans.api";
export * from "./kpis.api";
export * from "./tasks.api";
export * from "./task-templates.api";
export * from "./rank-quotas.api";

export const hrmPayrollApi = {
  list(params: any = {}): Promise<{ data: any[]; meta: any }> {
    return apiClient.get("/hrm/payroll", { params }).then((res: any) => ({
      data: res.data || [],
      meta: res.meta || { total: 0 },
    }));
  }
};
