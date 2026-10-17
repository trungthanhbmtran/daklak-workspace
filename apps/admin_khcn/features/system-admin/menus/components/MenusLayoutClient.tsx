"use client";

import React from "react";
import { usePathname } from "next/navigation";
import { MenuSidebar } from "./MenuSidebar";
import { cn } from "@/lib/utils";

export function MenusLayoutClient({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isRoot = pathname === "/services/admin/menus" || pathname === "/services/admin/menus/";

  return (
    <div className="flex flex-col lg:flex-row gap-6 flex-1 min-h-0 min-w-0 overflow-hidden font-sans antialiased">
      <div className={cn("w-full lg:w-[350px] shrink-0 h-full", isRoot ? "flex flex-col" : "hidden lg:flex flex-col")}>
        <MenuSidebar />
      </div>
      <div className={cn("flex-1 h-full min-w-0 overflow-y-auto p-1", isRoot ? "hidden lg:block" : "block")}>
        {children}
      </div>
    </div>
  );
}
