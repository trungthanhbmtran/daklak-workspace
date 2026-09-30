/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { Policy, Permission } from "./types";

export const policyApi = {
  getPolicys: async (): Promise<Policy[]> => {
    const res: any = await apiClient.get("/policys");
    return res.data || [];
  },

  getPermissionMatrix: async (): Promise<Permission[]> => {
    const res: any = await apiClient.get("/resources/permission-matrix");
    return res.data || [];
  },

  getPolicyById: async (id: number): Promise<Policy | null> => {
    const res: any = await apiClient.get(`/policys/${id}`);
    if (res?.data?.policies) {
      res.data.policies = res.data.policies.map((p: any) => ({
        ...p,
        resourceCode: p.resourceCode || p.resource_code || p.resource?.code || "",
        resourceId: p.resourceId || p.resource_id,
      }));
    }
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
