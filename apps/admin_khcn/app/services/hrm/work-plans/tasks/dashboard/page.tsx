import { TaskDashboard } from "@/features/hrm/components/tasks/task-dashboard";

export default function DashboardPage() {
  return (
    <div className="flex-col flex-1 min-h-0 overflow-y-auto flex pr-2 pb-4">
      <TaskDashboard />
    </div>
  );
}
