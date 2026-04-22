import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";
import { GROUP_KEYS } from "./constants";

export const categoryApi = {
  fetchAll: async (): Promise<CategoryItem[]> => {
    // Sử dụng allSettled để nếu một nhóm lỗi thì các nhóm khác vẫn chạy
    const results = await Promise.allSettled(
      GROUP_KEYS.map(async (group) => {
        try {
          const res: any = await apiClient.get("/categories", { params: { group } });
          // Bóc tách data: res có thể là array hoặc { data: [] } (do gateway interceptor)
          const list = Array.isArray(res) ? res : (res?.data && Array.isArray(res.data) ? res.data : []);
          
          return list.map((item: any) => ({
            ...item,
            group: item.group || group,
          }));
        } catch (error) {
          console.error(`Error fetching category group ${group}:`, error);
          return [];
        }
      })
    );
    
    return results
      .filter((r): r is PromiseFulfilledResult<CategoryItem[]> => r.status === 'fulfilled')
      .map(r => r.value)
      .flat();
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
