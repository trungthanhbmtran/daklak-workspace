/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";

export const categoryApi = {
  fetchAll: async (params?: any): Promise<{ data: CategoryItem[]; meta: any }> => {
    try {
      const res: any = await apiClient.get("/categories", { params });
      return {
        data: Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []),
        meta: res?.meta || {},
      };
    } catch (error) {
      console.error("[categoryApi] fetchAll error:", error);
      return { data: [], meta: {} };
    }
  },

  fetchByGroup: async (group: string, params?: any): Promise<{ data: CategoryItem[]; meta: any }> => {
    try {
      const res: any = await apiClient.get(`/categories`, { params: { group, ...params } });
      return {
        data: Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []),
        meta: res?.meta || {},
      };
    } catch (error) {
      console.error(`[categoryApi] fetchByGroup ${group} error:`, error);
      return { data: [], meta: {} };
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
      return res.data;
    } catch (err) {
      console.error("[categoryApi] fetchGroups error:", err);
      return [];
    }
  },
};
