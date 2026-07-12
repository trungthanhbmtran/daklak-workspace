import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";
import { menuApi } from "../api";
import { menuKeys } from "../keys";
import { MenuItem, PbacResource } from "../types";

export function useMenuFlatListQuery(q?: string) {
  return useQuery({
    queryKey: [...menuKeys.lists(), { q }],
    queryFn: async () => {
      const res = await menuApi.getMenus(q);
      const list = Array.isArray(res) ? res : (res as { data?: MenuItem[] })?.data;
      return (list ?? []) as MenuItem[];
    },
  });
}

export function useMenuTreeQuery(q?: string) {
  return useQuery({
    queryKey: [...menuKeys.lists(), "tree", { q }],
    queryFn: () => menuApi.getMenuTree(q),
  });
}

async function fetchResources(): Promise<PbacResource[]> {
  const res = await apiClient.get("/resources");
  const list = Array.isArray(res) ? res : (res as { data?: PbacResource[] })?.data ?? [];
  return (list as PbacResource[]).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export function usePbacResourcesQuery(enabled = false) {
  return useQuery({
    queryKey: ["pbac", "resources"],
    queryFn: fetchResources,
    enabled,
    staleTime: 10 * 60 * 1000,
    gcTime: 20 * 60 * 1000,
  });
}
