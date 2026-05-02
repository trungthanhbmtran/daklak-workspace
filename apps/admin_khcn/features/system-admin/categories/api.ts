import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";
import { GROUP_KEYS } from "./constants";

export const categoryApi = {
  fetchAll: async (): Promise<CategoryItem[]> => {
    try {
      // 1. Lấy danh sách groups từ server
      const groups = await categoryApi.fetchGroups();
      if (!groups || groups.length === 0) return [];

      // 2. Lấy data cho từng group song song
      const results = await Promise.allSettled(
        groups.map(async (g) => {
          const res: any = await apiClient.get("/categories", { params: { group: g.code } });
          // Bóc tách data an toàn dựa trên cấu trúc chuẩn của Gateway { success, data }
          const list = Array.isArray(res?.data) ? res.data : (Array.isArray(res) ? res : []);

          return list.map((item: any) => ({
            ...item,
            group: item.group || g.code,
            sort: item.sort ?? item.order ?? 0, // Đảm bảo luôn có sort
            active: item.active ?? (item.isActive ? 1 : 0), // Đảm bảo luôn có active
          }));
        })
      );

      return results
        .filter((r): r is PromiseFulfilledResult<CategoryItem[]> => r.status === 'fulfilled')
        .flatMap(r => r.value);
    } catch (err) {
      console.error("[categoryApi] fetchAll error:", err);
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
