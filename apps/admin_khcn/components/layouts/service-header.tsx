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

  const activePageName = (menuItems ?? []).find(m => pathname === m.href || pathname.startsWith(`${m.href}/`))?.name || serviceName || serviceCode;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-10 shadow-sm transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">

      {/* TRÁI: Toggle Sidebar & Tiêu đề */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border" />
        <Heading level="h4" className="ml-2 tracking-tight">
          {activePageName}
        </Heading>
      </div>

      {/* PHẢI: Công cụ & User Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <ThemeToggle />
        <NotificationBell />
        <HeaderUserProfile showName={true} />
      </div>
    </header>
  );
}
