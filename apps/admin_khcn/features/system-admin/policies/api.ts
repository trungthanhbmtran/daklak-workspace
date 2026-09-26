export interface Policy {
  id?: number;
  resourceCode?: string;
  action?: string;
  effect?: 'ALLOW' | 'DENY';
  resourceId?: number;
  conditions?: { expression?: string };
  code?: string;
  name?: string;
  description?: string;
  active?: number;
  policies?: Policy[];
}
/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { PolicyFilter, Permission } from "./types";

/** Response từ GET /policys — gateway trả về { data: { policys } } hoặc { data: [...] } */
const policysListRes = (res: unknown): Policy[] => {
  const rawData = (res as { data?: any })?.data ?? res;
  let list: any[] = [];
  if (Array.isArray(rawData)) {
    list = rawData;
  } else if (rawData && typeof rawData === 'object') {
    list = rawData.userGroups || rawData.user_groups || rawData.policys || [];
  }
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

/** Response từ GET /policys/:id — gateway trả về { data } hoặc policy trực tiếp */
const policyDetailRes = (res: unknown): Policy | null => {
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

export const policyApi = {
  getPolicys: async (): Promise<Policy[]> => {
    const res = await apiClient.get("/policys");
    return policysListRes(res);
  },

  getPermissionMatrix: async (): Promise<Permission[]> => {
    const res = await apiClient.get("/resources");
    return permissionMatrixToFlat(res);
  },

  getPolicyById: async (id: number): Promise<Policy | null> => {
    const res = await apiClient.get(`/policys/${id}`);
    return policyDetailRes(res);
  },

  savePolicy: (data: Partial<Policy>) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description,
      policies: data.policies ?? [],
    };
    if (data.id) {
      return apiClient.put(`/policys/${data.id}`, { name: payload.name, description: payload.description, policies: payload.policies });
    }
    return apiClient.post("/policys", payload);
  },

  deletePolicy: (id: number) => apiClient.delete(`/policys/${id}`),
};
