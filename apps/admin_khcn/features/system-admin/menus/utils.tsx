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
