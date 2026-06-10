import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";
import { menuApi } from "../api";
import { menuKeys } from "../keys";
import { MenuItem, PbacResource } from "../types";

/** Lấy danh sách PBAC Resources — dùng cho dropdown menu form */
async function fetchResources(): Promise<PbacResource[]> {
  const res = await apiClient.get("/resources");
  const list = Array.isArray(res) ? res : (res as { data?: PbacResource[] })?.data ?? [];
  return (list as PbacResource[]).sort((a, b) => (a.name ?? '').localeCompare(b.name ?? ''));
}

export function useMenuApi(needResources = false) {
  const queryClient = useQueryClient();

  // 1. Fetch Danh sách Menu — luôn fetch (cần để render tree sidebar)
  const { data: menus = [], isLoading: isLoadingMenus } = useQuery({
    queryKey: menuKeys.lists(),
    queryFn: async () => {
      const res = await menuApi.getMenus();
      const list = Array.isArray(res) ? res : (res as { data?: MenuItem[] })?.data;
      return (list ?? []) as MenuItem[];
    },
  });

  // 2. Fetch PBAC Resources — lazy: chỉ fetch khi mở form tạo/sửa menu
  //    Thay thế fetchPermissions (matrix) — đơn giản hơn nhiều (~20 resources thay vì ~200 permissions)
  const { data: resources = [], isLoading: isLoadingResources } = useQuery({
    queryKey: ["pbac", "resources"],
    queryFn: fetchResources,
    enabled: needResources,
    staleTime: 10 * 60 * 1000,  // 10 phút — resources ít thay đổi
    gcTime: 20 * 60 * 1000,
  });

  const getErrorMessage = (err: unknown): string => {
    const ax = err as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = ax?.response?.data?.message;
    if (Array.isArray(msg)) return msg[0] ?? "Lỗi không xác định";
    if (typeof msg === "string") return msg;
    return ax?.message ?? "Lỗi không xác định";
  };

  // 3. Mutations (Lưu / Xóa)
  const saveMutation = useMutation({
    mutationFn: menuApi.saveMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Lưu cấu hình menu thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  const deleteMutation = useMutation({
    mutationFn: menuApi.deleteMenu,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: menuKeys.all });
      toast.success("Đã xóa menu thành công!");
    },
    onError: (err) => toast.error(getErrorMessage(err)),
  });

  return {
    menus,
    isLoadingMenus,
    resources,
    isLoadingResources: isLoadingResources && needResources,
    saveMenu: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteMenu: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}
