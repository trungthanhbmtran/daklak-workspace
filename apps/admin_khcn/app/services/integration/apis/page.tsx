import { IntegrationManager } from "@/features/integration/components/IntegrationManager";

export const metadata = {
  title: "Quản lý Kết nối API Đầu vào | Cổng Ứng dụng Nội bộ",
};

export default function ApiIntegrationPage() {
  return (
    <div className="container mx-auto p-6 max-w-5xl flex-1 min-h-0 flex flex-col overflow-hidden">
      <IntegrationManager />
    </div>
  );
}
