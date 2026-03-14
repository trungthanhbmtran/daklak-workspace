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
