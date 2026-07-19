/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { usePathname } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import * as React from "react";
import { lazy, Suspense } from "react";
import type { LucideIcon } from "lucide-react";
import dynamicIconImports from "lucide-react/dynamicIconImports";
import { menuApi } from "@/features/system-admin/menus/api";

// ----------------------------------------------------------------------
// 1. ICON MAP — hỗ trợ cả Ionicons-style (cũ) và PascalCase Lucide (mới)
// ----------------------------------------------------------------------
const LEGACY_MAP: Record<string, string> = {
  // Ionicons-style
  "grid-outline": "layout-dashboard", "apps-outline": "layout-dashboard",
  "people-outline": "users", "person-outline": "users",
  "lock-closed-outline": "key-round", "shield-checkmark-outline": "shield-check",
  "list-outline": "list-tree", "megaphone-outline": "list-tree",
  "calendar-outline": "calendar", "layers-outline": "layers",
  "bar-chart-outline": "bar-chart-2", "globe-outline": "globe",
  "folder-outline": "settings-2", "cog-outline": "settings-2",
  "settings-outline": "settings-2", "settings-2-outline": "settings-2",
  "apartment": "building-2", "document-text-outline": "file-text",
  "document-outline": "file-text", "document-attach-outline": "file-text",
  "briefcase-outline": "check-square", "newspaper-outline": "newspaper",
  "git-network-outline": "git-branch",
};

const toKebabCase = (str: string) => str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();

// Global cache để giữ reference của component, tránh bị re-render liên tục
const iconCache = new Map<string, LucideIcon>();

export const getIcon = (iconName?: string | null): LucideIcon => {
  if (!iconName) iconName = "LayoutDashboard";

  let kebabName = LEGACY_MAP[iconName.trim()] || toKebabCase(iconName.trim());

  // Nếu không tồn tại trong thư viện thì fallback về layout-dashboard
  if (!(kebabName in dynamicIconImports)) {
    kebabName = "layout-dashboard";
  }

  if (!iconCache.has(kebabName)) {
    const LazyIcon = lazy(dynamicIconImports[kebabName as keyof typeof dynamicIconImports]);
    const WrappedIcon = (props: any) =>
      React.createElement(
        Suspense,
        { fallback: React.createElement("div", { className: "w-5 h-5 bg-slate-100 rounded animate-pulse" }) },
        React.createElement(LazyIcon, props)
      );
    iconCache.set(kebabName, WrappedIcon as unknown as LucideIcon);
  }

  return iconCache.get(kebabName)!;
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
  "/services/hrm": "HRM_GROUP",
  "/services/admin": "SYS_GROUP",
  "/services/documents": "DOC_GROUP",
  "/services/posts": "CONTENT_GROUP",
  "/services/integration": "WORKFLOW_GROUP",
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
