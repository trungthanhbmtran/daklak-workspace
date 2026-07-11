import { IocDashboard } from "@/features/integration/components/reports/IocDashboard";

export const metadata = {
  title: "Dữ liệu Live từ API Tích hợp | Cổng Ứng dụng Nội bộ",
};

export default function IocDashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl flex-1 min-h-0 flex flex-col overflow-y-auto">
      <IocDashboard />
    </div>
  );
}

