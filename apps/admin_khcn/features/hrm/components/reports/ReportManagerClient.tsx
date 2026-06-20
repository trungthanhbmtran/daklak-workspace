"use client";

import React, { useMemo, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useTasksList } from "@/features/hrm/hooks/useTasks";
import { Loader2, Download, Filter, CalendarDays, CheckCircle2, AlertTriangle, Clock, Activity, BarChart3, Presentation, Briefcase, ListTodo } from "lucide-react";
import { isThisWeek, isThisMonth, isThisQuarter, isThisYear, parseISO, isPast } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { toast } from "sonner";

export function ReportManagerClient() {
  const { data: tasksRes, isLoading } = useTasksList({ pageSize: 2000 });
  const allTasks = tasksRes?.data || [];

  const [activeTab, setActiveTab] = useState("progress");

  // --- Hàm Lọc Theo Mốc Thời Gian ---
  const filterTasksByTime = (timeMode: string) => {
    return allTasks.filter((task: any) => {
      if (!task.createdAt) return false;
      const date = parseISO(task.createdAt);
      switch (timeMode) {
        case "week": return isThisWeek(date);
        case "month": return isThisMonth(date);
        case "quarter": return isThisQuarter(date);
        case "year": return isThisYear(date);
        default: return true; // progress (Tất cả)
      }
    });
  };

  const tasks = filterTasksByTime(activeTab);

  // --- Tính toán Summary ---
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED' || t.progress === 100).length;
  const pendingTasks = totalTasks - completedTasks;
  const now = new Date();
  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === 'COMPLETED' || t.progress === 100) return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < now;
  }).length;

  const handleExport = () => {
    toast.success("Tính năng xuất báo cáo (Excel/PDF) đang được cập nhật!");
  };

  const renderSummaryCards = (titlePrefix: string) => (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-blue-50/50 dark:bg-slate-900 border-blue-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-slate-800 flex items-center justify-center">
            <ListTodo className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Tổng công việc {titlePrefix}</p>
            <h4 className="text-2xl font-bold text-slate-900 dark:text-slate-100">{totalTasks}</h4>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-emerald-50/50 dark:bg-slate-900 border-emerald-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-slate-800 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Đã hoàn thành</p>
            <h4 className="text-2xl font-bold text-emerald-600">{completedTasks}</h4>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-amber-50/50 dark:bg-slate-900 border-amber-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-slate-800 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Đang xử lý</p>
            <h4 className="text-2xl font-bold text-amber-600">{pendingTasks}</h4>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-rose-50/50 dark:bg-slate-900 border-rose-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-rose-100 dark:bg-slate-800 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-500">Trễ hạn</p>
            <h4 className="text-2xl font-bold text-rose-600">{overdueTasks}</h4>
          </div>
        </CardContent>
      </Card>
    </div>
  );

  const renderDataTable = () => (
    <Card className="border-slate-200 dark:border-slate-800 shadow-sm">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg font-bold text-slate-800 dark:text-slate-100 flex items-center gap-2">
          <Briefcase className="h-5 w-5 text-indigo-500" />
          Danh sách chi tiết công việc
        </CardTitle>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-8">
            <Filter className="w-4 h-4 mr-1.5" />
            Lọc nâng cao
          </Button>
          <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700" onClick={handleExport}>
            <Download className="w-4 h-4 mr-1.5" />
            Xuất báo cáo
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="py-20 flex flex-col items-center justify-center text-slate-400">
            <Loader2 className="w-8 h-8 animate-spin mb-4" />
            <p>Đang tải dữ liệu báo cáo...</p>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center text-slate-500 dark:text-slate-400">
            Không có dữ liệu công việc trong kỳ báo cáo này.
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow className="bg-slate-50 dark:bg-slate-800/50">
                <TableHead className="w-[40%]">Tên công việc</TableHead>
                <TableHead>Trạng thái</TableHead>
                <TableHead>Tiến độ</TableHead>
                <TableHead>Hạn xử lý</TableHead>
                <TableHead>Người phụ trách</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tasks.slice(0, 15).map((task: any) => {
                const assignee = task.participants?.find((p: any) => p.participantRole === 'ASSIGNEE');
                const assigneeName = assignee?.employee?.fullName || assignee?.employeeCode || "Chưa phân công";
                const isCompleted = task.status === 'COMPLETED' || task.progress === 100;
                
                let statusBadge = <span className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded text-xs font-medium">Chờ xử lý</span>;
                if (isCompleted) {
                  statusBadge = <span className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded text-xs font-medium">Hoàn thành</span>;
                } else if (task.status === 'IN_PROGRESS') {
                  statusBadge = <span className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded text-xs font-medium">Đang xử lý</span>;
                }

                return (
                  <TableRow key={task.id}>
                    <TableCell className="font-medium text-slate-700 dark:text-slate-200">
                      <div className="truncate max-w-[300px]" title={task.title}>{task.title}</div>
                    </TableCell>
                    <TableCell>{statusBadge}</TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="w-16 h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${isCompleted ? 'bg-emerald-500' : 'bg-blue-500'}`} 
                            style={{ width: `${task.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-xs font-medium text-slate-500">{task.progress || 0}%</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-slate-500 text-sm">
                      {task.dueDate ? new Date(task.dueDate).toLocaleDateString('vi-VN') : '--/--/----'}
                    </TableCell>
                    <TableCell className="text-sm">{assigneeName}</TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );

  return (
    <div className="p-6 md:p-8 min-h-screen bg-slate-50 dark:bg-slate-950 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h2 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-slate-100 flex items-center gap-3">
            <Presentation className="h-8 w-8 text-indigo-600" />
            Quản lý báo cáo công việc
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            Tổng hợp và phân tích hiệu suất xử lý công việc theo các mốc thời gian.
          </p>
        </div>
      </div>

      <Tabs defaultValue="progress" className="space-y-6" onValueChange={setActiveTab}>
        <TabsList className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 p-1 shadow-sm rounded-lg">
          <TabsTrigger value="progress" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
            <Activity className="w-4 h-4 mr-2" />
            Báo cáo tiến độ
          </TabsTrigger>
          <TabsTrigger value="week" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
            <CalendarDays className="w-4 h-4 mr-2" />
            Báo cáo tuần
          </TabsTrigger>
          <TabsTrigger value="month" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Báo cáo tháng
          </TabsTrigger>
          <TabsTrigger value="quarter" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
            <BarChart3 className="w-4 h-4 mr-2" />
            Báo cáo quý
          </TabsTrigger>
          <TabsTrigger value="year" className="data-[state=active]:bg-indigo-50 data-[state=active]:text-indigo-700 dark:data-[state=active]:bg-indigo-900/50 dark:data-[state=active]:text-indigo-300">
            <Presentation className="w-4 h-4 mr-2" />
            Báo cáo năm
          </TabsTrigger>
        </TabsList>

        <TabsContent value="progress" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderSummaryCards("tổng")}
          {renderDataTable()}
        </TabsContent>

        <TabsContent value="week" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderSummaryCards("trong tuần")}
          {renderDataTable()}
        </TabsContent>

        <TabsContent value="month" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderSummaryCards("trong tháng")}
          {renderDataTable()}
        </TabsContent>

        <TabsContent value="quarter" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderSummaryCards("trong quý")}
          {renderDataTable()}
        </TabsContent>

        <TabsContent value="year" className="animate-in fade-in slide-in-from-bottom-4 duration-500">
          {renderSummaryCards("trong năm")}
          {renderDataTable()}
        </TabsContent>
      </Tabs>
    </div>
  );
}
