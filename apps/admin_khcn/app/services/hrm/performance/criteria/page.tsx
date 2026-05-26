import { Metadata } from "next";
import { KpiCriteriaClient } from "@/features/hrm/components/kpi-criteria/KpiCriteriaClient";

export const metadata: Metadata = {
  title: "Khung Tiêu chí & Công thức tính điểm | HRM",
  description: "Quản lý tập trung các tiêu chí đánh giá KPI và thiết lập công thức tính điểm chung",
};

export default function KpiCriteriaPage() {
  return <KpiCriteriaClient />;
}
