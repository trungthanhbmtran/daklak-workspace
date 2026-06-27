import React from "react";
import { PersonalKpiClient } from "@/features/hrm/components/performance/personal/PersonalKpiClient";

export const metadata = {
  title: "KPI Cá nhân",
  description: "Đánh giá hiệu suất và tổng hợp điểm KPI tự động",
};

export default function PersonalKpiPage() {
  return (
    <div className="p-6">
      <PersonalKpiClient />
    </div>
  );
}
