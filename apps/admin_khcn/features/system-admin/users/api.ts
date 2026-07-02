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

  // Roles: backend trả [{id, code, name}] hoặc [string]
  const rolesRaw = raw.roles ?? raw.roleNames ?? raw.role_names;
  const roles: Array<{ id?: number; code?: string; name?: string }> = Array.isArray(rolesRaw)
    ? (rolesRaw as unknown[]).map((r) => {
        if (typeof r === "string") return { name: r, code: r };
        const o = (r as Record<string, unknown>);
        return {
          id: o.id != null ? Number(o.id) : undefined,
          code: o.code != null ? String(o.code) : undefined,
          name: o.name != null ? String(o.name) : o.code != null ? String(o.code) : String(r),
        };
      })
    : [];

  // Policies: backend trả [{description, resource, action, effect}]
  const policiesRaw = raw.policies ?? (raw as Record<string, unknown>).policiesList;
  const policies: { description?: string; resource?: string; action?: string; effect?: string }[] =
    Array.isArray(policiesRaw)
      ? (policiesRaw as unknown[]).map((p) => {
          const o = (p != null && typeof p === "object" ? p : {}) as Record<string, unknown>;
          return {
            description: String(o.description ?? o.name ?? ""),
            resource: String(o.resource ?? o.resource_code ?? o.resourceCode ?? ""),
            action: o.action != null ? String(o.action) : undefined,
            effect: o.effect != null ? String(o.effect) : "ALLOW",
          };
        })
      : [];

  const lastLogin = raw.lastLogin ?? raw.last_login;
  const status = raw.status != null ? String(raw.status) : undefined;
  return {
    ...base,
    ...(status != null && { status }),
    roles,
    policies,
    ...(lastLogin != null && { lastLogin: String(lastLogin) }),
  };
}


/** Gateway TransformInterceptor bọc response: { success, data, meta }. */
function unwrapData<T>(res: any): T {
  return (res?.data ?? res) as T;
}

export const userApi = {
  list: async (params?: { page?: number; limit?: number; search?: string }): Promise<{ data: UserItem[], meta: { total: number } }> => {
    try {
      const res = await apiClient.get("/users", { params });
      const rawData = (res as any)?.data ?? res;
      const meta = rawData?.meta ?? { total: 0 };
      const arr = Array.isArray(rawData?.data) ? rawData.data : (Array.isArray(rawData) ? rawData : []);
      return {
        data: arr.map((r: any) => normalizeUser(r as Record<string, unknown>)),
        meta
      };
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 406) return { data: [], meta: { total: 0 } };
      throw err;
    }
  },

  getOne: async (id: number): Promise<UserDetail> => {
    const res = await apiClient.get(`/users/${id}`);
    const raw = unwrapData<Record<string, unknown> | null>(res);
    return normalizeUserDetail(raw ?? {});
  },

  /** Lazy load policies – chỉ gọi khi user mở section policies */
  getPolicies: async (id: number): Promise<{ description?: string; resource?: string; action?: string; effect?: string }[]> => {
    const res = await apiClient.get(`/users/${id}/policies`);
    const data = unwrapData<unknown>(res);
    const arr = Array.isArray(data) ? data : [];
    return arr.map((p: any) => ({
      description: String(p.description ?? p.name ?? ""),
      resource: String(p.resource ?? p.resource_code ?? ""),
      action: p.action != null ? String(p.action) : undefined,
      effect: p.effect != null ? String(p.effect) : "ALLOW",
    }));
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

  /** Cập nhật tùy chọn nhận thông báo cá nhân (PUT /users/:id/notification-prefs) */
  updateNotificationPrefs: async (id: number, prefs: Record<string, boolean>) => {
    const res = await apiClient.put(`/users/${id}/notification-prefs`, {
      notificationPrefs: prefs,
    });
    return unwrapData<any>(res);
  },
};

export const notificationApi = {
  getEvents: async (): Promise<any[]> => {
    const res = await apiClient.get("/notifications/events");
    return unwrapData<any[]>(res);
  },
};

export const integrationApi = {
  list: async () => {
    const res = await apiClient.get("/integrations");
    return unwrapData<any[]>(res);
  },
  create: async (body: any) => {
    const res = await apiClient.post("/integrations", body);
    return unwrapData<any>(res);
  },
  update: async (id: number, body: any) => {
    const res = await apiClient.put(`/integrations/${id}`, body);
    return unwrapData<any>(res);
  },
};
