import { TaskDashboard } from "@/features/hrm/components/tasks/task-dashboard";
import { TaskList } from "@/features/hrm/components/tasks/task-list";
import { Suspense } from "react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Công việc & KPI</h1>
        <p className="text-muted-foreground">
          Theo dõi tiến độ, phân công và đánh giá chất lượng công việc.
        </p>
      </div>

      <TaskDashboard />
      
      <div className="mt-4">
        <h2 className="text-xl font-semibold mb-4">Danh sách Công việc</h2>
        <Suspense fallback={<div className="p-4 text-center text-slate-500">Đang tải danh sách...</div>}>
          <TaskList />
        </Suspense>
      </div>
    </div>
  );
}
