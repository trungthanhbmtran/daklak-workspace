import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./service-sidebar";
import { ServiceHeader } from "./service-header";

interface ServiceLayoutProps {
  children: React.ReactNode;
}

export function ServiceLayout({ children }: ServiceLayoutProps) {
  return (
    <SidebarProvider>

      {/* Sidebar cố định bên trái */}
      <AppSidebar />

      {/* Vùng bên phải: header sticky + content scroll */}
      <SidebarInset>

        {/* Header cố định — không scroll */}
        <ServiceHeader />

        {/* Content area — scroll nội bộ do các page tự quản lý */}
        <div className="flex flex-1 flex-col bg-muted/20 overflow-hidden min-h-0">
          {children}
        </div>

      </SidebarInset>

    </SidebarProvider>
  );
}
