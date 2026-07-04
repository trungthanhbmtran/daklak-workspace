import { ReportDashboard } from "@/features/integration/components/reports/ReportDashboard";

export const metadata = {
  title: "Thiết kế Báo cáo | Cổng Ứng dụng Nội bộ",
};

export default function ReportDashboardPage() {
  return (
    <div className="container mx-auto p-6 max-w-7xl flex-1 min-h-0 flex flex-col overflow-hidden">
      <ReportDashboard />
    </div>
  );
}
