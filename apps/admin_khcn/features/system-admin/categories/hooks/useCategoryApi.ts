/* eslint-disable @typescript-eslint/no-explicit-any */
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryApi } from "../api";
import { CategoryPayload } from "../types";
import { CATEGORY_KEYS } from "../keys";

export function useGetCategories(params?: any) {
  return useQuery({
    queryKey: [CATEGORY_KEYS.all, params],
    queryFn: async () => {
      const res = await categoryApi.fetchAll(params);
      return res.data; // Return array to maintain compatibility
    },
    staleTime: 5 * 60 * 1000,
  });
}

export function useGetCategoryByGroup(group: string, params?: any) {
  return useQuery({
    queryKey: [CATEGORY_KEYS.all, "group", group, params],
    queryFn: async () => {
      const res = await categoryApi.fetchByGroup(group, params);
      return res.data; // Return array to maintain compatibility
    },
    staleTime: 5 * 60 * 1000,
    enabled: !!group,
  });
}

export function useGetPaginatedCategoryByGroup(group: string, params?: any) {
  return useQuery({
    queryKey: [CATEGORY_KEYS.all, "group", "paginated", group, params],
    queryFn: () => categoryApi.fetchByGroup(group, params),
    staleTime: 5 * 60 * 1000,
    enabled: !!group,
  });
}

export function useGetCategoryGroups() {
  return useQuery({
    queryKey: [CATEGORY_KEYS.all, "groups"],
    queryFn: categoryApi.fetchGroups,
    staleTime: 10 * 60 * 1000,
  });
}

export function useCreateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.create,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success("Đã thêm danh mục.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể thêm danh mục.";
      toast.error(message);
    },
  });
}

export function useUpdateCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: CategoryPayload }) => categoryApi.update(id, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success("Đã cập nhật danh mục.");
    },
    onError: (error: any) => {
      const message = error.response?.data?.message || "Không thể cập nhật danh mục.";
      toast.error(message);
    },
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onMutate: async (id: number) => {
      await queryClient.cancelQueries({ queryKey: CATEGORY_KEYS.all });
      const previous = queryClient.getQueriesData({ queryKey: CATEGORY_KEYS.all });
      
      // Optimistic delete across all category queries
      queryClient.setQueriesData({ queryKey: CATEGORY_KEYS.all }, (oldData: any) => {
        if (!oldData) return oldData;
        if (Array.isArray(oldData)) return oldData.filter((item: any) => item.id !== id);
        if (oldData.data && Array.isArray(oldData.data)) return { ...oldData, data: oldData.data.filter((item: any) => item.id !== id) };
        return oldData;
      });

      return { previous };
    },
    onError: (err: any, id, context) => {
      if (context?.previous) {
        context.previous.forEach(([queryKey, data]) => {
          queryClient.setQueryData(queryKey, data);
        });
      }
      const msg = err?.response?.data?.message || err?.message || "Không thể xóa danh mục.";
      toast.error(msg);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
    },
    onSuccess: () => {
      toast.success("Đã xóa danh mục.");
    },
  });
}
