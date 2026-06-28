import { ReviewKpiClient } from "@/features/hrm/components/performance/ReviewKpiClient";

export const metadata = {
  title: "Duyệt KPI | DakLak System",
  description: "Trang dành cho cán bộ Lãnh đạo nghiệm thu KPI của nhân viên",
};

export default function ReviewKpiPage() {
  return (
    <div className="flex-1 space-y-4 p-4 pt-6 md:p-8">
      <ReviewKpiClient />
    </div>
  );
}
