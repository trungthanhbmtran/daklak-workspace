"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useTasksList } from "../../hooks/useTasks";
import { CheckCircle, Clock, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { HrmTask } from "../../types/task";

export function TaskDashboard() {
  const { data, isLoading } = useTasksList({});
  const tasks: HrmTask[] = (data as any)?.data ?? [];

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status?.toUpperCase() === "COMPLETED" || t.status?.toUpperCase() === "HOÀN THÀNH").length;
  const inProgressTasks = tasks.filter((t) => t.status?.toUpperCase() === "IN_PROGRESS" || t.status?.toUpperCase() === "ĐANG XỬ LÝ" || t.status?.toUpperCase() === "ASSIGNED" || t.status?.toUpperCase() === "MỚI GIAO").length;
  const overdueTasks = tasks.filter(
    (t) => t.status?.toUpperCase() !== "COMPLETED" && t.status?.toUpperCase() !== "HOÀN THÀNH" && new Date(t.dueDate) < new Date()
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-40 text-slate-400">
        <Loader2 className="w-6 h-6 animate-spin mr-2" />
        Đang tải dữ liệu tổng quan...
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
        {/* Card 1: Tổng số */}
        <Card className="relative overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <FileText className="w-16 h-16 text-blue-600" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600">Tổng số công việc</CardTitle>
            <div className="p-2 bg-blue-50 rounded-lg">
              <FileText className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800">{totalTasks}</div>
            <p className="text-xs text-slate-500 mt-1">
              Tất cả công việc được giao
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-blue-400 to-blue-600" />
        </Card>

        {/* Card 2: Đang xử lý */}
        <Card className="relative overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <Clock className="w-16 h-16 text-amber-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600">Đang xử lý</CardTitle>
            <div className="p-2 bg-amber-50 rounded-lg">
              <Clock className="h-4 w-4 text-amber-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800">{inProgressTasks}</div>
            <p className="text-xs text-slate-500 mt-1">
              Đang trong quá trình thực hiện
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-amber-400 to-orange-500" />
        </Card>

        {/* Card 3: Hoàn thành */}
        <Card className="relative overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <CheckCircle className="w-16 h-16 text-emerald-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600">Đã hoàn thành</CardTitle>
            <div className="p-2 bg-emerald-50 rounded-lg">
              <CheckCircle className="h-4 w-4 text-emerald-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-slate-800">{completedTasks}</div>
            <p className="text-xs text-slate-500 mt-1">
              {Math.round((completedTasks / (totalTasks || 1)) * 100)}% tổng số công việc
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-emerald-400 to-green-500" />
        </Card>

        {/* Card 4: Quá hạn */}
        <Card className="relative overflow-hidden border-slate-200/60 shadow-sm hover:shadow-md transition-shadow group">
          <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-500">
            <AlertTriangle className="w-16 h-16 text-rose-500" />
          </div>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 relative z-10">
            <CardTitle className="text-sm font-semibold text-slate-600">Quá hạn</CardTitle>
            <div className="p-2 bg-rose-50 rounded-lg">
              <AlertTriangle className="h-4 w-4 text-rose-600" />
            </div>
          </CardHeader>
          <CardContent className="relative z-10">
            <div className="text-3xl font-bold text-rose-600">{overdueTasks}</div>
            <p className="text-xs text-rose-500/80 mt-1">
              Cần ưu tiên xử lý ngay
            </p>
          </CardContent>
          <div className="absolute bottom-0 left-0 h-1 w-full bg-gradient-to-r from-rose-500 to-red-600" />
        </Card>
      </div>
      
      {/* KPI Charts could go here */}
      <div className="grid gap-4 sm:gap-6 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-1 lg:col-span-4 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-slate-50/50 py-4">
            <CardTitle className="text-base font-semibold">Tiến độ công việc</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
             <div className="h-[240px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                 <FileText className="w-6 h-6 text-slate-300" />
               </div>
               <span className="text-sm">Biểu đồ tiến độ theo đơn vị / phòng ban</span>
               <span className="text-xs mt-1 text-slate-400/70">(Chờ tích hợp dữ liệu)</span>
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-1 lg:col-span-3 border-slate-200/60 shadow-sm hover:shadow-md transition-shadow">
          <CardHeader className="border-b bg-slate-50/50 py-4">
            <CardTitle className="text-base font-semibold">Đánh giá chất lượng (KPI)</CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="h-[240px] flex flex-col items-center justify-center border-2 border-dashed border-slate-200 rounded-xl bg-slate-50 text-slate-400">
               <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center mb-3">
                 <CheckCircle className="w-6 h-6 text-slate-300" />
               </div>
               <span className="text-sm">Tỉ lệ xuất sắc, tốt, đạt</span>
               <span className="text-xs mt-1 text-slate-400/70">(Chờ tích hợp dữ liệu)</span>
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
