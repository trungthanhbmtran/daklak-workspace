"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import {
  LayoutDashboard, Users, KeyRound, ListTree, Settings2, Building2,
  ShieldCheck, FileText, Newspaper, Calendar, CheckSquare, BarChart2,
  Mail, Send, Inbox, Layers, Globe, Eye, ClipboardList, Tag, Image,
  MessageSquare, Menu, Database, GitBranch, UserCircle, type LucideIcon,
} from "lucide-react";
import { menuApi } from "@/features/system-admin/menus/api";

// ----------------------------------------------------------------------
// 1. ICON MAP — hỗ trợ cả Ionicons-style (cũ) và PascalCase Lucide (mới)
// ----------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  // Ionicons-style
  "grid-outline": LayoutDashboard, "apps-outline": LayoutDashboard,
  "people-outline": Users, "person-outline": Users,
  "lock-closed-outline": KeyRound, "shield-checkmark-outline": ShieldCheck,
  "list-outline": ListTree, "megaphone-outline": ListTree,
  "calendar-outline": Calendar, "layers-outline": Layers,
  "bar-chart-outline": BarChart2, "globe-outline": Globe,
  "folder-outline": Settings2, "cog-outline": Settings2,
  "settings-outline": Settings2, "settings-2-outline": Settings2,
  "apartment": Building2, "document-text-outline": FileText,
  "document-outline": FileText, "document-attach-outline": FileText,
  "briefcase-outline": CheckSquare, "newspaper-outline": Newspaper,
  "git-network-outline": GitBranch,
  // PascalCase Lucide (Standard Menus)
  "LayoutDashboard": LayoutDashboard, "Users": Users, "Settings": Settings2,
  "Settings2": Settings2, "ShieldCheck": ShieldCheck, "KeyRound": KeyRound,
  "FileText": FileText, "Newspaper": Newspaper, "Calendar": Calendar,
  "CheckSquare": CheckSquare, "BarChart2": BarChart2, "Mail": Mail,
  "Send": Send, "Inbox": Inbox, "Layers": Layers, "Globe": Globe,
  "Eye": Eye, "ClipboardList": ClipboardList, "Tag": Tag, "Image": Image,
  "MessageSquare": MessageSquare, "Menu": Menu, "Database": Database,
  "ListTree": ListTree, "GitBranch": GitBranch, "Building2": Building2,
  "UserCircle": UserCircle,
};

export const getIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) return LayoutDashboard;
  return ICON_MAP[iconName.trim()] ?? LayoutDashboard;
};

// ----------------------------------------------------------------------
// 2. TYPES
// ----------------------------------------------------------------------
export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  order: number;
}

export interface HubApp {
  id: string;
  title: string;
  desc: string;
  href: string;
  icon: LucideIcon;
  iconColor: string | null;
  disabled: boolean;
}

// ----------------------------------------------------------------------
// 3. HOOK: useHubServices — Trang Hub, gọi /menus/hub (nhẹ, không sidebar)
// ----------------------------------------------------------------------
export function useHubServices() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "hub"],
    queryFn: async () => {
      // Backend (Gateway) tính toán hubApps theo PBAC của user
      const res: any = await menuApi.getHubApps("ADMIN_PORTAL");
      return res?.apps ?? res?.data?.apps ?? [];
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  const apps: HubApp[] = (data ?? []).map((app: any) => ({
    ...app,
    icon: getIcon(app.icon),
  }));

  return { apps, isLoading, isError };
}

// ----------------------------------------------------------------------
// 4. HOOK: useServiceMenus — Sidebar, load lazy khi user vào service
// Tự nhận diện serviceCode từ pathname, gọi /menus/sidebar?code=X
// ----------------------------------------------------------------------

/** Map route prefix → serviceCode (phải khớp với menu group trong seed) */
const ROUTE_TO_SERVICE: Record<string, string> = {
  "/hrm": "HRM_GROUP",
  "/system": "SYS_GROUP",
  "/documents": "DOC_GROUP",
  "/content": "CONTENT_GROUP",
  "/workflow": "WORKFLOW_GROUP",
};

function getServiceCodeFromPath(pathname: string): string | null {
  for (const [prefix, code] of Object.entries(ROUTE_TO_SERVICE)) {
    if (pathname === prefix || pathname.startsWith(`${prefix}/`)) {
      return code;
    }
  }
  return null;
}

export function useServiceMenus() {
  const pathname = usePathname() || "";
  const serviceCode = getServiceCodeFromPath(pathname);

  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "sidebar", serviceCode],
    queryFn: async () => {
      if (!serviceCode) return null;
      // Backend (Gateway) trả sidebar items của đúng service theo PBAC
      const res: any = await menuApi.getServiceSidebar(serviceCode, "ADMIN_PORTAL");
      return res?.sidebar ?? res?.data?.sidebar ?? null;
    },
    enabled: !!serviceCode, // Chỉ gọi khi đã biết service
    staleTime: 5 * 60 * 1000,
  });

  const sidebar = data;
  const menuItems: SidebarItem[] = (sidebar?.items ?? []).map((item: any) => ({
    ...item,
    icon: getIcon(item.icon),
  }));

  return {
    menuItems,
    serviceName: sidebar?.serviceName ?? "Phân hệ",
    serviceIcon: getIcon(sidebar?.serviceIcon),
    serviceCode: sidebar?.serviceCode ?? serviceCode ?? "",
    isLoading,
    isError,
  };
}
