import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import { AppSidebar } from "./service-sidebar";
import { ServiceHeader } from "./service-header";

interface ServiceLayoutProps {
  children: React.ReactNode;
  serviceKey: string;
}

export function ServiceLayout({
  children,
  serviceKey,
}: ServiceLayoutProps) {
  
  if (!serviceKey) {
    return (
      <div className="flex min-h-screen items-center justify-center text-destructive bg-background">
        Error: Missing serviceKey prop
      </div>
    );
  }

  return (
    <SidebarProvider>
      
      {/* 2. Gắn Sidebar Component vào */}
      <AppSidebar serviceKey={serviceKey} />

      <SidebarInset>
        
        <ServiceHeader serviceKey={serviceKey} />

        <div className="flex flex-1 flex-col gap-4 p-4 pt-6 md:p-8 bg-muted/20">
          {children}
        </div>
        
      </SidebarInset>
      
    </SidebarProvider>
  );
}
