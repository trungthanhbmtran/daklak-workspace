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
  Calendar,
  CheckSquare,
  BarChart2,
  Mail,
  Send,
  Inbox,
  Layers,
  Globe,
  Eye,
  ClipboardList,
  Tag,
  Image,
  MessageSquare,
  Menu,
  Database,
  GitBranch,
  UserCircle,
  type LucideIcon,
} from "lucide-react";
import { menuApi, type MenuNode } from "@/features/system-admin/menus/api";

// ----------------------------------------------------------------------
// 1. ICON MAP — hỗ trợ cả Ionicons-style (cũ) và PascalCase Lucide (mới)
// ----------------------------------------------------------------------

const ICON_MAP: Record<string, LucideIcon> = {
  // === Ionicons-style (Section 1 menus) ===
  "grid-outline": LayoutDashboard,
  "apps-outline": LayoutDashboard,
  "people-outline": Users,
  "person-outline": Users,
  "lock-closed-outline": KeyRound,
  "shield-checkmark-outline": ShieldCheck,
  "list-outline": ListTree,
  "megaphone-outline": ListTree,
  "calendar-outline": Calendar,
  "layers-outline": Layers,
  "bar-chart-outline": BarChart2,
  "globe-outline": Globe,
  "folder-outline": Settings2,
  "cog-outline": Settings2,
  "settings-outline": Settings2,
  "settings-2-outline": Settings2,
  "apartment": Building2,
  "document-text-outline": FileText,
  "document-outline": FileText,
  "document-attach-outline": FileText,
  "briefcase-outline": CheckSquare,
  "newspaper-outline": Newspaper,
  "git-network-outline": GitBranch,

  // === PascalCase Lucide (Standard Menus — Section 2) ===
  "LayoutDashboard": LayoutDashboard,
  "Users": Users,
  "Settings": Settings2,
  "Settings2": Settings2,
  "ShieldCheck": ShieldCheck,
  "KeyRound": KeyRound,
  "FileText": FileText,
  "Newspaper": Newspaper,
  "Calendar": Calendar,
  "CheckSquare": CheckSquare,
  "BarChart2": BarChart2,
  "Mail": Mail,
  "Send": Send,
  "Inbox": Inbox,
  "Layers": Layers,
  "Globe": Globe,
  "Eye": Eye,
  "ClipboardList": ClipboardList,
  "Tag": Tag,
  "Image": Image,
  "MessageSquare": MessageSquare,
  "Menu": Menu,
  "Database": Database,
  "ListTree": ListTree,
  "GitBranch": GitBranch,
  "Building2": Building2,
  "UserCircle": UserCircle,
};

const getIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) return LayoutDashboard;
  return ICON_MAP[iconName.trim()] ?? LayoutDashboard;
};

// ----------------------------------------------------------------------
// 2. FETCH & NORMALIZE — biến { items: TreeNode[] } thành hubApps + sidebarMenus
// ----------------------------------------------------------------------

const fetchAndNormalizeMenus = async (): Promise<any> => {
  const res: any = await menuApi.getMyMenus("ADMIN_PORTAL");
  const data = res?.data ?? res;

  // Backend trả { items: MenuNode[] } — cây đã được lọc theo PBAC
  const rawItems: MenuNode[] = data?.items ?? [];

  // Root items: parentId === 0 hoặc không có parentId
  const roots = rawItems.filter((item: any) => !item.parentId || item.parentId === 0);

  // === hubApps: Danh sách phân hệ cho trang Hub ===
  const hubApps = roots.map((root: any) => {
    // Nếu root có route → dùng trực tiếp
    // Nếu không → lấy route của item con đầu tiên
    const firstChildHref = root.children?.[0]?.route ?? '';
    const href = root.route || firstChildHref;

    return {
      id: String(root.id),
      title: root.name,
      desc: root.description ?? '',
      href,
      icon: root.icon ?? '',
      iconColor: root.iconColor ?? null,
      disabled: root.isActive === false,
    };
  }).filter((app: any) => app.href); // Chỉ hiển thị phân hệ có route (có thể truy cập)

  // === sidebarMenus: Menu sidebar theo phân hệ ===
  const sidebarMenus = roots.map((root: any) => {
    const basePath = root.route || root.children?.[0]?.route?.split('/').slice(0, 2).join('/') || '';
    return {
      serviceCode: root.code,
      serviceName: root.name,
      serviceIcon: root.icon ?? '',
      basePath,
      items: (root.children ?? []).map((child: any) => ({
        name: child.name,
        href: child.route ?? '',
        icon: child.icon ?? '',
        order: child.order ?? 0,
      })),
    };
  });

  return { hubApps, sidebarMenus, items: rawItems };
};

// ----------------------------------------------------------------------
// 3. HOOKS
// ----------------------------------------------------------------------

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
  let sidebar = data?.sidebarMenus?.find(
    (s: any) => s.basePath && (pathname === s.basePath || pathname.startsWith(`${s.basePath}/`))
  );
  if (!sidebar) {
    sidebar = data?.sidebarMenus?.find((s: any) =>
      s.items?.some((item: any) => pathname === item.href || pathname.startsWith(`${item.href}/`))
    );
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
 * Hook cho Hub: Hiển thị danh sách các phân hệ (Service Cards) từ PBAC menu của user
 */
export function useHubServices() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "me", "ADMIN_PORTAL"],
    queryFn: fetchAndNormalizeMenus,
  });

  const apps = (data?.hubApps ?? []).map((app: any) => ({
    ...app,
    icon: getIcon(app.icon),
  }));

  return { apps, isLoading, isError };
}
