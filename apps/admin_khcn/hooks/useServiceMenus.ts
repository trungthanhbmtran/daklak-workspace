"use client";

import { usePathname } from "next/navigation";

import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard,
  Users,
  KeyRound,
  ListTree,
  Settings2,
  Building2,
  ShieldCheck,
  FileText,
  Newspaper,
  type LucideIcon,
} from "lucide-react";
import { menuApi, type MenuNode } from "@/features/system-admin/menus/api";

// ----------------------------------------------------------------------
// 1. HELPER FUNCTIONS (XỬ LÝ DATA)
// ----------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  "grid-outline": LayoutDashboard,
  "apps-outline": LayoutDashboard,
  "people-outline": Users,
  "person-outline": Users,
  "lock-closed-outline": KeyRound,
  "shield-checkmark-outline": ShieldCheck,
  "list-outline": ListTree,
  "megaphone-outline": ListTree,
  "calendar-outline": ListTree,
  "layers-outline": ListTree,
  "bar-chart-outline": ListTree,
  "globe-outline": ListTree,
  "folder-outline": Settings2,
  "cog-outline": Settings2,
  "settings-outline": Settings2,
  "apartment": Building2,
  "document-text-outline": FileText,
  "document-outline": FileText,
  "document-attach-outline": FileText,
  "newspaper-outline": Newspaper,
};

const getIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) return LayoutDashboard;
  return ICON_MAP[iconName.trim()] ?? LayoutDashboard;
};

/** Lấy danh sách menu chuẩn từ API và lấy luôn metadata */
const fetchAndNormalizeMenus = async (): Promise<any> => {
  const res: any = await menuApi.getMyMenus("ADMIN_PORTAL");
  const data = res?.data ?? res;
  return data;
};

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  order: number;
}

/**
 * Hook cho Sidebar: Tự động nhận diện phân hệ hiện tại dựa vào đường dẫn (pathname)
 */
export function useServiceMenus() {
  const pathname = usePathname() || "";
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "me", "ADMIN_PORTAL"],
    queryFn: fetchAndNormalizeMenus,
  });

  // Tìm sidebar tương ứng với pathname
  let sidebar = data?.sidebarMenus?.find((s: any) => s.basePath && (pathname === s.basePath || pathname.startsWith(`${s.basePath}/`)));
  if (!sidebar) {
    sidebar = data?.sidebarMenus?.find((s: any) => s.items?.some((item: any) => pathname === item.href || pathname.startsWith(`${item.href}/`)));
  }

  let menuItems: SidebarItem[] = [];
  if (sidebar?.items) {
    menuItems = sidebar.items.map((item: any) => ({
      ...item,
      icon: getIcon(item.icon),
    }));
  }

  return {
    menuItems,
    serviceName: sidebar?.serviceName ?? "Phân hệ",
    serviceIcon: getIcon(sidebar?.serviceIcon),
    serviceCode: sidebar?.serviceCode ?? "",
    isLoading,
    isError,
  };
}

/**
 * Hook cho Hub: Hiển thị danh sách các phân hệ (Service Cards) tự động từ DB
 */
export function useHubServices() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "me", "ADMIN_PORTAL"],
    queryFn: fetchAndNormalizeMenus,
  });

  const currentUser = data?.meta?.currentUser;

  const apps = (data?.hubApps ?? []).map((app: any) => ({
    ...app,
    icon: getIcon(app.icon),
  }));

  return { apps, currentUser, isLoading, isError };
}
