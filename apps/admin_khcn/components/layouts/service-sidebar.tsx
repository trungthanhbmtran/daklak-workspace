"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Grid, Headset, Info, Loader2 } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarRail,
} from "@/components/ui/sidebar";

import { useServiceMenus } from "@/hooks/useServiceMenus";

export function AppSidebar({
  serviceKey,
  ...props
}: React.ComponentProps<typeof Sidebar> & { serviceKey: string }) {
  const pathname = usePathname();
  const { menuItems, serviceName, serviceIcon: ServiceIcon, isLoading } = useServiceMenus(serviceKey);

  if (!serviceKey) return null;

  const items = menuItems ?? [];
  const firstHref = items[0]?.href ?? (serviceKey === "admin" ? "/services/admin" : serviceKey === "hrm" ? "/services/hrm" : `/services/${serviceKey}`);

  return (
    <Sidebar collapsible="icon" {...props}>
      {/* HEADER: Giữ nguyên */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" asChild>
              <Link href={firstHref}>
                <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-primary text-primary-foreground">
                  {isLoading ? <Loader2 className="size-4 animate-spin" /> : <ServiceIcon className="size-4" />}
                </div>
                <div className="grid flex-1 text-left text-sm leading-tight">
                  <span className="truncate font-semibold">{isLoading ? "Đang tải..." : serviceName}</span>
                  <span className="truncate text-xs text-muted-foreground">Sở KH&CN Đắk Lắk</span>
                </div>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarHeader>

      {/* CONTENT: Giữ nguyên */}
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Hệ thống</SidebarGroupLabel>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Đổi ứng dụng">
                <Link href="/hub">
                  <Grid className="size-4" />
                  <span>Về trang Portal (Hub)</span>
                </Link>
              </SidebarMenuButton>
            </SidebarMenuItem>
          </SidebarMenu>
        </SidebarGroup>

        <SidebarGroup>
          <SidebarGroupLabel>Phân hệ chức năng</SidebarGroupLabel>
          <SidebarMenu>
            {isLoading ? (
              <SidebarMenuItem>
                <div className="flex items-center gap-2 px-2 py-2 text-sm text-muted-foreground">
                  <Loader2 className="size-4 animate-spin" /> Đang tải menu...
                </div>
              </SidebarMenuItem>
            ) : (
              items.map((item) => {
                const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
                const Icon = item.icon;
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild tooltip={item.name} isActive={isActive}>
                      <Link href={item.href}>
                        <Icon className="size-4" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })
            )}
          </SidebarMenu>
        </SidebarGroup>
      </SidebarContent>

      {/* FOOTER MỚI: Thông tin hệ thống và Hỗ trợ */}
      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton asChild tooltip="Hỗ trợ kỹ thuật">
              <Link href="/support">
                <Headset className="size-4" />
                <span>Hỗ trợ kỹ thuật</span>
              </Link>
            </SidebarMenuButton>
          </SidebarMenuItem>
          <SidebarMenuItem>
            {/* class "group-data-[collapsible=icon]:hidden" giúp dòng chữ này tự biến mất khi Sidebar thu gọn thành icon */}
            <div className="flex items-center gap-2 px-2 py-2 text-xs text-muted-foreground group-data-[collapsible=icon]:hidden">
              <Info className="size-4 shrink-0" />
              <div className="grid flex-1 text-left leading-tight">
                <span className="font-medium">Phiên bản 1.0.0</span>
                <span className="text-[10px]">© 2026 Admin Module</span>
              </div>
            </div>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
    </Sidebar>
  );
}
