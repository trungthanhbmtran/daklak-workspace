import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./service-sidebar";
import { ServiceHeader } from "./service-header";
import { Suspense } from "react";
import { Spinner } from "@/components/ui/spinner";

interface ServiceLayoutProps {
  children: React.ReactNode;
}

// ServiceLayout là layout thuần túy — không xử lý auth ở đây.
// Auth được guard ở Server Layout cụ thể của từng service (vd: app/services/admin/layout.tsx)
export function ServiceLayout({ children }: ServiceLayoutProps) {
  return (
    <SidebarProvider>

      {/* Sidebar cố định bên trái */}
      <Suspense fallback={<div className="w-[16rem] shrink-0 border-r bg-sidebar" />}>
        <AppSidebar />
      </Suspense>

      {/* Vùng bên phải: header cố định + content là vùng cuộn duy nhất.
          Wrapper của SidebarProvider là h-svh overflow-hidden, nên inset phải giới hạn chiều cao
          (min-h-0) và content phải tự cuộn — nếu không nội dung dài sẽ bị cắt hoặc trượt dưới header. */}
      <SidebarInset className="min-h-0 min-w-0 overflow-hidden">

        {/* Header cố định — không scroll */}
        <Suspense fallback={<header className="flex h-16 shrink-0 items-center justify-between gap-2 border-b px-4 bg-background z-10 shadow-sm" />}>
          <ServiceHeader />
        </Suspense>

        {/* Content area — vùng cuộn duy nhất của trang */}
        <div className="flex flex-1 flex-col bg-muted/20 overflow-y-auto overflow-x-hidden min-h-0 p-2 sm:p-4 lg:p-6">
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
