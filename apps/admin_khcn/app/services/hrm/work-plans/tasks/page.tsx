import { TaskDashboard } from "@/features/hrm/components/tasks/task-dashboard";
import { TaskList } from "@/features/hrm/components/tasks/task-list";
import { Suspense } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Briefcase, LayoutDashboard, ListTodo } from "lucide-react";

export default function TasksPage() {
  return (
    <div className="flex flex-col min-h-screen bg-slate-50/50">
      {/* Premium Header */}
      <div className="relative bg-white border-b overflow-hidden shadow-sm z-10">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-50/50 via-white to-indigo-50/50 opacity-70 pointer-events-none" />
        <div className="relative flex flex-col gap-2 p-6 lg:px-8 max-w-[1600px] mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl shadow-inner">
              <Briefcase className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">Quản lý Công việc & KPI</h1>
              <p className="text-sm text-slate-500 mt-1.5">
                Theo dõi tiến độ, phân công và đánh giá chất lượng công việc toàn diện.
              </p>
            </div>
          </div>
        </div>
      </div>

      <div className="flex-1 p-6 lg:px-8 max-w-[1600px] mx-auto w-full">
        <Tabs defaultValue="list" className="w-full flex flex-col">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
            <TabsList className="bg-white border border-slate-200/60 shadow-sm p-1 rounded-lg">
              <TabsTrigger value="list" className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
                <ListTodo className="w-4 h-4" /> Danh sách
              </TabsTrigger>
              <TabsTrigger value="dashboard" className="flex items-center gap-2 px-4 py-2 rounded-md data-[state=active]:bg-blue-50 data-[state=active]:text-blue-700 data-[state=active]:shadow-sm transition-all">
                <LayoutDashboard className="w-4 h-4" /> Bảng điều khiển
              </TabsTrigger>
            </TabsList>
            {/* Thao tác chính sẽ được tích hợp bên trong TaskList */}
          </div>

          <TabsContent value="dashboard" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <TaskDashboard />
          </TabsContent>

          <TabsContent value="list" className="mt-0 outline-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            <Suspense fallback={<div className="p-12 text-center text-slate-500 flex flex-col items-center justify-center space-y-4">
              <div className="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
              <p>Đang tải danh sách công việc...</p>
            </div>}>
              <TaskList />
            </Suspense>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
