import React from "react";
import { ShieldCheck } from "lucide-react";
import { HeaderUserProfile } from "@/components/layouts/header-user-profile";
import { NotificationBell } from "@/features/notifications/NotificationBell";

export function PortalHeader() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 bg-background/95 backdrop-blur supports-backdrop-filter:bg-background/60 shadow-sm">
      <div className="flex h-16 w-full items-center justify-between px-4 lg:px-8">

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <div className="flex flex-col">
            <span className="text-base font-bold leading-tight tracking-tight">Cổng Ứng dụng Nội bộ</span>
            <span className="text-xs text-muted-foreground hidden sm:inline-block">Sở Khoa học và Công nghệ tỉnh Đắk Lắk</span>
          </div>
        </div>

        <div className="flex items-center gap-2 md:gap-4">
          <NotificationBell />
          <HeaderUserProfile showName />
        </div>

      </div>
    </header>
  );
}

export default function HubLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-screen overflow-y-auto bg-muted/30">
      <PortalHeader />
      {children}
    </div>
  );
}
