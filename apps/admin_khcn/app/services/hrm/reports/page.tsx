import { Metadata } from "next";
import { HrmReportsClient } from "@/features/hrm/components/reports/HrmReportsClient";

export const metadata: Metadata = {
  title: "Tra cứu, thống kê, báo cáo và xuất kết quả | Quản trị HRM & KPI",
  description: "Báo cáo tổng hợp đánh giá cán bộ chuẩn SOP 4 bước và Mẫu 05 Ban Tổ chức Tỉnh ủy, tích hợp từ Report Service",
};

export default function HrmReportsPage() {
  return (
    <div className="flex-1 min-h-0 flex flex-col p-4 sm:p-6 overflow-y-auto">
      <HrmReportsClient />
    </div>
  );
}
