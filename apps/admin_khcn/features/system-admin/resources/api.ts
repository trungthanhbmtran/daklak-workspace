/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import type { Resource } from "./types";

export const resourceApi = {
  getResources: async (): Promise<Resource[]> => {
    const res: any = await apiClient.get("/resources");
    return unwrapData<Resource[]>(res, []);
  },

  createResource: (payload: { code: string; name: string; serviceCode?: string }) =>
    apiClient.post<{ id: number; code: string; name: string; serviceCode?: string }>("/resources", payload),

  updateResource: (id: number, payload: { code?: string; name?: string }) =>
    apiClient.put<{ id: number; code: string; name: string }>(`/resources/${id}`, payload),

  deleteResource: (id: number) =>
    apiClient.delete<{ success: boolean; message?: string }>(`/resources/${id}`),
};
