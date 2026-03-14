import apiClient from "@/lib/axiosInstance";
import { MenuItem } from "./types";

/** Chuẩn hóa payload gửi backend (PBAC): nhiều quyền = requiredPermissionIds[] */
function toMenuPayload(data: Partial<MenuItem> & { requiredPermissionId?: number }) {
  const requiredPermissionIds = data.requiredPermissionIds?.length
    ? data.requiredPermissionIds
    : (data.requiredPermissionId != null && data.requiredPermissionId !== 0 ? [data.requiredPermissionId] : []);
  const { requiredPermissionId, ...rest } = data;
  return {
    ...rest,
    requiredPermissionIds,
  };
}

/** Node menu từ API /menus/me (cây theo quyền user) */
export interface MenuNode {
  id: number;
  code: string;
  name: string;
  route: string;
  icon: string;
  order: number;
  service: string;
  application?: string;
  parentId?: number;
  isActive?: boolean;
  /** Mô tả card Hub (từ cấu hình menu) */
  description?: string | null;
  /** Màu icon hex (từ cấu hình menu); null = màu gốc */
  iconColor?: string | null;
  children?: MenuNode[];
}

export const menuApi = {
  getMenus: () => apiClient.get<MenuItem[]>("/menus"),
  /** Menu sidebar theo user đăng nhập (cây, chỉ mục user có quyền) */
  getMyMenus: (app = "ADMIN_PORTAL") =>
    apiClient.get<{ items: MenuNode[] }>("/menus/me", { params: { app } }),
  saveMenu: (data: Partial<MenuItem>) => {
    const payload = toMenuPayload(data);
    if (data.id) return apiClient.put(`/menus/${data.id}`, payload);
    return apiClient.post("/menus", payload);
  },
  deleteMenu: (id: number) => apiClient.delete(`/menus/${id}`),
};
