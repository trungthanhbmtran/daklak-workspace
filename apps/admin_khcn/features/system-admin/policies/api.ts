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

export const policyApi = {
  getPolicys: async (): Promise<Policy[]> => {
    const res: any = await apiClient.get("/policys");
    return res.data || [];
  },

  getPermissionMatrix: async (): Promise<Permission[]> => {
    const res: any = await apiClient.get("/resources");
    return res.data || [];
  },

  getPolicyById: async (id: number): Promise<Policy | null> => {
    const res: any = await apiClient.get(`/policys/${id}`);
    return res.data || null;
  },

  savePolicy: (data: Partial<Policy>) => {
    const payload = {
      code: data.code,
      name: data.name,
      description: data.description,
      policies: data.policies || [],
    };
    if (data.id) {
      return apiClient.put(`/policys/${data.id}`, payload);
    }
    return apiClient.post("/policys", payload);
  },

  deletePolicy: (id: number) => apiClient.delete(`/policys/${id}`),
};
