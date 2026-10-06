import { ReportWorkspace } from "@/features/reports/components/reports/v2/ReportWorkspace";

export const metadata = {
  title: "Thiết kế Báo cáo | Cổng Ứng dụng Nội bộ",
};

export default function ReportDashboardPage() {
  return (
    <div className="w-full h-full flex flex-col bg-white overflow-hidden">
      <ReportWorkspace />
    </div>
  );
}

