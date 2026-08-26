import React from "react";
import { PersonalKpiClient } from "@/features/hrm/components/performance/personal/PersonalKpiClient";

export const metadata = {
  title: "KPI Cá nhân",
  description: "Đánh giá hiệu suất và tổng hợp điểm KPI tự động",
};

export default function PersonalKpiPage() {
  return (
    <div className="flex-col flex-1 min-h-0 overflow-y-auto flex pr-2 pb-4">
      <PersonalKpiClient />
    </div>
  );
}
