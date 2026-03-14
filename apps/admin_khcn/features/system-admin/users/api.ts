import apiClient from "@/lib/axiosInstance";
import type { UserItem, UserDetail, UserCreatePayload } from "./types";

function normalizeUser(raw: Record<string, unknown>): UserItem {
  return {
    id: Number(raw.id ?? raw.user_id ?? 0),
    email: String(raw.email ?? ""),
    username: raw.username != null ? String(raw.username) : null,
    fullName: raw.fullName != null ? String(raw.fullName) : raw.full_name != null ? String(raw.full_name) : null,
    phoneNumber: raw.phoneNumber != null ? String(raw.phoneNumber) : raw.phone_number != null ? String(raw.phone_number) : null,
    avatarUrl: raw.avatarUrl != null ? String(raw.avatarUrl) : raw.avatar_url != null ? String(raw.avatar_url) : null,
    isActive: raw.isActive !== false && raw.is_active !== false,
    cccd: raw.cccd != null ? String(raw.cccd) : null,
    employeeCode: raw.employeeCode != null ? String(raw.employeeCode) : raw.employee_code != null ? String(raw.employee_code) : null,
  };
}

function normalizeUserDetail(raw: Record<string, unknown>): UserDetail {
  const base = normalizeUser(raw);
  // Backend trả role_names (snake_case) hoặc roleNames (camelCase) – luôn đọc và luôn trả roles để UI không bị dính dữ liệu cũ
  const roleNames = raw.roleNames ?? raw.role_names ?? raw.roles;
  const rolesArr = Array.isArray(roleNames)
    ? (roleNames as unknown[]).map((r) => (typeof r === "string" ? r : (r as { name?: string; code?: string })?.name ?? (r as { code?: string })?.code ?? String(r)))
    : [];
  const policiesRaw = raw.policies ?? (raw as Record<string, unknown>).policiesList;
  const policiesArr: { description?: string; resource?: string }[] = Array.isArray(policiesRaw)
    ? (policiesRaw as unknown[]).map((p) => {
      const o = (p != null && typeof p === "object" ? p : {}) as Record<string, unknown>;
      return {
        description: String(o.description ?? o.name ?? ""),
        resource: String(o.resource ?? o.resource_code ?? ""),
      };
    })
    : [];
  const lastLogin = raw.lastLogin ?? raw.last_login;
  const status = raw.status != null ? String(raw.status) : undefined;
  return {
    ...base,
    ...(status != null && { status }),
    roles: rolesArr,
    policies: policiesArr,
    ...(lastLogin != null && { lastLogin: String(lastLogin) }),
  };
}

/** Gateway TransformInterceptor bọc response: { success, data, timestamp }. Axios trả response.data → res = { data: controllerResult }. */
function unwrapData<T>(res: unknown): T {
  const o = res as { data?: T };
  return (o?.data ?? res) as T;
}

export const userApi = {
  list: async (): Promise<UserItem[]> => {
    try {
      const res = await apiClient.get("/users");
      const data = unwrapData<unknown>(res);
      const arr = Array.isArray(data) ? data : (data as { items?: unknown[] })?.items ?? (data as { data?: unknown[] })?.data ?? [];
      return (Array.isArray(arr) ? arr : []).map((r) => normalizeUser(r as Record<string, unknown>));
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 406) return [];
      throw err;
    }
  },

  getOne: async (id: number): Promise<UserDetail> => {
    const res = await apiClient.get(`/users/${id}`);
    const raw = unwrapData<Record<string, unknown> | null>(res);
    return normalizeUserDetail(raw ?? {});
  },

  create: async (payload: UserCreatePayload): Promise<UserItem> => {
    const body = {
      email: payload.email,
      username: payload.username,
      password: payload.password,
      fullName: payload.fullName,
      phoneNumber: payload.phoneNumber,
      roleIds: payload.roleIds,
      cccd: payload.cccd,
      employeeCode: payload.employeeCode,
    };
    const res = await apiClient.post("/users", body);
    const raw = unwrapData<Record<string, unknown> | null>(res);
    return normalizeUser(raw ?? {});
  },

  /** Khóa hoặc mở tài khoản (PATCH /users/:id/active) */
  setActive: async (id: number, isActive: boolean): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.patch(`/users/${id}/active`, { isActive });
    const data = unwrapData<{ success?: boolean; message?: string } | null>(res);
    return { success: data?.success ?? true, message: data?.message };
  },

  /** Gán lại vai trò cho user (POST /users/:id/assign-roles) */
  assignRoles: async (id: number, roleIds: number[]): Promise<{ success: boolean; message?: string }> => {
    const res = await apiClient.post(`/users/${id}/assign-roles`, { roleIds });
    const data = unwrapData<{ success?: boolean; message?: string } | null>(res);
    return { success: data?.success ?? true, message: data?.message };
  },
};
