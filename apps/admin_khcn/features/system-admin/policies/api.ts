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

const parsePolicy = (row: any): Policy => ({
  id: Number(row.id),
  code: String(row.code ?? ""),
  name: String(row.name ?? ""),
  description: String(row.description ?? ""),
  active: 1,
  policies: (row.policies || []).map((p: any) => ({
    id: p.id,
    resourceId: p.resourceId,
    resourceCode: p.resourceCode || "",
    action: p.action,
    effect: p.effect,
    conditions: p.conditions,
  })),
});

const policysListRes = (res: any): Policy[] => {
  const data = res?.data ?? res;
  return (data?.userGroups || []).map(parsePolicy);
};

/** Response từ GET /resources — gateway trả về danh sách resource */
const permissionMatrixToFlat = (res: any): Permission[] => {
  const data = res?.data ?? res;
  const resources = data?.resources || [];
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
const policyDetailRes = (res: any): Policy | null => {
  const data = res?.data ?? res;
  if (!data || !data.id) return null;
  return parsePolicy(data);
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
