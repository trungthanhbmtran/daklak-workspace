import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";
import { GROUP_KEYS } from "./constants";

export const categoryApi = {
  fetchAll: async (): Promise<CategoryItem[]> => {
    try {
      console.log("[categoryApi] fetchAll using optimized single endpoint...");
      // Gọi API lấy tất cả danh mục (không truyền group)
      const res: any = await apiClient.get("/categories");
      
      // Trả về trực tiếp mảng đã được chuẩn hóa từ Gateway
      return Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);
    } catch (error) {
      console.error("[categoryApi] fetchAll error:", error);
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
