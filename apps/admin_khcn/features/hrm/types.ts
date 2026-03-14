/**
 * HRM microservice – types cho nhân viên (Employee).
 * API qua gateway: GET /hrm/employees (proxy tới hrm-service).
 */

/** Nhân viên từ HRM – dùng tra cứu CCCD, mã số điện tử, gán vào user */
export interface HrmEmployee {
  id: number;
  firstname: string;
  lastname: string;
  employeeCode: string;
  email: string;
  phone: string;
  identityCard: string;
  departmentId?: number;
  jobTitleId?: number;
  department?: { id: number; name: string; code: string };
  jobTitle?: { id: number; name: string; code: string };
}

/** Tham số danh sách nhân viên (phân trang, lọc) */
export interface HrmEmployeesListParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
  departmentId?: number;
  jobTitleId?: number;
  status?: string;
}

/** Meta phân trang từ gateway/hrm-service */
export interface HrmPaginationMeta {
  total: number;
  page: number;
  pageSize: number;
  totalPages: number;
  hasNext?: boolean;
  hasPrev?: boolean;
}

/** Response danh sách nhân viên có phân trang */
export interface HrmEmployeesListResponse {
  data: HrmEmployee[];
  meta?: {
    pagination?: HrmPaginationMeta;
  };
}
