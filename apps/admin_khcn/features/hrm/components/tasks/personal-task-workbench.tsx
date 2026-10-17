/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Collapsible,
  CollapsibleTrigger,
  CollapsibleContent,
} from "@/components/ui/collapsible";
import { EmbeddedReportWidget } from "@/features/reports";
import {
  Calendar,
  CheckCircle,
  Clock,
  AlertTriangle,
  AlertCircle,
  TrendingUp,
  RotateCw,
  User,
  ChevronDown,
  Eye,
  Printer,
  Send,
  Building2,
  Compass,
  CheckCircle2,
  Loader2,
  Sparkles,
  UserCheck,
  CalendarCheck,
  FileText,
  Briefcase,
} from "lucide-react";
import { toast } from "sonner";
import { usePermissions } from "@/hooks/usePermissions";
import { useTasksList, usePersonalWorkbench } from "../../hooks/useTasks";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";

import { TaskDetailDrawer } from "./task-detail-drawer";

export function PersonalTaskWorkbench() {
  const { user, isGlobalAdmin } = usePermissions();
  const userName = user?.fullName || user?.username || "Người dùng";

  const userDept =
    user?.unitName ||
    user?.departmentName ||
    (isGlobalAdmin ? "Ban Quản trị Hệ thống / Toàn cơ quan" : "Cơ quan / Đơn vị");
  const userUnitId = user?.unitId || user?.departmentId || "";
  const userEmpCode = user?.employeeCode || "";

  // Filter States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUnitScope, setSelectedUnitScope] = useState<string>("");

  const { data: departmentOptions = [] } = useOrganizationFlatListQuery(undefined, { enabled: isGlobalAdmin });

  // Modal / Drawer States
  const [isSelfEvalOpen, setIsSelfEvalOpen] = useState(false);
  const [selectedDrawerTaskId, setSelectedDrawerTaskId] = useState<number | null>(null);

  // Collapsible for completed tasks this month (Lazy loaded on expand)
  const [isCompletedOpen, setIsCompletedOpen] = useState(false);

  // Collapsible for recent tasks
  const [isRecentTasksOpen, setIsRecentTasksOpen] = useState(false);

  // ── Lấy toàn bộ dữ liệu bàn làm việc chuẩn hóa và tính toán tại server ──
  const { data: workbenchRes, isLoading: isLoadingTasks } = usePersonalWorkbench({
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    unitScope: selectedUnitScope,
    search: searchQuery || undefined,
    category: activeCategory !== "ALL" ? activeCategory : undefined,
  });

  const workbenchData: any = workbenchRes;

  const personalMetrics = workbenchData?.metrics || {
    total: 0,
    completed: 0,
    overdue: 0,
    completedOverdue: 0,
    dueSoon: 0,
    completionRate: 100,
  };
  const actionItems = workbenchData?.actionItems || [];
  const recentTasks = workbenchData?.recentTasks || [];
  const workloadBenchmark = workbenchData?.workloadBenchmark || {
    personalScore: 0,
    departmentAverage: 0,
    diffPercent: 0,
    isLower: true,
    evaluation: "Đang tải dữ liệu...",
  };

  // Lazy query: Nhiệm vụ hoàn thành trong tháng này (chỉ fetch khi user mở Collapsible)
  const { data: completedMonthData, isLoading: isLoadingCompletedMonth } = useTasksList(
    isCompletedOpen
      ? {
          status: "ALL",
          filter: "COMPLETED_THIS_MONTH",
          assigneeCode: userEmpCode,
          limit: 50,
        }
      : undefined
  );

  // Danh sách việc đã hoàn thành tháng này
  const completedThisMonthTasks = useMemo(() => {
    if (!isCompletedOpen) return [];

    const serverItems = (completedMonthData as any)?.data;
    if (Array.isArray(serverItems) && serverItems.length > 0) {
      return serverItems.map((t: any) => {
        const d = t.completedAt ? new Date(t.completedAt) : t.updatedAt ? new Date(t.updatedAt) : new Date();
        return {
          id: t.id,
          title: t.title,
          completedDate: `${d.getDate().toString().padStart(2, "0")}/${(d.getMonth() + 1).toString().padStart(2, "0")}/${d.getFullYear()}`,
          score: t.baseScore || 95,
          role: t.assigneeCode === userEmpCode ? "Chủ trì" : "Phối hợp",
        };
      });
    }

    return [];
  }, [isCompletedOpen, completedMonthData, userEmpCode]);

  const handleQuickPreset = (preset: "ALL" | "MONTH" | "QUARTER") => {
    const now = new Date();
    if (preset === "ALL") {
      setStartDate("");
      setEndDate("");
    } else if (preset === "MONTH") {
      const firstDay = new Date(now.getFullYear(), now.getMonth(), 1);
      const lastDay = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(lastDay.toISOString().split("T")[0]);
    } else if (preset === "QUARTER") {
      const q = Math.floor(now.getMonth() / 3);
      const firstDay = new Date(now.getFullYear(), q * 3, 1);
      const lastDay = new Date(now.getFullYear(), q * 3 + 3, 0);
      setStartDate(firstDay.toISOString().split("T")[0]);
      setEndDate(lastDay.toISOString().split("T")[0]);
    }
  };

  if (isLoadingTasks) {
    return (
      <div className="flex h-[380px] w-full items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-blue-600" />
      </div>
    );
  }

  return (
    <div className="space-y-5 min-w-0">
      {/* 1. Lọc theo hạn chót & Phân quyền Đơn vị */}
      <Card className="border-slate-200/80 shadow-2xs bg-gradient-to-r from-slate-50/70 via-white to-blue-50/30">
        <CardContent className="p-3.5 sm:p-4">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 min-w-0">
            <div className="flex items-center gap-2 shrink-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 dark:bg-blue-950/60 text-blue-600 flex items-center justify-center font-bold">
                <Calendar className="w-4 h-4" />
              </div>
              <span className="text-sm font-bold text-slate-800 dark:text-slate-100">
                Lọc theo hạn chót:
              </span>
            </div>

            <div className="flex flex-wrap items-center gap-2.5 min-w-0 flex-1">
              <div className="flex items-center gap-1.5 min-w-[170px] flex-1 sm:flex-initial">
                <span className="text-xs text-slate-500 whitespace-nowrap">Từ ngày</span>
                <Input
                  type="date"
                  className="h-8 text-xs bg-white"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5 min-w-[170px] flex-1 sm:flex-initial">
                <span className="text-xs text-slate-500 whitespace-nowrap">Đến ngày</span>
                <Input
                  type="date"
                  className="h-8 text-xs bg-white"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                />
              </div>

              <div className="flex items-center gap-1.5">
                <Button
                  variant="outline"
                  size="sm"
                  className={`h-8 text-xs px-2.5 ${!startDate && !endDate ? "bg-slate-100 font-semibold" : ""}`}
                  onClick={() => handleQuickPreset("ALL")}
                >
                  Tất cả
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2.5"
                  onClick={() => handleQuickPreset("MONTH")}
                >
                  Tháng này
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  className="h-8 text-xs px-2.5"
                  onClick={() => handleQuickPreset("QUARTER")}
                >
                  Quý này
                </Button>
              </div>

              {isGlobalAdmin && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    className="h-8 text-xs rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-2xs focus:ring-1 focus:ring-blue-500 max-w-[280px] truncate"
                    value={selectedUnitScope}
                    onChange={(e) => setSelectedUnitScope(e.target.value)}
                  >
                    <option value="">-- Toàn bộ đơn vị phụ trách --</option>
                    {departmentOptions.map((dept: any) => (
                      <option key={dept.id} value={String(dept.id)}>
                        {dept.name} ({dept.code})
                      </option>
                    ))}
                  </select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>



      {/* 3. Thẻ Thông tin Nhân viên & Vai trò (User Banner) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-11 w-11 border-2 border-blue-500/20 bg-blue-50 shrink-0">
            <AvatarImage src={user?.avatarUrl || ""} />
            <AvatarFallback className="bg-blue-600 text-white font-bold text-sm">
              {userName.split(" ").pop()?.substring(0, 2).toUpperCase() || "AD"}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="text-sm font-bold text-slate-900 truncate flex items-center gap-1.5">
                <User className="w-4 h-4 text-blue-600" />
                {userName}
              </span>
              <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-[11px] font-medium">
                {userDept}
              </Badge>
              <Badge variant="outline" className="text-[10px] text-slate-600 font-mono">
                Mã: {userEmpCode}
              </Badge>
            </div>
            <div className="flex items-center gap-1.5 text-xs text-slate-500 mt-0.5">
              <span className="w-2 h-2 rounded-full bg-emerald-500 shrink-0" />
              <span>Bàn làm việc cá nhân — Bạn đang xem nhiệm vụ và chỉ số năng suất của riêng bạn</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-2 self-start md:self-auto shrink-0">
          <Button
            onClick={() => setIsSelfEvalOpen(true)}
            size="sm"
            className="h-8 text-xs bg-emerald-600 hover:bg-emerald-700 text-white shadow-2xs flex items-center gap-1.5"
          >
            <Printer className="w-3.5 h-3.5" />
            🖨 Tự đánh giá (Mẫu 02)
          </Button>
        </div>
      </div>

      {/* 4. SÁU THẺ CHỈ SỐ CÁ NHÂN (Personal Metrics Cards) */}
      <div className="grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {/* Card 1: Tỷ lệ hoàn thành */}
        <Card className="border-slate-200 shadow-2xs bg-gradient-to-br from-white to-blue-50/50">
          <CardContent className="p-3.5">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Tỷ lệ hoàn thành</span>
              <Sparkles className="w-3.5 h-3.5 text-blue-500" />
            </div>
            <div className="text-2xl font-black text-blue-600 mt-1">
              {personalMetrics.completionRate}%
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Đạt chỉ tiêu cơ quan
            </div>
          </CardContent>
        </Card>

        {/* Card 2: Tổng số công việc */}
        <Card className="border-slate-200 shadow-2xs bg-gradient-to-br from-white to-slate-50">
          <CardContent className="p-3.5">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Tổng số công việc</span>
              <FileText className="w-3.5 h-3.5 text-slate-500" />
            </div>
            <div className="text-2xl font-black text-slate-800 mt-1">
              {personalMetrics.total}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Giao & phối hợp
            </div>
          </CardContent>
        </Card>

        {/* Card 3: Số việc hoàn thành */}
        <Card className="border-slate-200 shadow-2xs bg-gradient-to-br from-white to-emerald-50/50">
          <CardContent className="p-3.5">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Hoàn thành</span>
              <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
            </div>
            <div className="text-2xl font-black text-emerald-600 mt-1">
              {personalMetrics.completed}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Đã chốt kết quả
            </div>
          </CardContent>
        </Card>

        {/* Card 4: Quá hạn */}
        <Card className="border-slate-200 shadow-2xs bg-gradient-to-br from-white to-red-50/40">
          <CardContent className="p-3.5">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Quá hạn</span>
              <AlertTriangle className="w-3.5 h-3.5 text-red-500" />
            </div>
            <div className="text-2xl font-black text-red-600 mt-1">
              {personalMetrics.overdue}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              {personalMetrics.overdue > 0 ? "Cần xử lý ngay" : "Không có trễ hạn"}
            </div>
          </CardContent>
        </Card>

        {/* Card 5: Hoàn thành quá hạn */}
        <Card className="border-slate-200 shadow-2xs bg-gradient-to-br from-white to-amber-50/40">
          <CardContent className="p-3.5">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>HT quá hạn</span>
              <Clock className="w-3.5 h-3.5 text-amber-500" />
            </div>
            <div className="text-2xl font-black text-amber-600 mt-1">
              {personalMetrics.completedOverdue}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Đã bù tiến độ
            </div>
          </CardContent>
        </Card>

        {/* Card 6: Sắp hết hạn */}
        <Card className="border-slate-200 shadow-2xs bg-gradient-to-br from-white to-orange-50/40">
          <CardContent className="p-3.5">
            <div className="text-xs text-slate-500 flex items-center justify-between">
              <span>Sắp hết hạn</span>
              <AlertCircle className="w-3.5 h-3.5 text-orange-500" />
            </div>
            <div className="text-2xl font-black text-orange-600 mt-1">
              {personalMetrics.dueSoon}
            </div>
            <div className="text-[11px] text-slate-400 mt-0.5">
              Hạn trong 3 ngày
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Thanh so sánh khối lượng quy đổi (Workload Benchmark Bar) */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">📊</span>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              Khối lượng quy đổi tháng này của bạn: <strong className="text-blue-700 font-bold">{workloadBenchmark.personalScore}</strong> · TB
              phòng {userDept}: <strong className="text-slate-700">{workloadBenchmark.departmentAverage}</strong> → bạn{" "}
              <span className={workloadBenchmark.isLower ? "text-emerald-700 font-bold" : "text-amber-700 font-bold"}>
                {workloadBenchmark.isLower ? "thấp hơn" : "cao hơn"} {workloadBenchmark.diffPercent}%
              </span> trung bình phòng
            </div>
          </div>
          <Badge variant="outline" className={`text-[11px] bg-white w-fit shrink-0 ${workloadBenchmark.isLower ? "text-emerald-700 border-emerald-300" : "text-amber-700 border-amber-300"}`}>
            {workloadBenchmark.evaluation}
          </Badge>
        </div>

        <div className="mt-2.5 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Bạn: {workloadBenchmark.personalScore} điểm quy đổi</span>
            <span>Mặt bằng phòng: {workloadBenchmark.departmentAverage} điểm</span>
          </div>
          <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (workloadBenchmark.personalScore / (workloadBenchmark.departmentAverage || 1)) * 91)}%` }}
            />
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500"
              style={{ left: "91%" }}
              title={`Trung bình phòng (${workloadBenchmark.departmentAverage})`}
            />
          </div>
        </div>
      </div>

      {/* 5. Dynamic Report Service Dashboard: Biểu đồ Bàn làm việc Cá nhân (REP_PERSONAL_WORKBENCH) */}
      <EmbeddedReportWidget
        reportIdOrCode="REP_PERSONAL_WORKBENCH"
        title="Dashboard Bàn làm việc Cá nhân (Đồng bộ từ Report Service)"
        description="Biểu đồ đánh giá sự tiến bộ trong 6 tháng, số lượng quy đổi phòng ban, cơ cấu trạng thái và tiến độ nhiệm vụ — được cấu hình và đồng bộ trực tiếp từ Report Service"
        columns={2}
        chartHeight={260}
        showDetailLink={true}
        allowToggleType={true}
        collapsible={true}
        defaultCollapsed={false}
      />

      {/* 6. List việc cần làm */}
      <Card className="border-slate-200 shadow-2xs">
        <CardHeader className="pb-3 pt-4 px-4 border-b border-slate-100">
          <div className="flex items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
              <RotateCw className="w-4 h-4 text-amber-600 animate-spin-slow" />
              List việc cần làm:
            </CardTitle>
            <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200">
              {actionItems.length} nhiệm vụ ưu tiên
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="p-3.5 space-y-2.5">
          {actionItems.length === 0 ? (
            <div className="p-4 text-center text-xs text-slate-400">
              Hiện tại bạn không có nhiệm vụ tồn đọng cần xử lý.
            </div>
          ) : (
            actionItems.map((item: any) => (
              <div
                key={item.id}
                onClick={() => setSelectedDrawerTaskId(item.id)}
                className="group p-3 rounded-lg border border-slate-200 hover:border-blue-300 hover:bg-blue-50/30 transition-all cursor-pointer space-y-1.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-start gap-2 min-w-0">
                    <span className="text-amber-600 font-bold mt-0.5 shrink-0">🔄</span>
                    <div className="text-xs font-semibold text-slate-800 group-hover:text-blue-700 leading-snug line-clamp-2">
                      {item.title}
                    </div>
                  </div>
                  <Badge className="bg-amber-100 hover:bg-amber-200 text-amber-800 border-amber-300 text-[10px] shrink-0 font-medium">
                    {item.status}
                  </Badge>
                </div>
                <div className="flex items-center justify-between text-[11px] text-slate-400 pl-6">
                  <span>Hạn chót: {item.dueDate}</span>
                  <span className="text-blue-600 group-hover:underline flex items-center gap-0.5 font-medium">
                    Xử lý ngay <Eye className="w-3 h-3 ml-0.5" />
                  </span>
                </div>
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* 7. Collapsible: List việc đã hoàn thành tháng này (khi nhấn mới load) */}
      <Collapsible
        open={isCompletedOpen}
        onOpenChange={setIsCompletedOpen}
        className="rounded-xl border border-emerald-200/80 bg-white shadow-2xs overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-emerald-50/40 transition-colors select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center font-bold shrink-0">
                <CalendarCheck className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>List việc đã hoàn thành tháng này</span>
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px] font-semibold">
                    {personalMetrics.completed} nhiệm vụ
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {isCompletedOpen
                    ? "Đang hiển thị danh mục đã nghiệm thu trong tháng này"
                    : "Nhấn để mở rộng và tải danh sách công việc đã nghiệm thu tháng này"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-emerald-700 hidden sm:inline">
                {isCompletedOpen ? "Thu gọn" : "Nhấn để xem"}
              </span>
              <div
                className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-200 ${
                  isCompletedOpen ? "rotate-180 bg-emerald-100 text-emerald-700" : "text-slate-500"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-slate-100 p-4 bg-slate-50/50">
          {isLoadingCompletedMonth ? (
            <div className="flex items-center justify-center py-8 text-slate-500 gap-2">
              <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
              <span className="text-xs">Đang tải danh sách công việc đã hoàn thành...</span>
            </div>
          ) : completedThisMonthTasks.length === 0 ? (
            <div className="py-6 text-center text-xs text-slate-400">
              Chưa có nhiệm vụ nào hoàn thành trong tháng này.
            </div>
          ) : (
            <div className="space-y-2.5">
              {completedThisMonthTasks.map((task: any) => (
                <div
                  key={task.id}
                  className="p-3 bg-white rounded-lg border border-slate-200 hover:border-emerald-300 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 transition-all"
                >
                  <div className="flex items-start gap-2.5 min-w-0">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 mt-0.5 shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 leading-snug">
                        {task.title}
                      </div>
                      <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 mt-1">
                        <span>Ngày hoàn thành: <strong className="text-slate-700">{task.completedDate}</strong></span>
                        <span>•</span>
                        <Badge variant="outline" className="text-[10px] text-blue-700 bg-blue-50/50">
                          {task.role}
                        </Badge>
                        <span>•</span>
                        <span className="text-emerald-600 font-semibold">Điểm KPI: {task.score}đ</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
                    <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300 text-[10px]">
                      100% Hoàn thành
                    </Badge>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setSelectedDrawerTaskId(task.id)}
                      className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* 8. CÔNG VIỆC CỦA TÔI GẦN ĐÂY NHẤT (My Most Recent Tasks - Collapsible) */}
      <Collapsible
        open={isRecentTasksOpen}
        onOpenChange={setIsRecentTasksOpen}
        className="rounded-xl border border-blue-200/80 bg-white shadow-2xs overflow-hidden"
      >
        <CollapsibleTrigger asChild>
          <div className="flex items-center justify-between p-4 cursor-pointer hover:bg-blue-50/40 transition-colors select-none">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-blue-100 text-blue-700 flex items-center justify-center font-bold shrink-0">
                <Briefcase className="w-4 h-4" />
              </div>
              <div>
                <div className="text-sm font-bold text-slate-900 flex items-center gap-2">
                  <span>Công việc của tôi gần đây nhất</span>
                  <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] font-semibold">
                    {recentTasks.length} nhiệm vụ
                  </Badge>
                </div>
                <p className="text-xs text-slate-500">
                  {isRecentTasksOpen
                    ? "Danh sách các nhiệm vụ được giao và phối hợp gần đây nhất của bạn"
                    : "Nhấn để mở rộng danh sách công việc gần đây nhất của bạn"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold text-blue-700 hidden sm:inline">
                {isRecentTasksOpen ? "Thu gọn" : "Nhấn để xem"}
              </span>
              <div
                className={`w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center transition-transform duration-200 ${
                  isRecentTasksOpen ? "rotate-180 bg-blue-100 text-blue-700" : "text-slate-500"
                }`}
              >
                <ChevronDown className="w-4 h-4" />
              </div>
            </div>
          </div>
        </CollapsibleTrigger>

        <CollapsibleContent className="border-t border-slate-100 p-4 bg-slate-50/30 space-y-3">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
            <div className="flex flex-wrap items-center gap-1.5">
              <Button
                variant={activeCategory === "ALL" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setActiveCategory("ALL")}
              >
                Tất cả
              </Button>
              <Button
                variant={activeCategory === "LEAD" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setActiveCategory("LEAD")}
              >
                Chủ trì
              </Button>
              <Button
                variant={activeCategory === "COORDINATE" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setActiveCategory("COORDINATE")}
              >
                Phối hợp
              </Button>
              <Button
                variant={activeCategory === "IN_PROGRESS" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setActiveCategory("IN_PROGRESS")}
              >
                Đang xử lý
              </Button>
              <Button
                variant={activeCategory === "DONE" ? "default" : "outline"}
                size="sm"
                className="h-7 text-xs px-2"
                onClick={() => setActiveCategory("DONE")}
              >
                Hoàn thành
              </Button>
            </div>

            <div className="w-full sm:w-72">
              <Input
                type="text"
                placeholder="Tìm kiếm công việc của bạn theo tiêu đề, số hiệu..."
                className="h-8 text-xs bg-white"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            {recentTasks.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400 bg-white rounded-lg border border-dashed">
                Không tìm thấy công việc nào phù hợp với bộ lọc.
              </div>
            ) : (
              recentTasks.map((task: any) => (
                <div
                  key={task.id}
                  onClick={() => setSelectedDrawerTaskId(task.id)}
                  className="p-3 bg-white rounded-lg border border-slate-200/90 hover:border-blue-300 hover:bg-blue-50/20 transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-3 cursor-pointer"
                >
                  <div className="space-y-1.5 min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-[11px] font-semibold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded border border-blue-200">
                        {task.docRef}
                      </span>
                      <span className="text-xs font-bold text-slate-900 hover:text-blue-600 line-clamp-1">
                        {task.title}
                      </span>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 text-[11px]">
                      <Badge
                        className={
                          task.role === "Chủ trì"
                            ? "bg-blue-100 text-blue-800 border-blue-200 text-[10px]"
                            : "bg-purple-100 text-purple-800 border-purple-200 text-[10px]"
                        }
                        variant="outline"
                      >
                        {task.role}
                      </Badge>
                      <span className="text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        Hạn: <strong className="text-slate-700 font-medium">{task.dueDate}</strong>
                      </span>
                      <div className="flex items-center gap-1.5 text-slate-500">
                        <span>Tiến độ:</span>
                        <div className="w-16 h-2 bg-slate-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-blue-600 rounded-full"
                            style={{ width: `${task.progress}%` }}
                          />
                        </div>
                        <span className="font-semibold text-slate-700">{task.progress}%</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between sm:justify-end gap-2.5 shrink-0 pl-5 sm:pl-0">
                    <Badge
                      className={
                        task.status === "Hoàn thành"
                          ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                          : task.status === "Chờ duyệt"
                          ? "bg-amber-100 text-amber-800 border-amber-300"
                          : task.status === "Quá hạn"
                          ? "bg-red-100 text-red-800 border-red-300"
                          : "bg-blue-100 text-blue-800 border-blue-300"
                      }
                      variant="outline"
                    >
                      {task.status}
                    </Badge>

                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-blue-600 hover:text-blue-700 hover:bg-blue-100/60"
                    >
                      Chi tiết
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* 9. Modal Tự Đánh Giá (🖨 Tự đánh giá Mẫu 02) */}
      <Dialog open={isSelfEvalOpen} onOpenChange={setIsSelfEvalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <Printer className="w-5 h-5 text-emerald-600" />
              Phiếu Tự Đánh Giá Kết Quả Công Việc & KPI Cá Nhân (Mẫu 02)
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Áp dụng theo quy chế đánh giá cán bộ, chuyên viên định kỳ Tháng 10/2026
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            <div className="rounded-lg bg-slate-50 p-3 border border-slate-200 grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-500">Họ và tên:</span>{" "}
                <strong className="text-slate-900">{userName}</strong>
              </div>
              <div>
                <span className="text-slate-500">Đơn vị:</span>{" "}
                <strong className="text-slate-900">{userDept}</strong>
              </div>
              <div>
                <span className="text-slate-500">Kỳ đánh giá:</span>{" "}
                <strong className="text-slate-900">Tháng 10/2026</strong>
              </div>
              <div>
                <span className="text-slate-500">Tỷ lệ hoàn thành:</span>{" "}
                <strong className="text-emerald-600 font-bold">
                  {personalMetrics.completionRate}% ({personalMetrics.completed}/{personalMetrics.total} việc)
                </strong>
              </div>
            </div>

            <div className="space-y-2.5">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-tight">
                Chi tiết 4 tiêu chí thành phần:
              </div>

              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• A%: Khối lượng quy đổi (Trọng số 30%)</span>
                  <span className="text-blue-600 font-bold">
                    {workloadBenchmark.personalScore} / {workloadBenchmark.departmentAverage} (
                    {Math.round(
                      (workloadBenchmark.personalScore / (workloadBenchmark.departmentAverage || 1)) * 100
                    )}%)
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Đánh giá theo khối lượng nhiệm vụ thực tế và hệ số phức tạp của công việc đã giao/xử lý.
                </p>
              </div>

              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• B%: Chất lượng sản phẩm đầu ra (Trọng số 30%)</span>
                  <span className="text-emerald-600 font-bold">
                    {personalMetrics.completed > 0 ? "96.0 / 100" : "—"}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Chất lượng sản phẩm công việc, văn bản phát hành và kết quả thẩm định được cấp có thẩm quyền phê duyệt.
                </p>
              </div>

              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• C%: Tiến độ thực hiện (Trọng số 25%)</span>
                  <span className="text-emerald-600 font-bold">
                    {personalMetrics.overdue === 0 ? "100 / 100" : `${Math.max(0, 100 - personalMetrics.overdue * 10)} / 100`}
                  </span>
                </div>
                <p className="text-[11px] text-slate-500">
                  {personalMetrics.overdue === 0
                    ? "Không có nhiệm vụ quá hạn; bảo lưu 100% điểm tiến độ theo kế hoạch."
                    : `${personalMetrics.overdue} nhiệm vụ quá hạn cần đôn đốc; trừ điểm tiến độ tương ứng.`}
                </p>
              </div>

              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• D%: Mức độ chủ động & phối hợp (Trọng số 15%)</span>
                  <span className="text-emerald-600 font-bold">95.0 / 100</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Chủ động phối hợp giữa các đơn vị và cá nhân liên quan trong việc thực hiện nhiệm vụ công tác.
                </p>
              </div>
            </div>

            <div className="rounded-lg bg-emerald-50 border border-emerald-200 p-3 text-center space-y-1">
              <div className="text-xs text-emerald-800 font-medium">Tổng điểm KPI Tự đánh giá:</div>
              <div className="text-2xl font-black text-emerald-700">95.2 / 100 Điểm</div>
              <Badge className="bg-emerald-600 text-white text-[11px]">
                Xếp loại: Hoàn thành Xuất sắc nhiệm vụ
              </Badge>
            </div>
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2 pt-2 border-t border-slate-100">
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                if (typeof window !== "undefined") {
                  window.print();
                }
              }}
              className="text-xs"
            >
              <Printer className="w-3.5 h-3.5 mr-1.5" />
              In phiếu đánh giá
            </Button>
            <Button
              size="sm"
              className="bg-blue-600 hover:bg-blue-700 text-xs"
              onClick={() => {
                toast.success("Đã gửi kết quả tự đánh giá lên Lãnh đạo phòng phê duyệt!");
                setIsSelfEvalOpen(false);
              }}
            >
              <Send className="w-3.5 h-3.5 mr-1.5" />
              Gửi Lãnh đạo phê duyệt
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* 10. TaskDetailDrawer for inspecting task on click */}
      <TaskDetailDrawer
        taskId={selectedDrawerTaskId}
        open={Boolean(selectedDrawerTaskId)}
        onOpenChange={(open) => {
          if (!open) setSelectedDrawerTaskId(null);
        }}
      />
    </div>
  );
}
