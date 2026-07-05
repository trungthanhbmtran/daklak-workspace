import apiClient from "@/lib/axiosInstance";
import type { Resource } from "./types";

export const resourceApi = {
  getResources: async (): Promise<Resource[]> => {
    const res = await apiClient.get("/resources");
    const data = (res as any)?.data ?? res;
    const list = Array.isArray(data) ? data : [];
    return list.map((r: any) => ({
      id: Number(r.id),
      code: String(r.code ?? ""),
      name: String(r.name ?? ""),
      serviceCode: String(r.serviceCode ?? ""),
    }));
  },

  createResource: (payload: { code: string; name: string; serviceCode?: string }) =>
    apiClient.post<{ id: number; code: string; name: string; serviceCode?: string }>("/resources", payload),

  updateResource: (id: number, payload: { code?: string; name?: string }) =>
    apiClient.put<{ id: number; code: string; name: string }>(`/resources/${id}`, payload),

  deleteResource: (id: number) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/resources/${id}`),
};
