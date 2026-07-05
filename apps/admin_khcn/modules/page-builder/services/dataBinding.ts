import { useQuery } from "@tanstack/react-query";
import { organizationApi } from "@/features/system-admin/organization/api";
import { hrmApi } from "@/features/hrm/api";
import apiClient from "@/lib/axiosInstance";

// Cache stale time configuration: 5 minutes
const STALE_TIME = 5 * 60 * 1000;

export const useOrganizationTreeQuery = () => {
  return useQuery({
    queryKey: ["organizations-tree"],
    queryFn: async () => {
      try {
        return await organizationApi.getTree();
      } catch (e) {
        console.error("Failed to fetch organization tree, returning empty array", e);
        return [];
      }
    },
    staleTime: STALE_TIME,
  });
};

export const useHrmEmployeesQuery = () => {
  return useQuery({
    queryKey: ["hrm-employees"],
    queryFn: async () => {
      try {
        const res = await hrmApi.list({ pageSize: 1000 });
        return res?.data || [];
      } catch (e) {
        console.error("Failed to fetch HRM employees, returning empty array", e);
        return [];
      }
    },
    staleTime: STALE_TIME,
  });
};

export const useCategoriesQuery = () => {
  return useQuery({
    queryKey: ["portal-categories"],
    queryFn: async () => {
      try {
        const res: any = await apiClient.get("/categories");
        return Array.isArray(res?.data) ? res.data : [];
      } catch (error) {
        console.error("Failed to fetch categories, returning empty array", error);
        return [];
      }
    },
    staleTime: STALE_TIME,
  });
};

/**
 * Utility function to flatten a hierarchical tree into a flat array of nodes.
 */
export function flattenOrgTree(nodes: any[]): any[] {
  if (!Array.isArray(nodes)) return [];
  let result: any[] = [];
  nodes.forEach((node) => {
    result.push(node);
    if (node.children && node.children.length > 0) {
      result = result.concat(flattenOrgTree(node.children));
    }
  });
  return result;
}
