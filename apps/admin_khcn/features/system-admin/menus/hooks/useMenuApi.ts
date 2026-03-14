import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import apiClient from "@/lib/axiosInstance";
import { menuApi } from "../api";
import { menuKeys } from "../keys";
import { MenuItem, Permission } from "../types";

/** Nhóm danh mục dùng chung: MICROSERVICE (ưu tiên) + SERVICE – khớp seed user-service */
const CATEGORY_GROUP_MICROSERVICE = "MICROSERVICE";
const CATEGORY_GROUP_SERVICE = "SERVICE";

export interface ServiceOption {
  code: string;
  name: string;
}

async function fetchCategoriesByGroup(group: string): Promise<{ code: string; name: string; order?: number }[]> {
  const res = await apiClient.get("/categories", { params: { group } });
  const list = Array.isArray(res) ? res : (res as { data?: unknown[] })?.data ?? [];
  return (list as { code?: string; name?: string; order?: number }[]).map((item) => ({
    code: item.code ?? "",
    name: item.name ?? item.code ?? "",
    order: item.order ?? 0,
  })).filter((item) => item.code);
}

// Hàm lấy Matrix Quyền
async function fetchPermissions(): Promise<Permission[]> {
  const res = await apiClient.get("/roles/permissions/matrix");
  const body = res as { data?: { resources?: unknown[] }; resources?: unknown[] };
  const raw = body?.data?.resources ?? body?.resources ?? [];
  const list = Array.isArray(raw) ? raw : [];
  const out: Permission[] = [];
  for (const r of list as { id: number; code: string; name: string; permissions?: { id: number; action: string }[] }[]) {
    for (const p of r.permissions ?? []) {
      out.push({
        id: p.id,
        module: r.name ?? r.code ?? "",
        action: p.action ?? "",
        code: `${r.code}:${p.action}`,
      });
    }
  }
  return out;
}

export function useMenuApi() {
  const queryClient = useQueryClient();

  // 1. Fetch Danh sách Menu
  const { data: menus = [], isLoading: isLoadingMenus } = useQuery({
    queryKey: menuKeys.lists(),
    queryFn: async () => {
      const res = await menuApi.getMenus();
      const list = Array.isArray(res) ? res : (res as { data?: MenuItem[] })?.data;
      return (list ?? []) as MenuItem[];
    },
  });

  // 2. Fetch Service options từ danh mục chung: MICROSERVICE + SERVICE (khớp seed)
  const { data: serviceOptions = [] } = useQuery({
    queryKey: ["categories", CATEGORY_GROUP_MICROSERVICE, CATEGORY_GROUP_SERVICE],
    queryFn: async (): Promise<ServiceOption[]> => {
      const [microList, serviceList] = await Promise.all([
        fetchCategoriesByGroup(CATEGORY_GROUP_MICROSERVICE),
        fetchCategoriesByGroup(CATEGORY_GROUP_SERVICE),
      ]);
      const byCode = new Map<string, ServiceOption>();
      [...microList, ...serviceList].forEach((item) => {
        if (!byCode.has(item.code)) byCode.set(item.code, { code: item.code, name: item.name });
      });
      return Array.from(byCode.values()).sort((a, b) => a.code.localeCompare(b.code));
    },
  });

  // 3. Fetch Permissions
  const { data: permissions = [] } = useQuery({
    queryKey: ["roles", "permissions", "matrix"],
    queryFn: fetchPermissions,
  });

  const getErrorMessage = (err: unknown): string => {
    const ax = err as { response?: { data?: { message?: string | string[] } }; message?: string };
    const msg = ax?.response?.data?.message;
    if (Array.isArray(msg)) return msg[0] ?? "Lỗi không xác định";
    if (typeof msg === "string") return msg;
    return ax?.message ?? "Lỗi không xác định";
  };

  // 4. Mutations (Lưu / Xóa) — PBAC: quyền gắn Permission, hiển thị lỗi từ backend
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
    serviceOptions,
    permissions,
    saveMenu: saveMutation.mutateAsync,
    isSaving: saveMutation.isPending,
    deleteMenu: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending
  };
}
