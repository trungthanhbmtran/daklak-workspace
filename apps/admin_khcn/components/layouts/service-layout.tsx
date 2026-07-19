import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./service-sidebar";
import { ServiceHeader } from "./service-header";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ServiceLayoutProps {
  children: React.ReactNode;
}

export function ServiceLayout({ children }: ServiceLayoutProps) {
  return (
    <SidebarProvider>

      {/* Sidebar cố định bên trái */}
      <Suspense fallback={<div className="w-[16rem] shrink-0 border-r bg-sidebar" />}>
        <AppSidebar />
      </Suspense>

      {/* Vùng bên phải: header sticky + content scroll */}
      <SidebarInset>

        {/* Header cố định — không scroll */}
        <Suspense fallback={<header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background sticky top-0 z-10 shadow-sm" />}>
          <ServiceHeader />
        </Suspense>

        {/* Content area — scroll nội bộ do các page tự quản lý */}
        <div className="flex flex-1 flex-col bg-muted/20 overflow-hidden min-h-0">
          <Suspense fallback={
            <div className="flex flex-1 items-center justify-center h-full">
              <Spinner className="w-8 h-8 text-primary" />
            </div>
          }>
            {children}
          </Suspense>
        </div>

      </SidebarInset>

    </SidebarProvider>
  );
}
