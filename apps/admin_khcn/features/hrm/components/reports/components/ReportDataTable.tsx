/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
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
          <Button variant="outline" size="sm" className="h-8" iconStart={<Filter className="w-4 h-4 .5" />}>Lọc nâng cao</Button>
          <Button size="sm" className="h-8 bg-indigo-600 hover:bg-indigo-700" onClick={handleExport} iconStart={<Download className="w-4 h-4 .5" />}>Xuất báo cáo</Button>
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
          <Text className="py-20 text-center text-slate-500 dark:text-slate-400 block">
            Không có dữ liệu công việc trong kỳ báo cáo này.
          </Text>
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
                
                let statusBadge = <Text as="span" variant="small" weight="medium" className="px-2 py-0.5 bg-slate-100 text-slate-600 rounded">Chờ xử lý</Text>;
                if (isCompleted) {
                  statusBadge = <Text as="span" variant="small" weight="medium" className="px-2 py-0.5 bg-emerald-100 text-emerald-700 rounded">Hoàn thành</Text>;
                } else if (task.status === 'IN_PROGRESS') {
                  statusBadge = <Text as="span" variant="small" weight="medium" className="px-2 py-0.5 bg-blue-100 text-blue-700 rounded">Đang xử lý</Text>;
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
                        <Text as="span" variant="small" weight="medium" className="text-slate-500">{task.progress || 0}%</Text>
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
