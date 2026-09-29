import React from "react";
import { ReportDashboard } from "@/features/reports/components/reports/ReportDashboard";

export const metadata = {
  title: "Đánh Giá Số Liệu Triển Khai Thực Tế (LGSP) - HR",
};

export default function LgspEvaluationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <ReportDashboard />
    </div>
  );
}
