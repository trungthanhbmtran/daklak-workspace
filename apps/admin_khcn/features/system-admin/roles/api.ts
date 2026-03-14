import apiClient from "@/lib/axiosInstance";
import { Role, Permission } from "./types";

/** Response từ GET /roles — gateway trả về { data: { roles } } hoặc { data: [...] } */
const rolesListRes = (res: unknown): Role[] => {
  const data = (res as { data?: { roles?: unknown[] } | unknown[] })?.data;
  const list = Array.isArray(data) ? data : (data && Array.isArray((data as { roles?: unknown[] }).roles) ? (data as { roles: unknown[] }).roles : []);
  return list.map((r: unknown) => {
    const row = r as Record<string, unknown>;
    return {
    id: Number(row.id),
    code: String(row.code ?? ""),
    name: String(row.name ?? ""),
    description: String(row.description ?? ""),
    active: 1,
    permissionIds: [],
  };
  });
};

/** Response từ GET /roles/permissions/matrix — gateway trả về { data: { resources } } hoặc { resources } */
const permissionMatrixToFlat = (res: unknown): Permission[] => {
  const body = res as { data?: { resources?: unknown[] }; resources?: unknown[] };
  const resources = (body?.data?.resources ?? body?.resources ?? []) as Array<{ id: number; code: string; name: string; permissions?: Array<{ id: number; action: string }> }>;
  const out: Permission[] = [];
  for (const r of resources) {
    for (const p of r.permissions ?? []) {
      out.push({
        id: p.id,
        module: r.name ?? r.code ?? "",
        action: p.action ?? "",
        code: `${r.code}:${p.action}`,
      });
    }
  }
  return out;
};

/** Response từ GET /roles/:id — gateway trả về { data } hoặc role trực tiếp */
const roleDetailRes = (res: unknown): Role | null => {
  const raw = (res as { data?: Record<string, unknown> })?.data ?? res;
  const r = raw as Record<string, unknown>;
  if (!r || r.id === 0) return null;
  const perms = (r.permissions as Array<{ id: number }>) ?? [];
  return {
    id: Number(r.id),
    code: String(r.code ?? ""),
    name: String(r.name ?? ""),
    description: String(r.description ?? ""),
    active: 1,
    permissionIds: perms.map((p) => p.id),
  };
};

export const roleApi = {
  getRoles: async (): Promise<Role[]> => {
    const res = await apiClient.get("/roles");
    return rolesListRes(res);
  },

  getPermissionMatrix: async (): Promise<Permission[]> => {
    const res = await apiClient.get("/roles/permissions/matrix");
    return permissionMatrixToFlat(res);
  },

  getRoleById: async (id: number): Promise<Role | null> => {
    const res = await apiClient.get(`/roles/${id}`);
    return roleDetailRes(res);
  },

  saveRole: (data: Partial<Role>) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description,
      permissionIds: data.permissionIds ?? [],
    };
    if (data.id) {
      return apiClient.put(`/roles/${data.id}`, { name: payload.name, description: payload.description, permissionIds: payload.permissionIds });
    }
    return apiClient.post("/roles", payload);
  },

  deleteRole: (id: number) => apiClient.delete(`/roles/${id}`),
};
