import { ApiManagementDashboard } from "@/features/api-management/components/ApiManagementDashboard";
import { PartnerManagement } from "@/features/api-management/components/PartnerManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Server, Users } from "lucide-react";

export const metadata = {
  title: "Quản lý kết nối API | Cổng ứng dụng Nội bộ",
};

export default function ApiIntegrationPage() {
  return (
    <div className="container mx-auto p-6 max-w-[1400px] flex-1 min-h-0 flex flex-col overflow-hidden bg-slate-50/30 dark:bg-transparent">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
          <div className="p-2 bg-primary/10 rounded-lg text-primary">
            <Server className="w-7 h-7" />
          </div>
          Quản lý Gateway & API
        </h1>
        <p className="text-muted-foreground mt-2 text-base ml-[52px]">
          Trung tâm điều khiển kết nối Inbound/Outbound, quản lý đối tác và cấu hình bảo mật API.
        </p>
      </div>

      <Tabs defaultValue="api" className="w-full flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit mb-6 p-1 bg-slate-200/50 dark:bg-slate-800/50 rounded-xl">
          <TabsTrigger 
            value="api" 
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-primary px-6 py-2.5 font-medium transition-all"
          >
            <Server className="w-4 h-4 mr-2" />
            Outbound API & Gateway
          </TabsTrigger>
          <TabsTrigger 
            value="partner" 
            className="rounded-lg data-[state=active]:bg-white dark:data-[state=active]:bg-slate-900 data-[state=active]:shadow-sm data-[state=active]:text-primary px-6 py-2.5 font-medium transition-all"
          >
            <Users className="w-4 h-4 mr-2" />
            Tài khoản Đối tác (Inbound)
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="api" className="flex-1 overflow-auto data-[state=inactive]:hidden outline-none m-0 pb-6">
          <ApiManagementDashboard />
        </TabsContent>
        <TabsContent value="partner" className="flex-1 overflow-auto data-[state=inactive]:hidden outline-none m-0 pb-6">
          <PartnerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
