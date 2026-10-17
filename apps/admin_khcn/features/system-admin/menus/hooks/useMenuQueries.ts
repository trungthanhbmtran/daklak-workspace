import { useQuery } from "@tanstack/react-query";
import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import { menuApi } from "../api";
import { menuKeys } from "../keys";
import { MenuItem, PbacResource } from "../types";

export function useMenuFlatListQuery(q?: string) {
  return useQuery({
    queryKey: [...menuKeys.lists(), { q }],
    queryFn: async () => {
      const res = await menuApi.getMenus(q);
      return unwrapData<MenuItem[]>(res, []);
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
  const list = unwrapData<PbacResource[]>(res, []);
  return list.sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
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
