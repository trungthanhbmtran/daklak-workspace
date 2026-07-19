/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { Role, Permission, Policy } from "./types";

/** Response từ GET /roles — gateway trả về { data: { roles } } hoặc { data: [...] } */
const rolesListRes = (res: unknown): Role[] => {
  const data = (res as { data?: { roles?: unknown[] } | unknown[] })?.data;
  const list = Array.isArray(data) ? data : (data && Array.isArray((data as { roles?: unknown[] }).roles) ? (data as { roles: unknown[] }).roles : []);
  return list.map((r: unknown) => {
    const row = r as Record<string, unknown>;
    const rawPolicies = (row.policies as any[]) || [];
    const policies: Policy[] = rawPolicies.map((p) => ({
      id: p.id,
      resourceId: p.resourceId,
      resourceCode: p.resource?.code ?? p.resourceCode ?? "",
      action: p.action,
      effect: p.effect,
      conditions: p.conditions,
    }));
    return {
      id: Number(row.id),
      code: String(row.code ?? ""),
      name: String(row.name ?? ""),
      description: String(row.description ?? ""),
      active: 1,
      policies: policies,
  };
  });
};

/** Response từ GET /resources — gateway trả về danh sách resource */
const permissionMatrixToFlat = (res: unknown): Permission[] => {
  const data = (res as { data?: unknown[] })?.data ?? res;
  const resources = (Array.isArray(data) ? data : []) as Array<{ id: number; code: string; name: string }>;
  const out: Permission[] = [];
  const STD_ACTIONS = ['VIEW', 'CREATE', 'UPDATE', 'DELETE', 'MANAGE'];
  
  for (const r of resources) {
    for (const action of STD_ACTIONS) {
      out.push({
        id: r.id, // Lưu id của resource vào id của Permission để PolicyForm dùng
        module: r.name ?? r.code ?? "",
        action: action,
        code: `${r.code}:${action}`,
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
  const rawPolicies = (r.policies as any[]) ?? [];
  const policies: Policy[] = rawPolicies.map((p) => ({
    id: p.id,
    resourceId: p.resourceId,
    resourceCode: p.resource?.code ?? p.resourceCode ?? "",
    action: p.action,
    effect: p.effect,
    conditions: p.conditions,
  }));
  return {
    id: Number(r.id),
    code: String(r.code ?? ""),
    name: String(r.name ?? ""),
    description: String(r.description ?? ""),
    active: 1,
    policies: policies,
  };
};

export const roleApi = {
  getRoles: async (): Promise<Role[]> => {
    const res = await apiClient.get("/roles");
    return rolesListRes(res);
  },

  getPermissionMatrix: async (): Promise<Permission[]> => {
    const res = await apiClient.get("/resources");
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
      policies: data.policies ?? [],
    };
    if (data.id) {
      return apiClient.put(`/roles/${data.id}`, { name: payload.name, description: payload.description, policies: payload.policies });
    }
    return apiClient.post("/roles", payload);
  },

  deleteRole: (id: number) => apiClient.delete(`/roles/${id}`),
};
