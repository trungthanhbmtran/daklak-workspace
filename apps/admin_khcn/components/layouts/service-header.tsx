"use client";

import { usePathname } from "next/navigation";

import { SidebarTrigger } from "@/components/ui/sidebar";

import { useServiceMenus } from "@/hooks/useServiceMenus";
import { NotificationBell } from "@/features/notifications/NotificationBell";
import { HeaderUserProfile } from "./header-user-profile";
import { Heading } from "@/components/ui/typography";

import { ThemeToggle } from "./theme-toggle";

export function ServiceHeader() {
  const pathname = usePathname();
  const { menuItems, serviceName, serviceCode } = useServiceMenus();

  // Chọn menu khớp dài nhất để route con (vd: /workflows/[id]/edit) không bị nhận nhầm là menu cha.
  const activePageName =
    (menuItems ?? [])
      .filter(m => m.href && (pathname === m.href || pathname.startsWith(`${m.href}/`)))
      .sort((a, b) => b.href.length - a.href.length)[0]?.name || serviceName || serviceCode;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background z-10 shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">

      {/* TRÁI: Toggle Sidebar & Tiêu đề */}
      <div className="flex items-center gap-2 min-w-0 flex-1 mr-2">
        <SidebarTrigger className="-ml-1 shrink-0" />
        <div className="h-4 w-px bg-border shrink-0" />
        <Heading level="h4" className="ml-1 sm:ml-2 tracking-tight truncate text-sm sm:text-base md:text-lg" title={activePageName}>
          {activePageName}
        </Heading>
      </div>

      {/* PHẢI: Công cụ & User Profile */}
      <div className="flex items-center gap-1.5 sm:gap-2 md:gap-4 shrink-0">
        <ThemeToggle />
        <NotificationBell />
        <HeaderUserProfile showName={true} />
      </div>
    </header>
  );
}
