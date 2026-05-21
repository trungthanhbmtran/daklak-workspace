/**
 * HRM feature – microservice Nhân sự.
 * API qua gateway: /hrm/employees (proxy hrm-service).
 */
export { hrmApi } from "./api";
export { hrmKeys } from "./keys";
export type { HrmEmployee, HrmEmployeesListParams, HrmEmployeesListResponse, HrmPaginationMeta } from "./types";
export {
  useHrmEmployeesList,
  useHrmEmployeesSearch,
  useHrmEmployee,
  useInvalidateHrmEmployees,
} from "./hooks/useHrmEmployees";

export { HrmDashboardClient } from "./components/HrmDashboardClient";
export { EmployeeListClient } from "./components/EmployeeListClient";
export { LeaveRequestListClient } from "./components/leave/LeaveRequestListClient";
export { TimesheetClient } from "./components/attendance/TimesheetClient";
export { ContractListClient } from "./components/contracts/ContractListClient";
export { PayrollListClient } from "./components/payroll/PayrollListClient";

export {
  hrmDepartmentsApi,
  hrmLeaveApi,
  hrmAttendanceApi,
  hrmContractsApi,
  hrmPayrollApi
} from "./api";
