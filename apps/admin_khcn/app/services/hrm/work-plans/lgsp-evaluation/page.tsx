import React from "react";
import { LgspEvaluationClient } from "@/features/hrm/components/performance/LgspEvaluationClient";

export const metadata = {
  title: "Đánh Giá Số Liệu Triển Khai Thực Tế (LGSP) - HR",
};

export default function LgspEvaluationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Đánh giá số liệu thực tế (Trục Quốc Gia)</h2>
      </div>
      <LgspEvaluationClient />
    </div>
  );
}
