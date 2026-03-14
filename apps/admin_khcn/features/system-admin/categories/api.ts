import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";
import { GROUP_KEYS } from "./constants";

export const categoryApi = {
  fetchAll: async (): Promise<CategoryItem[]> => {
    const results = await Promise.all(
      GROUP_KEYS.map(async (group) => {
        const res = await apiClient.get("/categories", { params: { group } });
        const list = Array.isArray(res) ? res : (Array.isArray((res as { data?: unknown[] })?.data) ? (res as { data: CategoryItem[] }).data : []);
        return (list as CategoryItem[]).map((item) => ({
          ...item,
          group: item.group || group,
        }));
      })
    );
    return results.flat();
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
};
