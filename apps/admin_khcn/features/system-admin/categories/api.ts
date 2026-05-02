import apiClient from "@/lib/axiosInstance";
import { CategoryItem, CategoryPayload } from "./types";
import { GROUP_KEYS } from "./constants";

export const categoryApi = {
  fetchAll: async (): Promise<CategoryItem[]> => {
    // 1. Lấy danh sách groups từ server trước
    let groups: { code: string; name: string }[] = [];
    try {
      groups = await categoryApi.fetchGroups();
    } catch (err) {
      console.error("Failed to fetch groups, fallback to empty list", err);
      groups = [];
    }

    if (groups.length === 0) return [];

    // 2. Lấy data cho từng group
    const results = await Promise.allSettled(
      groups.map(async (group) => {
        try {
          const res: any = await apiClient.get("/categories", { params: { group } });
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
