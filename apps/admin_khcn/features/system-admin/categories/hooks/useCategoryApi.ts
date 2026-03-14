import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { categoryApi } from "../api";
import { CategoryPayload } from "../types";
import { CATEGORY_KEYS } from "../keys";

export function useGetCategories() {
  return useQuery({
    queryKey: CATEGORY_KEYS.all,
    queryFn: categoryApi.fetchAll,
    staleTime: 5 * 60 * 1000, // Tùy chọn: Cache 5 phút
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
    onError: () => toast.error("Không thể thêm danh mục."),
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
    onError: () => toast.error("Không thể cập nhật danh mục."),
  });
}

export function useDeleteCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: categoryApi.delete,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: CATEGORY_KEYS.all });
      toast.success("Đã xóa danh mục.");
    },
    onError: (err: any) => {
      const msg = err?.response?.data?.message || err?.message || "Không thể xóa danh mục.";
      toast.error(msg);
    },
  });
}
