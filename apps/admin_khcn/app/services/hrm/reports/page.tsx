import { HrmReportWorkbenchClient } from "@/features/hrm/components/reports/HrmReportWorkbenchClient";

export const metadata = {
  title: "Tra cứu, thống kê, báo cáo và xuất kết quả | Quản trị HRM & KPI",
  description: "Tra cứu kết quả nhiệm vụ, thống kê năng suất và xuất dự thảo quyết định, báo cáo đánh giá KPI toàn đơn vị",
};

export default function HrmReportsPage() {
  return (
    <div className="w-full flex-1 flex flex-col min-w-0">
      <HrmReportWorkbenchClient />
    </div>
  );
}
