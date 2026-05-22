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
  avatar?: string;
  departmentId?: number;
  jobTitleId?: number;
  civilServantRankId?: number;
  partyTitleId?: number;
  department?: { id: number; name: string; code: string };
  jobTitle?: { id: number; name: string; code: string; type?: string };
  civilServantRank?: { id: number; name: string; code: string; type?: string };
  partyTitle?: { id: number; name: string; code: string; type?: string };
  currentTaskCount?: number;
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

// ==========================================
// THÊM MỚI TỪ PHÂN HỆ MỞ RỘNG HRM
// ==========================================

export interface HrmDepartment {
  id: number;
  name: string;
  code: string;
  parentId?: number;
  managerId?: number;
  description?: string;
}

export interface HrmLeaveRequest {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  startDate: string;
  endDate: string;
  reason: string;
  status: "PENDING" | "APPROVED" | "REJECTED";
  approverId?: number;
  createdAt: string;
  employee?: HrmEmployee;
}

export interface HrmAttendanceLog {
  id: number;
  employeeId: number;
  checkInTime: string;
  checkOutTime?: string;
  date: string;
  status: "PRESENT" | "LATE" | "ABSENT" | "LEAVE";
  employee?: HrmEmployee;
}

export interface HrmLaborContract {
  id: number;
  employeeId: number;
  contractNumber: string;
  contractType: "DETERMINATE" | "INDETERMINATE" | "PROBATION";
  startDate: string;
  endDate?: string;
  baseSalary: number;
  status: "ACTIVE" | "EXPIRED" | "TERMINATED";
  employee?: HrmEmployee;
}

export interface HrmPayrollRecord {
  id: number;
  employeeId: number;
  month: number;
  year: number;
  baseSalary: number;
  allowance: number;
  deduction: number;
  netSalary: number;
  status: "DRAFT" | "APPROVED" | "PAID";
  employee?: HrmEmployee;
}

export interface HrmMasterPlan {
  id: number;
  title: string;
  description?: string;
  startDate?: string;
  endDate?: string;
  status: "DRAFT" | "ACTIVE" | "COMPLETED" | "CANCELLED";
  createdAt: string;
  perspectives?: HrmPlanPerspective[];
}

export interface HrmPlanPerspective {
  id: string;
  title: string;
  colorClass: string;
}

export interface HrmPlanObjective {
  id: number;
  planId: number;
  perspective: string;
  title: string;
  description?: string;
  metric?: string;
  target?: string;
  weight?: number; // percentage
  status: "TODO" | "IN_PROGRESS" | "DONE";
  departmentIds?: number[];
  assigneeIds?: number[];
  assignee?: HrmEmployee; // Deprecated, kept for backward compatibility if needed temporarily
  departments?: HrmDepartment[];
  assignees?: HrmEmployee[];
  startDate?: string;
  dueDate?: string;
  cases?: { id: string; title: string; isDone: boolean; assigneeId?: number; assigneeName?: string }[];
}

export interface HrmTaskTheme {
  id: number;
  title: string;
  description: string;
  defaultMetric: string;
  defaultTarget: string;
  defaultCases: string[];
  targetDepartmentIds: number[]; // Use department ID for broader matching since mock job titles might be sparse
}
