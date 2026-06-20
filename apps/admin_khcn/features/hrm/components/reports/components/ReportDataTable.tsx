import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Briefcase, Download, Filter } from "lucide-react";
import { toast } from "sonner";

interface ReportDataTableProps {
  isLoading: boolean;
  tasks: any[];
}

export const ReportDataTable = React.memo(function ReportDataTable({ isLoading, tasks }: ReportDataTableProps) {
  const handleExport = () => {
    toast.success("Tính năng xuất báo cáo (Excel/PDF) đang được cập nhật!");
  };

  return (
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
          <div className="space-y-4 py-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center space-x-4 animate-pulse">
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-[40%]"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-[15%]"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-[15%]"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-[15%]"></div>
                <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-[15%]"></div>
              </div>
            ))}
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
});
