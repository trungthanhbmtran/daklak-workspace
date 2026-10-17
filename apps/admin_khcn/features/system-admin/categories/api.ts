/* eslint-disable @typescript-eslint/no-explicit-any */
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import { CategoryItem, CategoryPayload } from "./types";

export const categoryApi = {
  fetchAll: async (params?: any): Promise<{ data: CategoryItem[]; meta: any }> => {
    try {
      const res: any = await apiClient.get("/categories", { params });
      return {
        data: unwrapData<CategoryItem[]>(res, []),
        meta: res?.meta || {},
      };
    } catch {
      return { data: [], meta: {} };
    }
  },

  fetchByGroup: async (group: string, params?: any): Promise<{ data: CategoryItem[]; meta: any }> => {
    try {
      const res: any = await apiClient.get(`/categories`, { params: { group, ...params } });
      return {
        data: unwrapData<CategoryItem[]>(res, []),
        meta: res?.meta || {},
      };
    } catch {
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
      return unwrapData<{ code: string; name: string }[]>(res, []);
    } catch {
      return [];
    }
  },
};
