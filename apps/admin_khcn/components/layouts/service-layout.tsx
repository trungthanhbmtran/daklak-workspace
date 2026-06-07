import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./service-sidebar";
import { ServiceHeader } from "./service-header";

interface ServiceLayoutProps {
  children: React.ReactNode;
}

export function ServiceLayout({ children }: ServiceLayoutProps) {
  return (
    <SidebarProvider>

      {/* 2. Gắn Sidebar Component vào */}
      <AppSidebar />

      <SidebarInset>

        <ServiceHeader />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 bg-muted/20">
          {children}
        </div>

      </SidebarInset>

    </SidebarProvider>
  );
}
