"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { CheckCircle, Clock, AlertTriangle, FileText, Loader2, Download, UserCheck, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import axiosInstance from "@/lib/axiosInstance";
import { useTaskStats } from "../../hooks/useTasks";
import { DashboardReportContainer, EmbeddedReportWidget } from "@/features/reports";

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';


const COLORS = ['#10b981', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6'];

export function TaskDashboard() {
  const { data: statsResponse, isLoading } = useTaskStats({ status: undefined, search: undefined });
  // API trả về chuẩn { success: true, data: { totalTasks: ..., departmentStats: ... } }
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData: any = (statsResponse as any)?.data ?? statsResponse ?? {};
  const rows: any[] = Array.isArray(rawData)
    ? rawData
    : (Array.isArray(rawData?.rows)
      ? rawData.rows
      : (Array.isArray(rawData?.items) ? rawData.items : []));

  // Extract or derive counts
  const totalTasks = Number(rawData?.totalTasks ?? rows.length);
  const completedTasks = Number(
    rawData?.completedTasks ??
    rows.filter(
      (r: any) =>
        r.status === 'Hoàn thành' ||
        r.isCompleted === 'Hoàn thành' ||
        Number(r.progress) === 100
    ).length
  );
  const overdueTasks = Number(
    rawData?.overdueTasks ??
    rows.filter((r: any) => r.isOverdue === 'Quá hạn').length
  );
  const inProgressTasks = Number(
    rawData?.inProgressTasks ??
    Math.max(0, totalTasks - completedTasks - overdueTasks)
  );

  // Department Stats
  let departmentStats: any[] =
    Array.isArray(rawData?.departmentStats) && rawData.departmentStats.length > 0
      ? rawData.departmentStats
      : [];

  if (departmentStats.length === 0 && rows.length > 0) {
    const deptMap = new Map<string, { completed: number; inTime: number; completedOverdue: number; overdue: number }>();
    for (const r of rows) {
      const dept = r.departmentName || 'Chưa phân công';
      if (!deptMap.has(dept)) {
        deptMap.set(dept, { completed: 0, inTime: 0, completedOverdue: 0, overdue: 0 });
      }
      const entry = deptMap.get(dept)!;
      const isDone = r.status === 'Hoàn thành' || r.isCompleted === 'Hoàn thành' || Number(r.progress) === 100;
      const isOverdue = r.isOverdue === 'Quá hạn';
      if (isDone) {
        if (isOverdue) entry.completedOverdue++;
        else entry.completed++;
      } else {
        if (isOverdue) entry.overdue++;
        else entry.inTime++;
      }
    }
    departmentStats = Array.from(deptMap.entries()).map(([name, val]) => ({ name, ...val }));
  }

  // Individual Stats
  let individualStats: any[] =
    Array.isArray(rawData?.individualStats) && rawData.individualStats.length > 0
      ? rawData.individualStats
      : [];

  if (individualStats.length === 0 && rows.length > 0) {
    const userMap = new Map<string, { completed: number; inTime: number; completedOverdue: number; overdue: number }>();
    for (const r of rows) {
      const name = r.assigneeName || r.assigneeCode || 'Chưa giao';
      if (!userMap.has(name)) {
        userMap.set(name, { completed: 0, inTime: 0, completedOverdue: 0, overdue: 0 });
      }
      const entry = userMap.get(name)!;
      const isDone = r.status === 'Hoàn thành' || r.isCompleted === 'Hoàn thành' || Number(r.progress) === 100;
      const isOverdue = r.isOverdue === 'Quá hạn';
      if (isDone) {
        if (isOverdue) entry.completedOverdue++;
        else entry.completed++;
      } else {
        if (isOverdue) entry.overdue++;
        else entry.inTime++;
      }
    }
    individualStats = Array.from(userMap.entries()).slice(0, 10).map(([name, val]) => ({ name, ...val }));
  }

  // KPI Stats
  let kpiStats: any[] =
    Array.isArray(rawData?.kpiStats) && rawData.kpiStats.length > 0
      ? rawData.kpiStats
      : [];

  if (kpiStats.length === 0 && rows.length > 0) {
    let excellent = 0;
    let good = 0;
    let fair = 0;
    let notCompleted = 0;
    for (const r of rows) {
      const isDone = r.status === 'Hoàn thành' || r.isCompleted === 'Hoàn thành' || Number(r.progress) === 100;
      const isOverdue = r.isOverdue === 'Quá hạn';
      if (isDone && !isOverdue) {
        if (Number(r.progress) >= 100) excellent++;
        else good++;
      } else if (isDone && isOverdue) {
        fair++;
      } else if (isOverdue) {
        notCompleted++;
      } else {
        good++;
      }
    }
    kpiStats = [
      { name: 'Hoàn thành xuất sắc', value: excellent },
      { name: 'Hoàn thành tốt', value: good },
      { name: 'Hoàn thành', value: fair },
      { name: 'Quá hạn / Chưa đạt', value: notCompleted },
    ].filter((item) => item.value > 0);
  }

  const stats = {
    totalTasks,
    completedTasks,
    inProgressTasks,
    overdueTasks,
    departmentStats,
    individualStats,
    kpiStats,
  };

  const [activeView, setActiveView] = useState<"workbench" | "agency">("workbench");
  const [isExporting, setIsExporting] = useState(false);

  const handleExport = async () => {
    setIsExporting(true);
    try {
      const { data: result } = await axiosInstance.post('/reports/document/generate', {
        templateName: 'Mau_05_QDKT.docx',
        data: stats
      });
      
      if (result.success && result.data) {
        const parsedData = typeof result.data === 'string' ? JSON.parse(result.data) : result.data;
        const base64 = parsedData.fileData;
        const link = document.createElement('a');
        link.href = 'data:application/vnd.openxmlformats-officedocument.wordprocessingml.document;base64,' + base64;
        link.download = parsedData.fileName || 'Bao_Cao.docx';
        link.click();
        toast.success("Xuất báo cáo thành công");
      } else {
        toast.error("Lỗi: " + result.message);
      }
    } catch (error) {
      toast.error("Lỗi khi kết nối đến máy chủ xuất báo cáo");
    } finally {
      setIsExporting(false);
    }
  };


  if (isLoading) {
    return (
      <div className="flex h-[400px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* View Switcher Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 border-b border-slate-200">
        <div className="flex items-center gap-1.5 p-1 bg-slate-100 dark:bg-slate-800 rounded-lg">
          <button
            onClick={() => setActiveView("workbench")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
              activeView === "workbench"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <UserCheck className="w-4 h-4" />
            Bàn làm việc của tôi
          </button>
          <button
            onClick={() => setActiveView("agency")}
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-md text-xs sm:text-sm font-semibold transition-all ${
              activeView === "agency"
                ? "bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-400 shadow-xs"
                : "text-slate-600 dark:text-slate-400 hover:text-slate-900"
            }`}
          >
            <BarChart2 className="w-4 h-4" />
            Thống kê toàn cơ quan (Lãnh đạo)
          </button>
        </div>

        {activeView === "agency" && (
          <Button onClick={handleExport} disabled={isExporting} size="sm" className="h-8 text-xs bg-blue-600 hover:bg-blue-700">
            {isExporting ? <Loader2 className="mr-2 h-3.5 w-3.5 animate-spin" /> : <Download className="mr-2 h-3.5 w-3.5" />}
            Xuất Báo cáo (Mẫu 05)
          </Button>
        )}
      </div>

      {activeView === "workbench" ? (
        <div className="space-y-6 min-w-0">
          <EmbeddedReportWidget
            reportIdOrCode="REP_PERSONAL_WORKBENCH"
            title="Bàn làm việc Nhiệm vụ Cá nhân & Điều phối"
            description="Báo cáo phân tích động từ Report Service: Chỉ số năng suất, xu hướng 6 tháng và cân đối tải phòng ban"
            columns={2}
            chartHeight={260}
            showDetailLink={true}
            allowToggleType={true}
          />
        </div>
      ) : (
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

      {/* Dynamic Report Service Integration */}
      <DashboardReportContainer
        dashboardKey="tasks"
        defaultReportCode="REP_HRM_TASKS"
        defaultTitle="Báo cáo Phân tích Nhiệm vụ Động (từ Report Service)"
        defaultDescription="Biểu đồ phân tích chuyên sâu được định nghĩa và đồng bộ trực tiếp từ Hệ thống Báo cáo & Thống kê (REP_HRM_TASKS)"
      />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-7">
        <Card className="col-span-4">
          <CardHeader>
            <CardTitle>Tiến độ công việc theo phòng ban</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {departmentStats.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={departmentStats} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval="preserveEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="completed" name="Hoàn thành" stackId="a" fill="#10b981" maxBarSize={40} />
                    <Bar dataKey="inTime" name="Trong hạn" stackId="a" fill="#3b82f6" maxBarSize={40} />
                    <Bar dataKey="completedOverdue" name="Hoàn thành quá hạn" stackId="a" fill="#f59e0b" maxBarSize={40} />
                    <Bar dataKey="overdue" name="Quá hạn" stackId="a" fill="#ef4444" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400 border border-dashed rounded-md mx-6">
                Chưa có dữ liệu phòng ban
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
                      {kpiStats.map((entry: any, index: number) => (
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

      <div className="grid gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Tiến độ công việc theo cá nhân</CardTitle>
          </CardHeader>
          <CardContent className="pl-0">
            {individualStats.length > 0 ? (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={individualStats} margin={{ top: 10, right: 30, left: 0, bottom: 40 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                    <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} interval="preserveEnd" />
                    <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={false} tickLine={false} />
                    <RechartsTooltip
                      contentStyle={{ borderRadius: '8px', border: '1px solid #e2e8f0', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Legend wrapperStyle={{ fontSize: '12px', paddingTop: '20px' }} />
                    <Bar dataKey="completed" name="Hoàn thành" stackId="a" fill="#10b981" maxBarSize={40} />
                    <Bar dataKey="inTime" name="Trong hạn" stackId="a" fill="#3b82f6" maxBarSize={40} />
                    <Bar dataKey="completedOverdue" name="Hoàn thành quá hạn" stackId="a" fill="#f59e0b" maxBarSize={40} />
                    <Bar dataKey="overdue" name="Quá hạn" stackId="a" fill="#ef4444" maxBarSize={40} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-[280px] flex items-center justify-center text-slate-400 border border-dashed rounded-md mx-6">
                Chưa có dữ liệu cá nhân
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="pt-2">
        <EmbeddedReportWidget
          reportIdOrCode="REP_BTCTU_SOP_KPI"
          title="Báo cáo Đánh giá, Xếp loại Cán bộ Toàn cơ quan (Chuẩn SOP & Mẫu 05)"
          description="Tổng hợp phân bổ xếp loại, tiến độ SOP 4 bước và điểm năng suất cán bộ từ Report Service"
          columns={2}
          chartHeight={260}
          showDetailLink={true}
          allowToggleType={true}
        />
      </div>
    </div>
  )}
</div>
);
}

