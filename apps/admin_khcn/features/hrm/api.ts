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
    departmentId:
      row.departmentId != null ? Number(row.departmentId) : row.department_id != null ? Number(row.department_id) : undefined,
    jobTitleId:
      row.jobTitleId != null ? Number(row.jobTitleId) : row.job_title_id != null ? Number(row.job_title_id) : undefined,
    department: row.department as HrmEmployee["department"],
    jobTitle: row.jobTitle as HrmEmployee["jobTitle"],
  };
}

/**
 * Lấy mảng data từ response gateway.
 * Gateway: TransformInterceptor → body = { success: true, data: <controller result>, timestamp }.
 * Controller HRM trả về { success, message, data: [...], meta } từ gRPC.
 * → res = { success: true, data: { success, message, data: array, meta }, timestamp } (axios đã trả response.data).
 */
function unwrapData(res: unknown): unknown[] {
  if (res == null) return [];
  const o = res as Record<string, unknown>;
  // Trường hợp 1: res.data là mảng (một số proxy trả thẳng)
  const first = o.data;
  if (Array.isArray(first)) return first;
  // Trường hợp 2: res.data là object có .data (chuẩn gateway + hrm)
  if (first && typeof first === "object") {
    const inner = first as Record<string, unknown>;
    const arr = inner.data ?? inner.items ?? inner.list;
    if (Array.isArray(arr)) return arr;
  }
  // Trường hợp 3: res.result.data (một số format khác)
  const result = o.result as Record<string, unknown> | undefined;
  if (result && typeof result === "object") {
    const arr = (result as Record<string, unknown>).data ?? (result as Record<string, unknown>).items;
    if (Array.isArray(arr)) return arr;
  }
  return [];
}

/** Lấy meta từ response gateway (cùng cấu trúc với unwrapData). */
function unwrapMeta(res: unknown): HrmEmployeesListResponse["meta"] {
  if (res == null) return undefined;
  const o = res as Record<string, unknown>;
  const first = o.data;
  if (first && typeof first === "object") {
    const inner = first as Record<string, unknown>;
    const meta = inner.meta;
    if (meta && typeof meta === "object") return meta as HrmEmployeesListResponse["meta"];
  }
  const result = o.result as Record<string, unknown> | undefined;
  if (result?.meta && typeof result.meta === "object") return result.meta as HrmEmployeesListResponse["meta"];
  return undefined;
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
    return apiClient.get(`${HRM_EMPLOYEES_PATH}/${id}`).then((res: unknown) => {
      const outer = res as { data?: unknown };
      const inner = outer?.data;
      const d = inner && typeof inner === "object" && "data" in (inner as object) ? (inner as { data?: unknown }).data : inner;
      if (!d || typeof d !== "object") return null;
      return parseEmployeeRow(d as Record<string, unknown>);
    });
  },

  /**
   * Tạo nhân viên mới (POST /hrm/employees).
   */
  create(payload: {
    firstname: string;
    lastname: string;
    employeeCode?: string;
    email?: string;
    phone?: string;
    identityCard?: string;
    departmentId: number;
    jobTitleId: number;
    startDate?: string;
    gender?: string;
    birthday?: string;
    address?: string;
    status?: string;
  }): Promise<{ success: boolean; message?: string; data?: HrmEmployee }> {
    return apiClient.post(HRM_EMPLOYEES_PATH, payload).then((res: unknown) => {
      const outer = res as { data?: unknown };
      const inner = outer?.data;
      const data = inner && typeof inner === "object" && "data" in (inner as object) ? (inner as { data?: unknown }).data : inner;
      return {
        success: true,
        message: (inner as { message?: string })?.message,
        data: data && typeof data === "object" ? parseEmployeeRow(data as Record<string, unknown>) : undefined,
      };
    });
  },
};
