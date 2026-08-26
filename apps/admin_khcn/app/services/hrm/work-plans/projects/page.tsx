import { MasterPlanListClient } from "@/features/hrm/components/work-plans/master-plans/MasterPlanListClient";

export default function MasterPlansPage() {
  return (
    <div className="flex-col flex-1 min-h-0 overflow-y-auto flex pr-2 pb-4">
      <MasterPlanListClient />
    </div>
  );
}
