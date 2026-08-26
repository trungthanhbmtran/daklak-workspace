"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { CheckCircle, Clock, AlertTriangle, FileText, Loader2 } from "lucide-react";
import { useTasksList } from "../../hooks/useTasks";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import { useMemo } from "react";

const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function TaskDashboard() {
  const { data: responseData, isLoading } = useTasksList({ status: undefined, search: undefined });
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const tasks: any[] = (responseData as any)?.data ?? [];

  const { totalTasks, completedTasks, inProgressTasks, overdueTasks, assigneeStats, kpiStats } = useMemo(() => {
    const total = tasks.length;
    let completed = 0;
    let inProgress = 0;
    let overdue = 0;
    const assigneeMap: Record<string, { name: string, count: number, totalProgress: number }> = {};
    const kpiMap: Record<string, number> = {};

    tasks.forEach(t => {
      // Basic metrics
      if (t.status === "COMPLETED" || t.status === "DONE") completed++;
      else if (t.status === "IN_PROGRESS" || t.status === "ASSIGNED") inProgress++;
      
      if (t.status !== "COMPLETED" && t.status !== "DONE" && new Date(t.dueDate) < new Date()) {
        overdue++;
      }

      // Assignee stats
      const assignee = t.assigneeName || t.assigneeDepartment?.name || t.assignee?.fullName || "Chưa phân công";
      if (!assigneeMap[assignee]) {
        assigneeMap[assignee] = { name: assignee, count: 0, totalProgress: 0 };
      }
      assigneeMap[assignee].count++;
      assigneeMap[assignee].totalProgress += (t.progress || 0);

      // KPI stats
      if (t.kpi?.qualityGrade) {
        const grade = t.kpi.qualityGrade;
        kpiMap[grade] = (kpiMap[grade] || 0) + 1;
      } else if (t.status === "COMPLETED" || t.status === "DONE") {
        kpiMap["Chưa đánh giá"] = (kpiMap["Chưa đánh giá"] || 0) + 1;
      }
    });

    const assigneeStatsArray = Object.values(assigneeMap)
      .map(item => ({
        name: item.name,
        avgProgress: Math.round(item.totalProgress / item.count)
      }))
      .sort((a, b) => b.avgProgress - a.avgProgress)
      .slice(0, 10); // top 10

    const kpiStatsArray = Object.entries(kpiMap).map(([name, value]) => ({ name, value }));

    return { totalTasks: total, completedTasks: completed, inProgressTasks: inProgress, overdueTasks: overdue, assigneeStats: assigneeStatsArray, kpiStats: kpiStatsArray };
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

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
            <Text variant="small" className="text-muted-foreground font-normal">
              Tất cả công việc
            </Text>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Đang xử lý</CardTitle>
            <Clock className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{inProgressTasks}</div>
            <Text variant="small" className="text-muted-foreground font-normal">
              Công việc đang thực hiện
            </Text>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoàn thành</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedTasks}</div>
            <Text variant="small" className="text-muted-foreground font-normal">
              {Math.round((completedTasks / (totalTasks || 1)) * 100)}% hoàn thành
            </Text>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Quá hạn</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-500">{overdueTasks}</div>
            <Text variant="small" className="text-muted-foreground font-normal">
              Cần ưu tiên xử lý ngay
            </Text>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tiến độ trung bình theo người xử lý</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {assigneeStats.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={assigneeStats} margin={{ top: 10, right: 30, left: 0, bottom: 25 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval={0} angle={-25} textAnchor="end" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} domain={[0, 100]} />
                    <RechartsTooltip 
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                      formatter={(value) => [`${value}%`, 'Tiến độ']}
                    />
                    <Bar dataKey="avgProgress" fill="#3b82f6" radius={[4, 4, 0, 0]} maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400 border border-dashed rounded-md mx-6">
                Chưa có dữ liệu người xử lý
              </div>
            )}
          </CardContent>
        </Card>
        <Card className="col-span-3">
          <CardHeader>
            <CardTitle>Đánh giá chất lượng (KPI)</CardTitle>
          </CardHeader>
          <CardContent>
            {kpiStats.length > 0 ? (
              <div className="h-[280px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={kpiStats}
                      cx="50%"
                      cy="45%"
                      innerRadius={60}
                      outerRadius={85}
                      paddingAngle={2}
                      dataKey="value"
                    >
                      {kpiStats.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip 
                      formatter={(value) => [`${value} công việc`, 'Số lượng']}
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '10px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400 border border-dashed rounded-md">
                Chưa có dữ liệu đánh giá KPI
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
