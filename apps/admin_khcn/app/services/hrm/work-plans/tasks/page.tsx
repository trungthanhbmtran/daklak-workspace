import { TaskList } from "@/features/hrm/components/tasks/task-list";
import { Suspense } from "react";

export default function TasksPage() {
  return (
    <div className="flex-col flex-1 min-h-0 flex">
      <Suspense fallback={<div className="p-4 text-center text-slate-500">Đang tải danh sách...</div>}>
        <TaskList />
      </Suspense>
    </div>
  );
}
