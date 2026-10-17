import apiClient from "@/lib/axiosInstance";
import { unwrapData } from "@/lib/api-helper";
import { MenuItem } from "./types";

/** Chuẩn hóa payload gửi backend (PBAC) */
function toMenuPayload(data: Partial<MenuItem>) {
  const { requiredPermissionIds, requiredPermissionId, ...rest } = data as any;
  return rest;
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
  getMenus: (q?: string) => apiClient.get<MenuItem[]>("/menus", { params: { q: q || undefined } }),
  getMenuTree: (q?: string) => apiClient.get("/menus/tree", { params: { q: q || undefined } }).then((r) => unwrapData<MenuItem[]>(r, [])),
  /** Menu sidebar theo user đăng nhập (cây, chỉ mục user có quyền) */
  getMyMenus: (app = "ADMIN_PORTAL") =>
    apiClient.get("/menus/me", { params: { app } }).then((r) => unwrapData<MenuNode[]>(r, [])),

  /** Hub Apps: Danh sách phân hệ (card Hub) theo PBAC của user */
  getHubApps: (app = "ADMIN_PORTAL") =>
    apiClient.get("/menus/hub", { params: { app } }).then((r) => unwrapData<any[]>(r, [])),

  /** Sidebar: Lấy menu items của 1 service theo code (lazy load khi vào service) */
  getServiceSidebar: (code: string, app = "ADMIN_PORTAL") =>
    apiClient.get("/menus/sidebar", { params: { code, app } }).then((r) => unwrapData<any>(r, null)),

  saveMenu: (data: Partial<MenuItem>) => {
    const payload = toMenuPayload(data);
    if (data.id) return apiClient.put(`/menus/${data.id}`, payload);
    return apiClient.post("/menus", payload);
  },
  deleteMenu: (id: number) => apiClient.delete(`/menus/${id}`),
};
