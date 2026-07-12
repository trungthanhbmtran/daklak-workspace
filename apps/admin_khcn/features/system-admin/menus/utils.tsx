import React from "react";
import { 
    Settings, 
    Users, 
    Building, 
    Lock, 
    List, 
    LayoutDashboard, 
    FileText,
    Shield,
    Menu,
    FolderTree,
    LucideIcon // <-- 1. Import type chuẩn của Lucide
  } from "lucide-react";
    
  // Cho phép iconString có thể null/undefined để tránh crash app nếu API lỗi
  export const renderIcon = (iconString?: string | null, className = "h-4 w-4") => {
    // 2. Khai báo type rõ ràng: Value là LucideIcon thay vì any
    const iconMap: Record<string, LucideIcon> = { 
      Settings, 
      Users, 
      Building, 
      Lock, 
      List, 
      LayoutDashboard, 
      FileText,
      Shield,
      Menu,
      FolderTree
    };
    
    // 3. Check an toàn: Nếu có iconString và có trong map thì lấy, không thì lấy FileText
    const IconComponent = (iconString && iconMap[iconString]) ? iconMap[iconString] : FileText;
    
    return <IconComponent className={className} />;
  };

import { MenuItem, PbacResource } from "./types";

export function calculateAutoSort(
  menus: MenuItem[],
  isRootMenu: boolean,
  parentId: number | null
): number {
  const siblingCount = menus.filter((m: MenuItem) =>
    isRootMenu ? !m.parentId : m.parentId === parentId
  ).length;
  return siblingCount + 1;
}

export function groupResourcesByServiceCode(resources: PbacResource[]): Record<string, PbacResource[]> {
  const groups: Record<string, PbacResource[]> = {};
  for (const r of resources) {
    const key = r.serviceCode || "Khác";
    if (!groups[key]) groups[key] = [];
    groups[key].push(r);
  }
  return groups;
}

export function generateDefaultMenuValues({
  isCreate,
  selectedMenu,
  parentPathPrefix,
  isRootMenu,
  autoSort,
}: {
  isCreate: boolean;
  selectedMenu: MenuItem | null | undefined;
  parentPathPrefix: string;
  isRootMenu: boolean;
  autoSort: number;
}) {
  let initialSuffix = "";
  if (!isCreate && selectedMenu?.path) {
    initialSuffix = selectedMenu.path.startsWith(parentPathPrefix)
      ? selectedMenu.path.substring(parentPathPrefix.length)
      : selectedMenu.path;
  }

  return isCreate
    ? {
      name: "",
      code: "",
      path: "",
      icon: isRootMenu ? "LayoutDashboard" : "FileText",
      description: "",
      iconColor: "",
      sort: autoSort,
      active: 1,
      linkedResourceCode: null,
      type: "MENU" as const,
    }
    : {
      name: selectedMenu?.name || "",
      code: selectedMenu?.code || "",
      path: initialSuffix,
      icon: selectedMenu?.icon || "FileText",
      description: selectedMenu?.description || "",
      iconColor: selectedMenu?.iconColor || "",
      sort: selectedMenu?.sort || 1,
      active: selectedMenu?.active ?? 1,
      linkedResourceCode: selectedMenu?.linkedResourceCode || null,
      type: selectedMenu?.type || "MENU",
    };
}

