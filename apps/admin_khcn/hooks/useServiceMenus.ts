"use client";

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
// 1. CONFIGURATION (CẤU HÌNH TẬP TRUNG)
// ----------------------------------------------------------------------

const SERVICE_CONFIG: Record<string, { serviceCode: string; basePath: string }> = {
  admin: { serviceCode: "USER_SERVICE", basePath: "/services/admin" },
  hrm: { serviceCode: "HRM_SERVICE", basePath: "/services/hrm" },
  documents: { serviceCode: "DOCUMENT_SERVICE", basePath: "/services/documents" },
  posts: { serviceCode: "CONTENT_SERVICE", basePath: "/services/posts" },
};

// Map ngược lại để dùng cho Hub
const SERVICE_TO_KEY: Record<string, string> = Object.entries(SERVICE_CONFIG).reduce(
  (acc, [key, conf]) => ({ ...acc, [conf.serviceCode]: key }),
  {}
);

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

// Tiện ích nối path an toàn (tránh lỗi sinh ra dấu // dư thừa)
const joinPath = (base: string, path: string) => {
  return `${base}/${path}`.replace(/\/+/g, "/"); // Thay thế nhiều dấu / thành 1 dấu /
};

export interface SidebarItem {
  name: string;
  href: string;
  icon: LucideIcon;
  order: number;
}

// ----------------------------------------------------------------------
// 2. HELPER FUNCTIONS (XỬ LÝ DATA)
// ----------------------------------------------------------------------

/** Lấy danh sách menu chuẩn từ API (Dùng chung cho cả 2 hooks) */
const fetchAndNormalizeMenus = async (): Promise<MenuNode[]> => {
  const res = await menuApi.getMyMenus("ADMIN_PORTAL");
  // Xử lý các dạng trả về có thể xảy ra của axios/fetch
  const raw = (res as any)?.data?.items ?? (res as any)?.data ?? (res as any)?.items ?? res;
  return Array.isArray(raw) ? raw : [];
};

/** Bỏ qua node Gốc ảo (SYS_ROOT) nếu có */
const getRealBranches = (nodes: MenuNode[]): MenuNode[] => {
  if (nodes.length === 1 && !nodes[0].route && Array.isArray(nodes[0].children)) {
    return nodes[0].children;
  }
  return nodes;
};

/** Đệ quy làm phẳng menu tree thành 1 list duy nhất cho Sidebar */
const flattenMenus = (nodes: MenuNode[], basePath: string): SidebarItem[] => {
  return nodes.reduce<SidebarItem[]>((acc, node) => {
    const route = (node.route ?? "").trim();

    // Nếu node có route, thêm vào list
    if (route) {
      acc.push({
        name: (node.name ?? "").trim(),
        href: joinPath(basePath, route),
        icon: getIcon(node.icon),
        order: node.order ?? 0,
      });
    }

    // Đệ quy chui vào children
    if (Array.isArray(node.children) && node.children.length > 0) {
      acc.push(...flattenMenus(node.children, basePath));
    }

    return acc;
  }, []);
};

// ----------------------------------------------------------------------
// 3. REACT HOOKS
// ----------------------------------------------------------------------

/**
 * Hook cho Sidebar: Lấy menu của một phân hệ cụ thể (vd: "documents")
 */
export function useServiceMenus(serviceKey: keyof typeof SERVICE_CONFIG) {
  const config = SERVICE_CONFIG[serviceKey];

  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "me", "ADMIN_PORTAL"],
    queryFn: fetchAndNormalizeMenus,
    enabled: !!config,
  });

  const branches = getRealBranches(data ?? []);

  // Tìm nhánh gốc của Service này
  const targetRoot = branches.find((b) => (b.service ?? "").trim() === config?.serviceCode);

  let menuItems: SidebarItem[] = [];
  let serviceName = serviceKey;
  let serviceIcon = getIcon("");

  if (targetRoot) {
    serviceName = (targetRoot.name ?? "").trim() || serviceKey;
    serviceIcon = getIcon(targetRoot.icon);

    // Làm phẳng và sắp xếp theo order
    menuItems = flattenMenus(targetRoot.children ?? [], config.basePath).sort(
      (a, b) => a.order - b.order
    );
  }

  return {
    menuItems,
    serviceName,
    serviceIcon,
    isLoading,
    isError,
  };
}

/**
 * Hook cho Hub: Hiển thị danh sách các phân hệ (Service Cards)
 */
export function useHubServices() {
  const { data, isLoading, isError } = useQuery({
    queryKey: ["menus", "me", "ADMIN_PORTAL"],
    queryFn: fetchAndNormalizeMenus,
  });

  const branches = getRealBranches(data ?? []);

  const apps = branches
    .filter((b) => {
      const svcCode = (b.service ?? "").trim();
      return svcCode && SERVICE_TO_KEY[svcCode]; // Chỉ lấy các service có định nghĩa
    })
    .map((b) => {
      const svcCode = (b.service ?? "").trim();
      const serviceKey = SERVICE_TO_KEY[svcCode];

      return {
        id: serviceKey,
        title: (b.name ?? "").trim() || serviceKey,
        desc: (b.description ?? "").trim() || "Phân hệ nghiệp vụ",
        href: SERVICE_CONFIG[serviceKey]?.basePath ?? `/services/${serviceKey}`,
        icon: getIcon(b.icon),
        iconColor: (b.iconColor ?? "").trim() || null,
        disabled: false,
      };
    });

  return { apps, isLoading, isError };
}
