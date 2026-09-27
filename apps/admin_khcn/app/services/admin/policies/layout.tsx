"use client";

import { usePathname } from "next/navigation";
import { PolicySidebar } from "@/features/system-admin/policies";

export default function RolesLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === "/services/admin/policies";

  return (
    <div className="flex flex-col h-full min-h-0">
      <div className="mb-4 shrink-0 px-2">
        <h1 className="text-2xl font-bold tracking-tight">Quản lý Nhóm quyền (User Groups)</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Thiết lập các nhóm quyền và gán quyền hạn truy cập (PBAC) cho từng vai trò trên hệ thống.
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 min-w-0 overflow-hidden">
        <div className={`shrink-0 ${!isRoot ? "hidden lg:flex" : "flex"} w-full lg:w-4/12 xl:w-3/12 2xl:w-1/5 h-full min-h-0`}>
          <div className="w-full h-full [&>*]:w-full [&>*]:h-full">
            <PolicySidebar />
          </div>
        </div>
        <div className={`flex-1 h-full min-w-0 overflow-y-auto p-1 ${isRoot ? "hidden lg:block" : "block"}`}>
          {children}
        </div>
      </div>
    </div>
  );
}
