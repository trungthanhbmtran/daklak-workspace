"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Text } from "@/components/ui/typography";
import { CheckCircle, Clock, AlertTriangle, FileText, Loader2, Download, UserCheck, BarChart2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { useState } from "react";
import { useTaskStats } from "../../hooks/useTasks";
import { DashboardReportContainer, EmbeddedReportWidget } from "@/features/reports";
import { downloadReportRunExport, useGetReportDefinitions } from "@/features/reports/api";

export function TaskDashboard() {
  const { data: statsResponse, isLoading } = useTaskStats({ status: undefined, search: undefined });
  const { data: allReportDefs } = useGetReportDefinitions();
  
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rawData: any = (statsResponse as any)?.data ?? statsResponse ?? {};
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const rows: any[] = Array.isArray(rawData)
    ? rawData
    : (Array.isArray(rawData?.rows)
      ? rawData.rows
      : (Array.isArray(rawData?.items) ? rawData.items : []));

  // Extract counts from backend API
  const totalTasks = Number(rawData?.totalTasks ?? rows.length);
  const completedTasks = Number(
    rawData?.completedTasks ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.filter((r: any) =>
      r.status === 'Hoàn thành' ||
      r.isCompleted === 'Hoàn thành' ||
      Number(r.progress) === 100
    ).length
  );
  const overdueTasks = Number(
    rawData?.overdueTasks ??
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    rows.filter((r: any) => r.isOverdue === 'Quá hạn').length
  );
  const inProgressTasks = Number(
    rawData?.inProgressTasks ??
    Math.max(0, totalTasks - completedTasks - overdueTasks)
  );

  const [activeView, setActiveView] = useState<"workbench" | "agency">("workbench");
  const [isExporting, setIsExporting] = useState(false);

  // Xuất Báo cáo Mẫu 05 trực tiếp từ Report Service
  const handleExport = async () => {
    setIsExporting(true);
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const btctuDef = allReportDefs?.find((d: any) => d.code === "REP_BTCTU_SOP_KPI");
      const latestRunId = btctuDef?.latestRun?.id || (Array.isArray(btctuDef?.runs) && btctuDef.runs[0]?.id) || 47;
      await downloadReportRunExport(latestRunId, "decision");
      toast.success("Xuất quyết định xếp loại Mẫu 05 thành công");
    } catch {
      toast.error("Không thể xuất báo cáo từ Report Service");
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
            Xuất Quyết định Mẫu 05 (Report Service)
          </Button>
        )}
      </div>

      {activeView === "workbench" ? (
        <div className="space-y-6 min-w-0">
          <EmbeddedReportWidget
            reportIdOrCode="REP_PERSONAL_WORKBENCH"
            title="Bàn làm việc Nhiệm vụ Cá nhân & Điều phối"
            description="Báo cáo phân tích động kế thừa từ Report Service: Chỉ số năng suất, xu hướng 6 tháng và cân đối tải phòng ban"
            columns={2}
            chartHeight={260}
            showDetailLink={true}
            allowToggleType={true}
          />
        </div>
      ) : (
        <div className="space-y-6 min-w-0">
          {/* Quick Stat Cards */}
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

          {/* Dynamic Report Service: Đánh giá Xếp loại Cán bộ Chuẩn SOP & Mẫu 05 */}
          <EmbeddedReportWidget
            reportIdOrCode="REP_BTCTU_SOP_KPI"
            title="Báo cáo Đánh giá, Xếp loại Cán bộ Toàn cơ quan (Chuẩn SOP & Mẫu 05)"
            description="Tổng hợp phân bổ xếp loại, tiến độ SOP 4 bước và điểm năng suất cán bộ từ Report Service"
            columns={2}
            chartHeight={260}
            showDetailLink={true}
            allowToggleType={true}
          />

          {/* Dynamic Report Service: Phân tích Tiến độ & Tải công việc */}
          <DashboardReportContainer
            dashboardKey="tasks"
            defaultReportCode="REP_HRM_TASKS"
            defaultTitle="Báo cáo Phân tích Nhiệm vụ Động (từ Report Service)"
            defaultDescription="Biểu đồ phân tích chuyên sâu được định nghĩa và đồng bộ trực tiếp từ Hệ thống Báo cáo & Thống kê (REP_HRM_TASKS)"
          />
        </div>
      )}
    </div>
  );
}

