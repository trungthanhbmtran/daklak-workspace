import { TaskDashboard } from "@/features/hrm/components/tasks/task-dashboard";
import { TaskList } from "@/features/hrm/components/tasks/task-list";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo, LayoutDashboard } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-4 p-6 h-full overflow-hidden bg-slate-50/50">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Công việc & KPI</h1>
        <p className="text-muted-foreground">
          Theo dõi tiến độ, phân công và đánh giá chất lượng công việc.
        </p>
      </div>

      <Tabs defaultValue="tasks" className="flex flex-col min-h-0 w-full flex-1">
        <TabsList className="mb-4">
          <TabsTrigger value="tasks" className="flex items-center gap-2">
            <ListTodo className="w-4 h-4" />
            Danh sách công việc
          </TabsTrigger>
          <TabsTrigger value="dashboard" className="flex items-center gap-2">
            <LayoutDashboard className="w-4 h-4" />
            Tổng quan (Dashboard)
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tasks" className="flex-col flex-1 min-h-0 mt-0 outline-none data-[state=active]:flex">
          <Suspense fallback={<div className="p-4 text-center text-slate-500">Đang tải danh sách...</div>}>
            <TaskList />
          </Suspense>
        </TabsContent>

        <TabsContent value="dashboard" className="flex-col flex-1 min-h-0 mt-0 outline-none overflow-y-auto data-[state=active]:flex">
          <TaskDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
