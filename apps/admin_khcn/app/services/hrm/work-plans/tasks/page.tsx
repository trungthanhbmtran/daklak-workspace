import { TaskDashboard } from "@/features/hrm/components/tasks/task-dashboard";
import { TaskList } from "@/features/hrm/components/tasks/task-list";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ListTodo, LayoutDashboard } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col gap-6 p-6 min-h-screen bg-slate-50/50">
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Quản lý Công việc & KPI</h1>
        <p className="text-muted-foreground">
          Theo dõi tiến độ, phân công và đánh giá chất lượng công việc.
        </p>
      </div>

      <Tabs defaultValue="tasks" className="w-full">
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
        
        <TabsContent value="tasks" className="mt-0 outline-none">
          <Suspense fallback={<div className="p-4 text-center text-slate-500">Đang tải danh sách...</div>}>
            <TaskList />
          </Suspense>
        </TabsContent>
        
        <TabsContent value="dashboard" className="mt-0 outline-none">
          <TaskDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
