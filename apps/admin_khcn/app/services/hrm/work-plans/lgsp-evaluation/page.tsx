import React from "react";
import { LgspEvaluationClient } from "@/features/hrm/components/performance/LgspEvaluationClient";

export const metadata = {
  title: "Ðánh Giá S? Li?u Tri?n Khai Th?c T? (LGSP) - HR",
};

export default function LgspEvaluationPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <div className="flex items-center justify-between space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Ðánh giá s? li?u th?c t? (Tr?c Qu?c Gia)</h2>
      </div>
      <LgspEvaluationClient />
    </div>
  );
}

