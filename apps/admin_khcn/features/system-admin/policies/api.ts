import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import { Policy, Permission } from "./types";

export const policyApi = {
  getPolicys: async (): Promise<Policy[]> => {
    const res: any = await apiClient.get("/policys");
    return unwrapData<Policy[]>(res, []);
  },

  getPermissionMatrix: async (): Promise<Permission[]> => {
    const res: any = await apiClient.get("/resources/permission-matrix");
    return unwrapData<Permission[]>(res, []);
  },

  getPolicyById: async (id: number): Promise<Policy | null> => {
    const res: any = await apiClient.get(`/policys/${id}`);
    const data = unwrapData<any>(res, null);
    if (data && Array.isArray(data.policies)) {
      data.policies = data.policies.map((p: any) => ({
        ...p,
        resourceCode: p.resourceCode || p.resource_code || p.resource?.code || "",
        resourceId: p.resourceId || p.resource_id,
        action: p.action,
        effect: p.effect || "ALLOW",
        conditions: p.conditions || { expression: "" },
      }));
    }
    return data;
  },

  savePolicy: (data: Partial<Policy>) => {
    const payload = {
      name: data.name,
      code: data.code,
      description: data.description,
      policies: (data.policies || []).map((p) => ({
        resourceId: p.resourceId,
        action: p.action,
        effect: p.effect || "ALLOW",
        conditions: p.conditions?.expression ? p.conditions : undefined,
      })),
    };
    if (data.id) {
      return apiClient.put(`/policys/${data.id}`, payload);
    }
    return apiClient.post("/policys", payload);
  },

  deletePolicy: (id: number) => apiClient.delete(`/policys/${id}`),
};
