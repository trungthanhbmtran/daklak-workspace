import { PlanListClient } from "@/features/hrm/components/plans/PlanListClient";

export const metadata = {
  title: "Danh sách Kế hoạch tổng | HRM",
  description: "Quản lý kế hoạch tổng",
};

export default function PlansPage() {
  return <PlanListClient />;
}
