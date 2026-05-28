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
export { TaskListClient } from "./components/work-plans/tasks/TaskListClient";
export { default as PerformanceDashboardClient } from "./components/performance/evaluations/PerformanceDashboardClient";

export {
  hrmDepartmentsApi,
  hrmLeaveApi,
  hrmAttendanceApi,
  hrmContractsApi,
  hrmPayrollApi
} from "./api";
