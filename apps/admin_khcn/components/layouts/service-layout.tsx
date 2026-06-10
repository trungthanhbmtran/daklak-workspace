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

        {/* Content area — scroll nội bộ, không scroll body */}
        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 bg-muted/20 overflow-y-auto min-h-0">
          {children}
        </div>

      </SidebarInset>

    </SidebarProvider>
  );
}
