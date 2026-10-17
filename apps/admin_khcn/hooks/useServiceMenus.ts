/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import {
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Database,
  Eye,
  FileText,
  Folder,
  GitBranch,
  Globe,
  Grid,
  Headset,
  Image,
  Inbox,
  Info,
  KeyRound,
  Layers,
  LayoutDashboard,
  ListTree,
  Mail,
  Menu,
  MessageSquare,
  Network,
  Newspaper,
  Plug,
  Send,
  Settings,
  Settings2,
  ShieldCheck,
  User,
  UserCircle,
  Users,
  type LucideIcon,
} from "lucide-react";
import { menuApi } from "@/features/system-admin/menus/api";
import { unwrapData } from "@/lib/api-helper";

// ----------------------------------------------------------------------
// 1. STATIC ICON MAP — đồng bộ 100% không dùng dynamic imports / Suspense
// ----------------------------------------------------------------------
const ICON_MAP: Record<string, LucideIcon> = {
  // PascalCase
  Activity,
  ArrowLeft,
  ArrowRight,
  BarChart2,
  BarChart3,
  Bell,
  Briefcase,
  Building2,
  Calculator,
  Calendar,
  CalendarDays,
  CheckSquare,
  ClipboardList,
  Database,
  Eye,
  FileText,
  Folder,
  GitBranch,
  Globe,
  Grid,
  Headset,
  Image,
  Inbox,
  Info,
  KeyRound,
  Layers,
  LayoutDashboard,
  ListTree,
  Mail,
  Menu,
  MessageSquare,
  Network,
  Newspaper,
  Plug,
  Send,
  Settings,
  Settings2,
  ShieldCheck,
  User,
  UserCircle,
  Users,

  // kebab-case
  "activity": Activity,
  "bar-chart-2": BarChart2,
  "bar-chart-3": BarChart3,
  "barchart3": BarChart3,
  "bell": Bell,
  "briefcase": Briefcase,
  "building-2": Building2,
  "calculator": Calculator,
  "calendar": Calendar,
  "calendar-days": CalendarDays,
  "check-square": CheckSquare,
  "clipboard-list": ClipboardList,
  "database": Database,
  "eye": Eye,
  "file-text": FileText,
  "folder": Folder,
  "git-branch": GitBranch,
  "globe": Globe,
  "grid": Grid,
  "image": Image,
  "inbox": Inbox,
  "key-round": KeyRound,
  "layers": Layers,
  "layout-dashboard": LayoutDashboard,
  "list-tree": ListTree,
  "mail": Mail,
  "menu": Menu,
  "message-square": MessageSquare,
  "network": Network,
  "newspaper": Newspaper,
  "plug": Plug,
  "send": Send,
  "settings": Settings,
  "settings-2": Settings2,
  "shield-check": ShieldCheck,
  "user": User,
  "user-circle": UserCircle,
  "users": Users,

  // Legacy Ionicons-style
  "grid-outline": LayoutDashboard,
  "apps-outline": LayoutDashboard,
  "people-outline": Users,
  "person-outline": User,
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
  "settings-outline": Settings,
  "settings-2-outline": Settings2,
  "apartment": Building2,
  "document-text-outline": FileText,
  "document-outline": FileText,
  "document-attach-outline": FileText,
  "briefcase-outline": CheckSquare,
  "newspaper-outline": Newspaper,
  "git-network-outline": GitBranch,
};

const toKebabCase = (str: string) =>
  str
    .replace(/([a-z0-9])([A-Z])/g, "$1-$2")
    .replace(/([a-zA-Z])([0-9])/g, "$1-$2")
    .toLowerCase();

export const getIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) return LayoutDashboard;
  const trimmed = iconName.trim();
  return (
    ICON_MAP[trimmed] ||
    ICON_MAP[trimmed.toLowerCase()] ||
    ICON_MAP[toKebabCase(trimmed)] ||
    LayoutDashboard
  );
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
      const res = await menuApi.getHubApps("ADMIN_PORTAL");
      const unwrapped = unwrapData<any>(res, []);
      return Array.isArray(unwrapped) ? unwrapped : (unwrapped?.apps ?? []);
    },
    staleTime: 5 * 60 * 1000, // Cache 5 phút
  });

  const apps: HubApp[] = React.useMemo(() => {
    return (data ?? []).map((app: any) => ({
      ...app,
      icon: getIcon(app.icon),
    }));
  }, [data]);

  return { apps, isLoading, isError };
}

// ----------------------------------------------------------------------
// 4. HOOK: useServiceMenus — Sidebar, load lazy khi user vào service
// Tự nhận diện serviceCode từ pathname, gọi /menus/sidebar?code=X
// ----------------------------------------------------------------------

/** Map route prefix → serviceCode (phải khớp với menu group trong seed) */
const ROUTE_TO_SERVICE: Record<string, string> = {
  "/services/hrm": "HRM_GROUP",
  "/services/admin": "SYS_GROUP",
  "/services/documents": "DOC_GROUP",
  "/services/posts": "CONTENT_GROUP",
  "/services/workflow": "WORKFLOW_GROUP",
  "/services/api-manager": "API_MANAGER_GROUP",
  "/services/reports": "REPORT_GROUP",
};

function getServiceCodeFromPath(pathname: string): string | null {
  const cleanPath = pathname.replace(/^\/admin/, "");
  for (const [prefix, code] of Object.entries(ROUTE_TO_SERVICE)) {
    if (cleanPath === prefix || cleanPath.startsWith(`${prefix}/`)) {
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
      const res = await menuApi.getServiceSidebar(serviceCode, "ADMIN_PORTAL");
      const unwrapped = unwrapData<any>(res, null);
      return unwrapped?.sidebar ?? unwrapped;
    },
    enabled: !!serviceCode, // Chỉ gọi khi đã biết service
    staleTime: 5 * 60 * 1000,
  });

  const sidebar = data;

  const menuItems: SidebarItem[] = React.useMemo(() => {
    return (sidebar?.items ?? []).map((item: any) => ({
      ...item,
      icon: getIcon(item.icon),
    }));
  }, [sidebar?.items]);

  const serviceIcon = React.useMemo(() => {
    return getIcon(sidebar?.serviceIcon);
  }, [sidebar?.serviceIcon]);

  return {
    menuItems,
    serviceName: sidebar?.serviceName ?? "Phân hệ",
    serviceIcon,
    serviceCode: sidebar?.serviceCode ?? serviceCode ?? "",
    isLoading,
    isError,
  };
}
