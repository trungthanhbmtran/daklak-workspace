"use client";

import { usePathname } from "next/navigation";
import { LogOut, Settings, User } from "lucide-react";

import { Button } from "@/components/ui/button";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

import { useServiceMenus } from "@/hooks/useServiceMenus";
import { useLogout } from "@/hooks/useLogout";
import { NotificationBell } from "@/features/notifications/NotificationBell";

export function ServiceHeader({ serviceKey }: { serviceKey: string }) {
  const pathname = usePathname();
  const { menuItems, serviceName } = useServiceMenus(serviceKey);
  const { handleLogout, isPending } = useLogout();

  const activePageName = (menuItems ?? []).find(m => pathname === m.href || pathname.startsWith(`${m.href}/`))?.name || serviceName || serviceKey;

  return (
    <header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-10 shadow-sm transition-[width,height] ease-linear group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12">
      
      {/* TRÁI: Toggle Sidebar & Tiêu đề */}
      <div className="flex items-center gap-2">
        <SidebarTrigger className="-ml-1" />
        <div className="h-4 w-px bg-border" />
        <h1 className="text-sm font-semibold tracking-tight text-foreground ml-2">
          {activePageName}
        </h1>
      </div>

      {/* PHẢI: Công cụ & User Profile */}
      <div className="flex items-center gap-2 md:gap-4">
        <NotificationBell />

        {/* Dropdown User Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="relative h-9 w-9 rounded-full focus-visible:ring-1 focus-visible:ring-ring">
              <Avatar className="h-9 w-9 border border-border">
                <AvatarImage src="" alt="Avatar" />
                <AvatarFallback className="bg-primary/10 text-primary text-xs font-medium">CB</AvatarFallback>
              </Avatar>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="w-56 border-border" align="end" forceMount>
            <DropdownMenuLabel className="font-normal">
              <div className="flex flex-col space-y-1">
                <p className="text-sm font-medium text-foreground">Cán bộ Quản trị</p>
                <p className="text-xs text-muted-foreground">admin@daklak.gov.vn</p>
              </div>
            </DropdownMenuLabel>
            <DropdownMenuSeparator className="bg-border" />
            <DropdownMenuItem className="cursor-pointer">
              <User className="mr-2 h-4 w-4" /> Hồ sơ cá nhân
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              <Settings className="mr-2 h-4 w-4" /> Cài đặt
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-border" />
            
            {/* Đăng xuất: xóa cache React Query rồi mới gọi server để tránh user mới thấy quyền user cũ */}
            <DropdownMenuItem
              className="cursor-pointer text-destructive focus:bg-destructive/10 focus:text-destructive"
              onClick={() => handleLogout()}
              disabled={isPending}
            >
              <LogOut className="mr-2 h-4 w-4" />
              {isPending ? "Đang đăng xuất…" : "Đăng xuất"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </header>
  );
}
