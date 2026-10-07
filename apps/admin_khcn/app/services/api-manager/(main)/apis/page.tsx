import { ApiManagementDashboard } from "@/features/api-management/components/ApiManagementDashboard";
import { PartnerManagement } from "@/features/api-management/components/PartnerManagement";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export const metadata = {
  title: "Quản lý kết nối API | Cổng ứng dụng Nội bộ",
};

export default function ApiIntegrationPage() {
  return (
    <div className="container mx-auto p-6 max-w-[1400px] flex-1 min-h-0 flex flex-col overflow-hidden">
      <Tabs defaultValue="api" className="w-full flex-1 flex flex-col overflow-hidden">
        <TabsList className="w-fit mb-4">
          <TabsTrigger value="api">Quản lý API Outbound & Cấu hình</TabsTrigger>
          <TabsTrigger value="partner">Tài khoản Đối tác (Inbound)</TabsTrigger>
        </TabsList>
        <TabsContent value="api" className="flex-1 overflow-auto">
          <ApiManagementDashboard />
        </TabsContent>
        <TabsContent value="partner" className="flex-1 overflow-auto">
          <PartnerManagement />
        </TabsContent>
      </Tabs>
    </div>
  );
}
