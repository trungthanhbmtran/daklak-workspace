"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MOCK_TASKS } from "./mock-data";
import { CheckCircle, Clock, AlertTriangle, FileText } from "lucide-react";

export function TaskDashboard() {
  const totalTasks = MOCK_TASKS.length;
  const completedTasks = MOCK_TASKS.filter((t) => t.status === "COMPLETED").length;
  const inProgressTasks = MOCK_TASKS.filter((t) => t.status === "IN_PROGRESS" || t.status === "ASSIGNED").length;
  const overdueTasks = MOCK_TASKS.filter(
    (t) => t.status !== "COMPLETED" && new Date(t.dueDate) < new Date()
  ).length;

  return (
    <div className="space-y-4">
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tổng số công việc</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalTasks}</div>
            <p className="text-xs text-muted-foreground">
              Tất cả công việc trong tháng
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <p className="text-xs text-muted-foreground">
              Công việc đang thực hiện
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <p className="text-xs text-muted-foreground">
              {Math.round((completedTasks / totalTasks) * 100) || 0}% hoàn thành
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
            <p className="text-xs text-muted-foreground">
              Cần ưu tiên xử lý ngay
            </p>
          </CardContent>
        </Card>
      </div>
      
      {/* KPI Charts could go here */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tiến độ công việc</CardTitle>
          </CardHeader>
          <CardContent className="pl-2">
             <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md bg-slate-50 text-slate-400">
               [Biểu đồ cột: Tiến độ theo phòng ban]
             </div>
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Đánh giá chất lượng (KPI)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[200px] flex items-center justify-center border border-dashed rounded-md bg-slate-50 text-slate-400">
               [Biểu đồ tròn: Tỉ lệ Xuất sắc, Tốt, Đạt...]
             </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
