import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";
import { GROUP_KEYS } from "./constants";

export const categoryApi = {
  fetchAll: async (): Promise<CategoryItem[]> => {
    try {
      const res: any = await apiClient.get("/categories");
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("[categoryApi] fetchAll error:", error);
      return [];
    }
  },

  fetchByGroup: async (group: string): Promise<CategoryItem[]> => {
    try {
      const res: any = await apiClient.get(`/categories`, { params: { group } });
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    } catch (error) {
      console.error(`[categoryApi] fetchByGroup ${group} error:`, error);
      return [];
    }
  },

  create: async (payload: CategoryPayload) => {
    return apiClient.post("/categories", payload);
  },

  update: async (id: number, payload: CategoryPayload) => {
    return apiClient.put(`/categories/${id}`, payload);
  },

  delete: async (id: number) => {
    return apiClient.delete(`/categories/${id}`);
  },

  fetchGroups: async (): Promise<{ code: string; name: string }[]> => {
    try {
      const res: any = await apiClient.get("/categories/groups");
      console.log("[categoryApi] fetchGroups raw response:", res);
      return res?.data || [];
    } catch (err) {
      console.error("[categoryApi] fetchGroups error:", err);
      return [];
    }
  },
};
