import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Heading, Text } from "@/components/ui/typography";
import { CheckCircle2, AlertTriangle, Clock, ListTodo } from "lucide-react";

interface ReportSummaryCardsProps {
  isLoading: boolean;
  tasks: any[];
  titlePrefix: string;
}

export const ReportSummaryCards = React.memo(function ReportSummaryCards({ isLoading, tasks, titlePrefix }: ReportSummaryCardsProps) {
  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t: any) => t.status === 'COMPLETED' || t.progress === 100).length;
  const pendingTasks = totalTasks - completedTasks;
  const now = new Date();
  const overdueTasks = tasks.filter((t: any) => {
    if (t.status === 'COMPLETED' || t.progress === 100) return false;
    if (!t.dueDate) return false;
    return new Date(t.dueDate) < now;
  }).length;

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        {[...Array(4)].map((_, i) => (
          <Card key={i} className="border-slate-200 dark:border-slate-800">
            <CardContent className="p-6 flex items-center gap-4">
              <div className="h-12 w-12 rounded-lg bg-slate-200 dark:bg-slate-800 animate-pulse"></div>
              <div className="flex-1">
                <div className="h-4 w-24 bg-slate-200 dark:bg-slate-800 rounded animate-pulse mb-2"></div>
                <div className="h-8 w-12 bg-slate-200 dark:bg-slate-800 rounded animate-pulse"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      <Card className="bg-blue-50/50 dark:bg-slate-900 border-blue-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-blue-100 dark:bg-slate-800 flex items-center justify-center">
            <ListTodo className="h-6 w-6 text-blue-600" />
          </div>
          <div>
            <Text variant="small" weight="medium" className="text-slate-500">Tổng công việc {titlePrefix}</Text>
            <Heading level="h4" className="text-slate-900 dark:text-slate-100">{totalTasks}</Heading>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-emerald-50/50 dark:bg-slate-900 border-emerald-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-emerald-100 dark:bg-slate-800 flex items-center justify-center">
            <CheckCircle2 className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <Text variant="small" weight="medium" className="text-slate-500">Đã hoàn thành</Text>
            <Heading level="h4" className="text-emerald-600">{completedTasks}</Heading>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-amber-50/50 dark:bg-slate-900 border-amber-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-amber-100 dark:bg-slate-800 flex items-center justify-center">
            <Clock className="h-6 w-6 text-amber-600" />
          </div>
          <div>
            <Text variant="small" weight="medium" className="text-slate-500">Đang xử lý</Text>
            <Heading level="h4" className="text-amber-600">{pendingTasks}</Heading>
          </div>
        </CardContent>
      </Card>
      <Card className="bg-rose-50/50 dark:bg-slate-900 border-rose-100 dark:border-slate-800">
        <CardContent className="p-6 flex items-center gap-4">
          <div className="h-12 w-12 rounded-lg bg-rose-100 dark:bg-slate-800 flex items-center justify-center">
            <AlertTriangle className="h-6 w-6 text-rose-600" />
          </div>
          <div>
            <Text variant="small" weight="medium" className="text-slate-500">Trễ hạn</Text>
            <Heading level="h4" className="text-rose-600">{overdueTasks}</Heading>
          </div>
        </CardContent>
      </Card>
    </div>
  );
});
