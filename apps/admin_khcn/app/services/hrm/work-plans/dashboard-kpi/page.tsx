import { KpiDashboardClient } from "@/features/hrm/components/performance/dashboard/KpiDashboardClient";

export default function KpiDashboardPage() {
  return (
    <div className="flex-col flex-1 min-h-0 overflow-y-auto flex pr-2 pb-4">
      <KpiDashboardClient />
    </div>
  );
}
