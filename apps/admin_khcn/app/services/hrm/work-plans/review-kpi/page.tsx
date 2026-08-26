import { ReviewKpiClient } from "@/features/hrm/components/performance/ReviewKpiClient";

export const metadata = {
  title: "Duyệt KPI | DakLak System",
  description: "Trang dành cho cán bộ Lãnh đạo nghiệm thu KPI của nhân viên",
};

export default function ReviewKpiPage() {
  return (
    <div className="flex-col flex-1 min-h-0 overflow-y-auto flex pr-2 pb-4">
      <ReviewKpiClient />
    </div>
  );
}
