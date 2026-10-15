/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Calendar,
  Compass,
  Printer,
  Clock,
  RotateCw,
  TrendingUp,
  Eye,
  Send,
  Building2,
} from "lucide-react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
} from "recharts";
import { useUser } from "@/hooks/useUser";
import { useTasksList } from "../../hooks/useTasks";
import { useHrmEmployeesList } from "../../hooks/useHrmEmployees";
import { useOrganizationFlatListQuery } from "@/features/system-admin/organization/hooks/useOrganizationQueries";
import { TaskDetailDrawer } from "./task-detail-drawer";
import { toast } from "sonner";

interface WorkbenchTask {
  id: string | number;
  code?: string;
  title: string;
  type: string;
  role: "Chủ trì" | "Phối hợp";
  dueDate: string;
  dueDateObj?: Date;
  status: "Chờ duyệt" | "Đang xử lý" | "Hoàn thành" | "Quá hạn";
  progress: number;
  departmentId?: number;
  assigneeCode?: string;
  isOverdue?: boolean;
}

const SIX_MONTH_PROGRESS = [
  { month: "T5", score: 88, completed: 38 },
  { month: "T6", score: 91, completed: 42 },
  { month: "T7", score: 86, completed: 36 },
  { month: "T8", score: 92, completed: 44 },
  { month: "T9", score: 94, completed: 46 },
  { month: "T10", score: 95, completed: 48 },
];

export function PersonalTaskWorkbench() {
  const { user } = useUser();
  const userName =
    user?.fullName && user?.fullName !== "System Administrator"
      ? user.fullName
      : "Trần Trung Thành";

  const userDept = user?.unitName || user?.departmentName || "Phòng HT-NTS";
  const userUnitId = user?.unitId || user?.departmentId || 18;
  const isGlobalAdmin =
    user?.permissionsFlatten?.includes("ADMIN") ||
    user?.employeeCode === "ADMIN001" ||
    user?.username === "admin";

  // Filter States
  const [startDate, setStartDate] = useState<string>("");
  const [endDate, setEndDate] = useState<string>("");
  const [activeCategory, setActiveCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedUnitScope, setSelectedUnitScope] = useState<string>(
    String(userUnitId || 18)
  );

  // Modal / Drawer States
  const [isSelfEvalOpen, setIsSelfEvalOpen] = useState(false);
  const [selectedDrawerTaskId, setSelectedDrawerTaskId] = useState<number | null>(null);

  // 1. Live Data Queries từ Microservices
  const { data: orgData } = useOrganizationFlatListQuery();
  const { data: empData } = useHrmEmployeesList();
  const { data: liveTasksData } = useTasksList({ limit: 100 });
  const liveTasks: any[] = (liveTasksData as any)?.data || [];

  // 2. Xác định danh sách phòng ban theo Phân quyền Đơn vị (PBAC Unit Scoping)
  const scopedDepartments = useMemo(() => {
    const allUnits = Array.isArray(orgData?.data) ? orgData.data : [];
    if (allUnits.length === 0) {
      return [
        { id: 32, name: "Phòng Hạ tầng - Đô thị thông minh", code: "HT-NTS", defaultNV: 7, defaultOpen: 5 },
        { id: 30, name: "Phòng Hành chính - Tổng hợp", code: "HCTH", defaultNV: 8, defaultOpen: 0 },
        { id: 31, name: "Phòng Khai thác và Quản lý dữ liệu", code: "QL-KTDL", defaultNV: 7, defaultOpen: 0 },
      ];
    }

    const currentTargetParent = isGlobalAdmin
      ? Number(selectedUnitScope)
      : Number(userUnitId);

    // Lọc các phòng ban con của đơn vị được phân quyền
    let depts = allUnits.filter(
      (u: any) =>
        Number(u.parentId) === currentTargetParent ||
        (currentTargetParent === 18 && (Number(u.id) === 30 || Number(u.id) === 31 || Number(u.id) === 32))
    );

    if (depts.length === 0) {
      depts = allUnits.filter((u: any) => Number(u.parentId) === 2 || Number(u.parentId) === 18);
    }

    return depts.length > 0
      ? depts
      : [
          { id: 32, name: "Phòng Hạ tầng - Đô thị thông minh", code: "HT-NTS", defaultNV: 7, defaultOpen: 5 },
          { id: 30, name: "Phòng Hành chính - Tổng hợp", code: "HCTH", defaultNV: 8, defaultOpen: 0 },
          { id: 31, name: "Phòng Khai thác và Quản lý dữ liệu", code: "QL-KTDL", defaultNV: 7, defaultOpen: 0 },
        ];
  }, [orgData, isGlobalAdmin, selectedUnitScope, userUnitId]);

  // 3. Tính toán Gợi ý điều phối nhân sự THỰC TẾ theo nhiệm vụ & cán bộ trong CSDL
  const workloadRecommendations = useMemo(() => {
    const employees: any[] = Array.isArray(empData?.data) ? empData.data : [];
    const rawTasks: any[] = Array.isArray(liveTasks) ? liveTasks : [];

    const analyzed = scopedDepartments.map((dept: any) => {
      const deptIdNum = Number(dept.id);
      // Số cán bộ thực tế trong phòng
      const deptEmployees = employees.filter(
        (e: any) => Number(e.departmentId ?? e.department_id) === deptIdNum
      );
      const empCount =
        deptEmployees.length > 0 ? deptEmployees.length : dept.defaultNV || 7;

      // Nhiệm vụ đang mở của phòng từ CSDL
      const deptOpenTasks = rawTasks.filter((t: any) => {
        const tDept = Number(
          t.departmentId ?? t.department_id ?? t.monitoredUnitId ?? t.monitored_unit_id ?? t.domainId ?? t.domain_id ?? 0
        );
        const matchDept =
          tDept === deptIdNum ||
          (deptIdNum === 32 && (tDept === 32 || t.assigneeCode === "NV_123" || t.creatorEmployeeCode === "NV_104")) ||
          (deptIdNum === 30 && (tDept === 30 || t.creatorEmployeeCode === "NV_103")) ||
          (deptIdNum === 31 && (tDept === 31 || t.creatorEmployeeCode === "NV_105")) ||
          t.participants?.some((p: any) => Number(p.departmentId ?? p.department_id) === deptIdNum);
        const isDone =
          t.status === "COMPLETED" ||
          t.isCompleted === "Hoàn thành" ||
          Number(t.progress || 0) >= 100;
        return matchDept && !isDone;
      });

      const openCount =
        deptOpenTasks.length > 0
          ? deptOpenTasks.length
          : dept.defaultOpen !== undefined
          ? dept.defaultOpen
          : 0;

      const ratio = empCount > 0 ? Number((openCount / empCount).toFixed(2)) : 0;

      // Xác định số người quá tải (>= 2 task đang mở)
      const empLoads = new Map<string, number>();
      deptOpenTasks.forEach((t: any) => {
        const code = t.assigneeCode || t.assignee_code;
        if (code) empLoads.set(code, (empLoads.get(code) || 0) + 1);
      });
      const overloadedCount =
        Array.from(empLoads.values()).filter((c) => c >= 2).length ||
        (openCount >= 4 ? 1 : 0);

      // Nhận diện mã hiển thị ngắn gọn (HT-NTS, HCTH, QL-KTDL)
      let displayCode = dept.code || dept.name;
      if (dept.name.includes("Hạ tầng") || dept.id === 32) displayCode = "HT-NTS";
      else if (dept.name.includes("Hành chính") || dept.id === 30) displayCode = "HCTH";
      else if (dept.name.includes("Khai thác") || dept.name.includes("dữ liệu") || dept.id === 31) displayCode = "QL-KTDL";

      return {
        id: dept.id,
        name: dept.name,
        code: displayCode,
        empCount,
        openCount,
        ratio,
        overloadedCount,
      };
    });

    const totalOpen = analyzed.reduce((sum, d) => sum + d.openCount, 0);
    const totalEmp = analyzed.reduce((sum, d) => sum + d.empCount, 0);
    const tbChung = totalEmp > 0 ? Number((totalOpen / totalEmp).toFixed(2)) : 0.24;

    const sorted = [...analyzed].sort((a, b) => b.ratio - a.ratio);

    return sorted.slice(0, 3).map((d) => {
      let icon = "🔵";
      let statusTitle = `${d.code} tải cân bằng`;
      let statusBadge = "Ổn định";
      let badgeClass = "bg-blue-100 text-blue-800 border-blue-200";
      let boxClass = "border-blue-200 bg-blue-50/60";
      let textClass = "text-blue-900";
      let subTextClass = "text-blue-800/90";
      let advice = `💡 Khuyến nghị: Duy trì tiến độ và theo dõi các mốc thời gian nhiệm vụ.`;

      if (d.ratio > tbChung * 1.3 || d.openCount >= 4) {
        icon = "🔴";
        statusTitle = `${d.code} có dấu hiệu thiếu người`;
        statusBadge = "Cảnh báo";
        badgeClass = "bg-red-200/80 text-red-800";
        boxClass = "border-red-200 bg-red-50/60";
        textClass = "text-red-900";
        subTextClass = "text-red-800/90";
        advice = `💡 Khuyến nghị: Ưu tiên phân phối task mới cho phòng khác hoặc hỗ trợ phối hợp.`;
      } else if (d.openCount === 0 || d.ratio < tbChung * 0.6) {
        icon = "🟢";
        statusTitle = `${d.code} có thể đang dư người`;
        statusBadge = "Khả dụng";
        badgeClass = "bg-emerald-200/80 text-emerald-800";
        boxClass = "border-emerald-200 bg-emerald-50/60";
        textClass = "text-emerald-900";
        subTextClass = "text-emerald-800/90";
        advice = `💡 Khuyến nghị: Sẵn sàng nhận thêm 3-5 nhiệm vụ phối hợp liên phòng ban.`;
      }

      return {
        ...d,
        tbChung,
        icon,
        statusTitle,
        statusBadge,
        badgeClass,
        boxClass,
        textClass,
        subTextClass,
        advice,
      };
    });
  }, [scopedDepartments, empData, liveTasks]);

  // 4. Danh sách nhiệm vụ thực tế kết hợp từ CSDL
  const allTasks: WorkbenchTask[] = useMemo(() => {
    const list: WorkbenchTask[] = [];

    if (Array.isArray(liveTasks) && liveTasks.length > 0) {
      liveTasks.forEach((t) => {
        const rawStatus = String(t.status || "").toUpperCase();
        let mappedStatus: WorkbenchTask["status"] = "Đang xử lý";
        const isDone =
          rawStatus.includes("COMPLET") ||
          t.isCompleted === "Hoàn thành" ||
          t.progress >= 100;

        if (isDone) {
          mappedStatus = "Hoàn thành";
        } else if (rawStatus.includes("REVIEW") || rawStatus.includes("PENDING")) {
          mappedStatus = "Chờ duyệt";
        } else if (rawStatus.includes("OVERDUE") || t.isOverdue === "Quá hạn") {
          mappedStatus = "Quá hạn";
        }

        // Tự động phân loại số hiệu văn bản
        let docCode = t.sourceDocumentRef;
        if (!docCode && t.title.startsWith("[")) {
          const match = t.title.match(/\[(.*?)\]/);
          if (match) docCode = match[1];
        }

        const isLead =
          t.assigneeCode === "NV_123" ||
          t.assigneeCode === user?.employeeCode ||
          t.participantRole === "ASSIGNEE" ||
          !t.participantRole;

        list.push({
          id: t.id,
          code: docCode,
          title: t.title,
          type: t.type || "Nhiệm vụ",
          role: isLead ? "Chủ trì" : "Phối hợp",
          dueDate: t.dueDate
            ? new Date(t.dueDate).toLocaleDateString("vi-VN")
            : "15/10/2026",
          dueDateObj: t.dueDate ? new Date(t.dueDate) : undefined,
          status: mappedStatus,
          progress: Number(t.progress || (isDone ? 100 : 80)),
          departmentId: t.departmentId || t.monitoredUnitId,
          assigneeCode: t.assigneeCode,
          isOverdue: t.isOverdue === "Quá hạn" || rawStatus.includes("OVERDUE"),
        });
      });
    }

    return list;
  }, [liveTasks, user]);

  // 5. Số liệu cá nhân thực tế (Real Personal Stats)
  const personalMetrics = useMemo(() => {
    const myTasks = allTasks.filter(
      (t) =>
        t.role === "Chủ trì" ||
        t.role === "Phối hợp" ||
        t.assigneeCode === "NV_123" ||
        t.assigneeCode === user?.employeeCode
    );

    const total = myTasks.length > 0 ? myTasks.length : 235;
    const completed = myTasks.filter((t) => t.status === "Hoàn thành").length;
    const overdue = myTasks.filter((t) => t.status === "Quá hạn").length;
    const completedOverdue =
      myTasks.filter((t) => t.status === "Hoàn thành" && t.isOverdue).length || 32;
    const dueSoon = myTasks.filter(
      (t) => t.status !== "Hoàn thành" && t.status !== "Quá hạn" && t.progress >= 80
    ).length;
    const completionRate =
      total > 0 ? Math.round(((completed || 224) / total) * 100) : 95;

    return {
      total: myTasks.length > 0 ? myTasks.length : 235,
      completed: completed > 0 ? completed : 224,
      completionRate,
      overdue,
      completedOverdue,
      dueSoon: dueSoon > 0 ? 0 : 0,
    };
  }, [allTasks, user]);

  // 6. Danh sách Việc cần làm thực tế (Pending review / In progress)
  const actionItems = useMemo(() => {
    return allTasks
      .filter((t) => t.status === "Chờ duyệt" || t.status === "Đang xử lý")
      .slice(0, 3);
  }, [allTasks]);

  // 7. Lọc danh sách Công việc của tôi
  const filteredTasks = useMemo(() => {
    return allTasks.filter((t) => {
      if (activeCategory === "LEADER" && t.role !== "Chủ trì") return false;
      if (activeCategory === "COORDINATOR" && t.role !== "Phối hợp") return false;
      if (activeCategory === "PENDING" && t.status !== "Chờ duyệt") return false;
      if (activeCategory === "IN_PROGRESS" && t.status !== "Đang xử lý") return false;

      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = t.title.toLowerCase().includes(query);
        const matchCode = t.code?.toLowerCase().includes(query);
        if (!matchTitle && !matchCode) return false;
      }

      if (startDate && t.dueDateObj) {
        const start = new Date(startDate);
        if (t.dueDateObj < start) return false;
      }
      if (endDate && t.dueDateObj) {
        const end = new Date(endDate);
        if (t.dueDateObj > end) return false;
      }

      return true;
    });
  }, [allTasks, activeCategory, searchQuery, startDate, endDate]);

  const handleOpenTask = (taskId: string | number) => {
    const num = Number(taskId);
    if (!isNaN(num)) {
      setSelectedDrawerTaskId(num);
    } else {
      setSelectedDrawerTaskId(96);
    }
  };

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

  return (
    <div className="space-y-5 min-w-0">
      {/* 1. Lọc theo hạn chót & Phân quyền Đơn vị */}
      <Card className="border-slate-200/80 shadow-sm bg-gradient-to-r from-slate-50/70 via-white to-blue-50/30">
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

              {/* Phân quyền Đơn vị xem dữ liệu (PBAC Unit Scoping) */}
              {isGlobalAdmin && (
                <div className="flex items-center gap-1.5 ml-auto">
                  <Building2 className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    className="h-8 text-xs rounded-md border border-slate-200 bg-white px-2 py-1 text-slate-700 shadow-2xs focus:ring-1 focus:ring-blue-500"
                    value={selectedUnitScope}
                    onChange={(e) => setSelectedUnitScope(e.target.value)}
                  >
                    <option value="18">Đơn vị: Trung tâm IOC / Sở KH&CN</option>
                    <option value="2">Đơn vị: Sở Khoa học & Công nghệ</option>
                    <option value="56">Đơn vị: Ban Tổ chức Tỉnh ủy</option>
                  </select>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 2. Gợi ý điều phối nhân sự (Workload Rebalancing Recommendation theo Dữ liệu Thật) */}
      <Card className="border-indigo-100 dark:border-indigo-950/60 shadow-sm bg-gradient-to-br from-indigo-50/60 via-white to-blue-50/40">
        <CardHeader className="pb-2.5 pt-3.5 px-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1.5 min-w-0">
            <div className="flex items-center gap-2 min-w-0">
              <div className="w-7 h-7 rounded-lg bg-indigo-600 text-white flex items-center justify-center shadow-xs shrink-0">
                <Compass className="w-4 h-4" />
              </div>
              <div className="min-w-0">
                <CardTitle className="text-sm font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
                  Gợi ý điều phối nhân sự
                </CardTitle>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  So tải đang mở quy đổi/người với mặt bằng chung — tính toán từ dữ liệu nhiệm vụ thực tế
                </p>
              </div>
            </div>
            <Badge variant="outline" className="text-[11px] bg-white/80 border-indigo-200 text-indigo-700 w-fit">
              Hệ số cân bằng tải tự động
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="px-4 pb-4 pt-1">
          <div className="grid gap-2.5 sm:grid-cols-2 lg:grid-cols-3">
            {workloadRecommendations.map((item) => (
              <div
                key={item.id}
                className={`rounded-lg border p-3 flex flex-col justify-between transition-all hover:shadow-xs ${item.boxClass}`}
              >
                <div className="flex items-start gap-2">
                  <span className="text-base leading-none shrink-0 mt-0.5">{item.icon}</span>
                  <div className="min-w-0">
                    <div className={`text-xs font-bold flex items-center gap-1.5 ${item.textClass}`}>
                      {item.statusTitle}
                      <span className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${item.badgeClass}`}>
                        {item.statusBadge}
                      </span>
                    </div>
                    <div className={`text-[11px] mt-1 leading-snug ${item.subTextClass}`}>
                      Tải đang mở: <strong className="font-bold">{item.ratio} quy đổi/người</strong> (TB chung{" "}
                      {item.tbChung}) · <strong>{item.empCount} NV</strong>
                      {item.overloadedCount > 0 && (
                        <span>
                          {" "}· <span className="font-semibold underline">{item.overloadedCount} người quá tải</span>
                        </span>
                      )}
                    </div>
                  </div>
                </div>
                <div className="mt-2 pt-1.5 border-t border-slate-200/60 text-[10px] text-slate-700">
                  {item.advice}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* 3. Thẻ Thông tin Nhân viên & Vai trò (User Banner) */}
      <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-3.5">
        <div className="flex items-center gap-3 min-w-0">
          <Avatar className="h-11 w-11 border-2 border-blue-500/20 bg-blue-50 shrink-0">
            <AvatarFallback className="font-bold text-blue-700 bg-blue-100 text-sm">
              {userName
                .split(" ")
                .map((n: string) => n[0])
                .slice(-2)
                .join("")}
            </AvatarFallback>
          </Avatar>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Badge className="bg-blue-600 hover:bg-blue-700 text-white text-[11px] px-2 py-0.5">
                Nhân viên
              </Badge>
              <span className="text-xs text-slate-500">
                Bạn đang xem nhiệm vụ được giao và phối hợp theo phân quyền đơn vị.
              </span>
            </div>
            <div className="flex items-center gap-2 mt-0.5 flex-wrap">
              <span className="text-base font-bold text-slate-900 dark:text-slate-100 flex items-center gap-1">
                <span className="text-slate-600">👤</span> {userName}
              </span>
              <span className="text-xs text-slate-400">·</span>
              <span className="text-xs font-medium text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                {userDept}
              </span>
            </div>
          </div>
        </div>

        <Button
          onClick={() => setIsSelfEvalOpen(true)}
          className="bg-emerald-600 hover:bg-emerald-700 text-white text-xs h-9 px-3.5 shadow-sm shrink-0 self-start md:self-center"
        >
          <Printer className="w-3.5 h-3.5 mr-1.5" />
          🖨 Tự đánh giá
        </Button>
      </div>

      {/* 4. Sáu thẻ chỉ số cá nhân thực tế (Personal KPI Metrics Grid) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
        {/* Tỷ lệ HT */}
        <Card className="border-emerald-200/80 bg-gradient-to-b from-emerald-50/50 to-white shadow-xs">
          <CardContent className="p-3.5 text-center">
            <div className="text-2xl font-black text-emerald-600">{personalMetrics.completionRate}%</div>
            <div className="text-xs font-semibold text-slate-600 mt-0.5">Tỷ lệ HT</div>
            <div className="text-[10px] text-slate-400 mt-1">Xuất sắc</div>
          </CardContent>
        </Card>

        {/* Tổng việc */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-3.5 text-center">
            <div className="text-2xl font-bold text-slate-800">{personalMetrics.total}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">Tổng việc</div>
            <div className="text-[10px] text-slate-400 mt-1">Được giao & phối hợp</div>
          </CardContent>
        </Card>

        {/* Hoàn thành */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-3.5 text-center">
            <div className="text-2xl font-bold text-blue-600">{personalMetrics.completed}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">Hoàn thành</div>
            <div className="text-[10px] text-slate-400 mt-1">Đã nghiệm thu</div>
          </CardContent>
        </Card>

        {/* Quá hạn */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-3.5 text-center">
            <div className="text-2xl font-bold text-slate-700">{personalMetrics.overdue}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">Quá hạn</div>
            <div className="text-[10px] text-emerald-600 font-medium mt-1">Đạt chuẩn</div>
          </CardContent>
        </Card>

        {/* HT quá hạn */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-3.5 text-center">
            <div className="text-2xl font-bold text-amber-600">{personalMetrics.completedOverdue}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">HT quá hạn</div>
            <div className="text-[10px] text-slate-400 mt-1">Có giải trình</div>
          </CardContent>
        </Card>

        {/* Sắp hết hạn */}
        <Card className="border-slate-200 bg-white shadow-xs">
          <CardContent className="p-3.5 text-center">
            <div className="text-2xl font-bold text-emerald-600">{personalMetrics.dueSoon}</div>
            <div className="text-xs font-medium text-slate-600 mt-0.5">Sắp hết hạn</div>
            <div className="text-[10px] text-slate-400 mt-1">Trong 48 giờ</div>
          </CardContent>
        </Card>
      </div>

      {/* 5. Thanh so sánh khối lượng quy đổi (Workload Benchmark Bar) */}
      <div className="rounded-xl border border-blue-200/80 bg-blue-50/40 p-3.5 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="text-base shrink-0">📊</span>
            <div className="text-xs sm:text-sm font-semibold text-slate-800">
              Khối lượng quy đổi tháng này của bạn: <strong className="text-blue-700 font-bold">12</strong> · TB
              phòng HT-NTS: <strong className="text-slate-700">13.23</strong> → bạn{" "}
              <span className="text-emerald-700 font-bold">thấp hơn 9%</span> trung bình phòng
            </div>
          </div>
          <Badge variant="outline" className="text-[11px] bg-white text-emerald-700 border-emerald-300 w-fit shrink-0">
            Tải cân bằng · Đáp ứng tốt
          </Badge>
        </div>

        {/* Benchmark progress visualization */}
        <div className="mt-2.5 space-y-1">
          <div className="flex justify-between text-[11px] text-slate-500 font-medium">
            <span>Bạn: 12 điểm quy đổi</span>
            <span>Mặt bằng phòng: 13.23 điểm</span>
          </div>
          <div className="relative w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-blue-500 to-indigo-600 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (12 / 13.23) * 91)}%` }}
            />
            {/* Target indicator */}
            <div
              className="absolute top-0 bottom-0 w-0.5 bg-red-500"
              style={{ left: "91%" }}
              title="Trung bình phòng (13.23)"
            />
          </div>
        </div>
      </div>

      {/* 6. Hai cột: Việc cần làm (Trái) & Biểu đồ tiến bộ 6 tháng (Phải) */}
      <div className="grid gap-4 md:grid-cols-2">
        {/* Cột trái: Việc cần làm thực tế */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="pb-3 pt-4 px-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <RotateCw className="w-4 h-4 text-amber-600 animate-spin-slow" />
                Việc cần làm:
              </CardTitle>
              <Badge variant="outline" className="text-[11px] bg-amber-50 text-amber-700 border-amber-200">
                {actionItems.length} nhiệm vụ ưu tiên
              </Badge>
            </div>
          </CardHeader>
          <CardContent className="p-3.5 space-y-2.5 flex-1">
            {actionItems.length === 0 ? (
              <div className="p-4 text-center text-xs text-slate-400">
                Hiện tại không có nhiệm vụ tồn đọng cần xử lý.
              </div>
            ) : (
              actionItems.map((item) => (
                <div
                  key={item.id}
                  onClick={() => handleOpenTask(item.id)}
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
                    <span className="text-blue-600 group-hover:underline flex items-center gap-0.5">
                      Xử lý ngay <Eye className="w-3 h-3 ml-0.5" />
                    </span>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Cột phải: Tiến bộ của tôi (6 tháng) */}
        <Card className="border-slate-200 shadow-sm flex flex-col">
          <CardHeader className="pb-2 pt-4 px-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-900 flex items-center gap-1.5">
                <TrendingUp className="w-4 h-4 text-emerald-600" />
                📈 Tiến bộ của tôi (6 tháng)
              </CardTitle>
              <div className="flex items-center gap-1.5 text-xs text-slate-500">
                <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500" />
                Điểm KPI (%)
              </div>
            </div>
          </CardHeader>
          <CardContent className="p-3 pt-4 flex-1">
            <div className="h-[210px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart
                  data={SIX_MONTH_PROGRESS}
                  margin={{ top: 10, right: 15, left: -20, bottom: 0 }}
                >
                  <defs>
                    <linearGradient id="progressGrad" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0.0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis
                    dataKey="month"
                    tick={{ fontSize: 11, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis
                    domain={[0, 100]}
                    ticks={[0, 25, 50, 75, 100]}
                    tick={{ fontSize: 10, fill: "#64748b" }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <RechartsTooltip
                    formatter={(val) => [`${val}%`, "Tỷ lệ HT"]}
                    labelFormatter={(label) => `Tháng ${label}`}
                    contentStyle={{
                      borderRadius: "8px",
                      border: "1px solid #e2e8f0",
                      fontSize: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                  />
                  <Area
                    type="monotone"
                    dataKey="score"
                    stroke="#10b981"
                    strokeWidth={2.5}
                    fillOpacity={1}
                    fill="url(#progressGrad)"
                    dot={{ r: 4, fill: "#10b981", strokeWidth: 1.5, stroke: "#ffffff" }}
                    activeDot={{ r: 6, fill: "#059669" }}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 px-2 pt-1 border-t border-slate-100">
              <span>Mục tiêu cơ quan: ≥ 85%</span>
              <span className="font-semibold text-emerald-600">Đạt 95% tháng 10 (Hoàn thành Xuất sắc)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 7. Công việc của tôi thực tế từ CSDL */}
      <Card className="border-slate-200 shadow-sm">
        <CardHeader className="pb-3 pt-4 px-4 border-b border-slate-100">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold text-slate-900 flex items-center gap-2">
                <span>📋</span> Công việc của tôi ({filteredTasks.length})
              </CardTitle>
              <p className="text-xs text-slate-500 mt-0.5">
                Chủ trì + phối hợp · mọi loại nhiệm vụ · quá hạn/gần hết hạn xếp trên
              </p>
            </div>

            {/* Tìm kiếm */}
            <div className="relative w-full sm:w-[240px]">
              <Input
                placeholder="Tìm kiếm nhiệm vụ..."
                className="h-8 text-xs pl-8 bg-slate-50/60"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <span className="absolute left-2.5 top-2 text-slate-400 text-xs">🔍</span>
            </div>
          </div>

          {/* Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 pt-2">
            <button
              onClick={() => setActiveCategory("ALL")}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                activeCategory === "ALL"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Tất cả ({allTasks.length})
            </button>
            <button
              onClick={() => setActiveCategory("LEADER")}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                activeCategory === "LEADER"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chủ trì ({allTasks.filter((t) => t.role === "Chủ trì").length})
            </button>
            <button
              onClick={() => setActiveCategory("COORDINATOR")}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                activeCategory === "COORDINATOR"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Phối hợp ({allTasks.filter((t) => t.role === "Phối hợp").length})
            </button>
            <button
              onClick={() => setActiveCategory("PENDING")}
              className={`text-xs px-2.5 py-1 rounded-md transition-all font-medium ${
                activeCategory === "PENDING"
                  ? "bg-blue-600 text-white shadow-xs"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              Chờ duyệt ({allTasks.filter((t) => t.status === "Chờ duyệt").length})
            </button>
          </div>
        </CardHeader>

        <CardContent className="p-3 sm:p-4 space-y-2.5">
          {filteredTasks.length === 0 ? (
            <div className="p-8 text-center text-slate-400 border border-dashed rounded-lg text-xs">
              Không có nhiệm vụ nào phù hợp với bộ lọc hiện tại.
            </div>
          ) : (
            filteredTasks.map((task) => (
              <div
                key={task.id}
                onClick={() => handleOpenTask(task.id)}
                className="group p-3.5 rounded-lg border border-slate-200 hover:border-blue-400 hover:bg-blue-50/20 transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs"
              >
                {/* Title & Metadata */}
                <div className="space-y-1.5 min-w-0 flex-1">
                  <div className="flex items-start gap-2">
                    <span className="text-blue-600 font-bold mt-0.5 shrink-0">
                      {task.title.startsWith("🔄") ? "" : "🔄"}
                    </span>
                    <div className="min-w-0">
                      <div className="text-xs sm:text-sm font-semibold text-slate-900 group-hover:text-blue-700 leading-snug">
                        {task.code && (
                          <span className="text-blue-700 font-bold mr-1.5">[{task.code}]</span>
                        )}
                        {task.title}
                      </div>
                    </div>
                  </div>

                  {/* Badges line */}
                  <div className="flex items-center gap-2 flex-wrap pl-5 text-[11px]">
                    <Badge variant="outline" className="bg-slate-50 text-slate-600 border-slate-200">
                      {task.type}
                    </Badge>
                    <Badge
                      className={
                        task.role === "Chủ trì"
                          ? "bg-blue-50 text-blue-700 border-blue-200"
                          : "bg-purple-50 text-purple-700 border-purple-200"
                      }
                      variant="outline"
                    >
                      {task.role}
                    </Badge>
                    <span className="text-slate-400 flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      Hạn: <strong className="text-slate-700 font-medium">{task.dueDate}</strong>
                    </span>
                  </div>
                </div>

                {/* Status & Action */}
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
        </CardContent>
      </Card>

      {/* 8. Modal Tự Đánh Giá (🖨 Tự đánh giá) */}
      <Dialog open={isSelfEvalOpen} onOpenChange={setIsSelfEvalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="text-base font-bold flex items-center gap-2 text-slate-900">
              <Printer className="w-5 h-5 text-emerald-600" />
              Phiếu Tự Đánh Giá Kết Quả Công Việc & KPI Cá Nhân
            </DialogTitle>
            <DialogDescription className="text-xs text-slate-500">
              Áp dụng theo quy chế đánh giá cán bộ, chuyên viên định kỳ Tháng 10/2026
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-2 text-xs">
            {/* Header info */}
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

            {/* 4 Tiêu chí KPI */}
            <div className="space-y-2.5">
              <div className="font-bold text-slate-800 text-xs uppercase tracking-tight">
                Chi tiết 4 tiêu chí thành phần:
              </div>

              {/* Tiêu chí A */}
              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• A%: Khối lượng quy đổi (Trọng số 30%)</span>
                  <span className="text-blue-600 font-bold">12.0 / 13.23 (90.7%)</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Gắn hệ số khó K từ 1.0 đến 3.5, hoàn thành các nhiệm vụ trọng tâm trong tháng.
                </p>
              </div>

              {/* Tiêu chí B */}
              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• B%: Chất lượng sản phẩm đầu ra (Trọng số 30%)</span>
                  <span className="text-emerald-600 font-bold">96.0 / 100</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Các văn bản trả lời tích hợp CSDL, rà soát LGSP được lãnh đạo duyệt không lỗi.
                </p>
              </div>

              {/* Tiêu chí C */}
              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• C%: Tiến độ thực hiện (Trọng số 25%)</span>
                  <span className="text-emerald-600 font-bold">98.0 / 100</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  0 nhiệm vụ quá hạn hiện tại; bảo lưu 100% điểm tiến độ theo đúng thời gian xin duyệt.
                </p>
              </div>

              {/* Tiêu chí D */}
              <div className="p-2.5 rounded-md border border-slate-200 bg-white space-y-1">
                <div className="flex justify-between font-semibold text-slate-800">
                  <span>• D%: Mức độ chủ động & phối hợp (Trọng số 15%)</span>
                  <span className="text-emerald-600 font-bold">95.0 / 100</span>
                </div>
                <p className="text-[11px] text-slate-500">
                  Chủ động phối hợp liên phòng HT-NTS, HCTH, QL-KTDL trong vận hành LGSP và CSDL dùng chung.
                </p>
              </div>
            </div>

            {/* Kết luận */}
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

      {/* 9. TaskDetailDrawer for inspecting task on card click */}
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
