/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Sparkles,
  ChevronDown,
  ChevronUp,
  Briefcase,
  CheckCircle2,
  AlertTriangle,
  Flame,
  FileText,
  UserCheck,
  TrendingUp,
} from "lucide-react";
import { useTaskRecommendations } from "../../hooks/useTasks";
import { toast } from "sonner";

interface DepartmentWorkloadRecommendationProps {
  departmentId?: number | string | null;
  departmentName?: string;
  onSelectAssignee: (employeeCode: string) => void;
  onInsertToDescription?: (textToInsert: string) => void;
  currentAssigneeCode?: string;
  className?: string;
}

export function DepartmentWorkloadRecommendation({
  departmentId,
  departmentName,
  onSelectAssignee,
  onInsertToDescription,
  currentAssigneeCode,
  className = "",
}: DepartmentWorkloadRecommendationProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const numDeptId = useMemo(() => {
    if (!departmentId || departmentId === "ALL") return undefined;
    const n = Number(departmentId);
    return isNaN(n) ? undefined : n;
  }, [departmentId]);

  const { data: recData, isLoading } = useTaskRecommendations({
    departmentId: numDeptId,
    enabled: Boolean(numDeptId),
  });

  const employees = recData?.data?.topEmployees ?? [];
  const deptStats = recData?.data?.topDepartments?.[0];

  // Tính toán thống kê tải phòng ban nếu deptStats chưa đủ
  const stats = useMemo(() => {
    const total = employees.length;
    let light = 0;
    let medium = 0;
    let heavy = 0;

    employees.forEach((emp) => {
      const load = emp.currentLoad || 0;
      if (load <= 2) light++;
      else if (load <= 5) medium++;
      else heavy++;
    });

    return {
      total: deptStats?.employeeCount ?? total,
      light: deptStats?.lightLoadCount ?? light,
      medium: deptStats?.mediumLoadCount ?? medium,
      heavy: deptStats?.heavyLoadCount ?? heavy,
    };
  }, [employees, deptStats]);

  // Cán bộ đề xuất tối ưu hàng đầu
  const topCandidate = employees[0];

  // Xử lý chèn căn cứ vào mô tả công việc
  const handleInsertBasis = (emp: typeof topCandidate) => {
    if (!emp || !onInsertToDescription) return;
    const loadText =
      emp.currentLoad === 0
        ? "hiện chưa có nhiệm vụ tồn đọng (0 việc)"
        : `tải công việc hiện tại đang thấp (${emp.currentLoad} nhiệm vụ đang xử lý)`;

    const textToAppend = `\n\n[Căn cứ phân công công việc]: Đề xuất giao đồng chí ${
      emp.fullName || emp.employeeName
    }${
      emp.jobTitleName ? ` (${emp.jobTitleName})` : ""
    } phụ trách chính do ${loadText}, kết quả chất lượng công việc (KPI) đạt ${
      emp.performanceScore
    } điểm, đáp ứng tiêu chí cân bằng tải và năng lực thực thi của phòng ban.`;

    onInsertToDescription(textToAppend);
    toast.success("Đã chèn căn cứ phân công vào phần mô tả công việc");
  };

  if (!numDeptId) {
    return null;
  }

  return (
    <div
      className={`rounded-xl border border-indigo-200 dark:border-indigo-900/60 bg-gradient-to-br from-indigo-50/70 via-white to-blue-50/50 dark:from-slate-950 dark:via-slate-900/90 dark:to-indigo-950/40 p-4 shadow-sm space-y-3.5 min-w-0 ${className}`}
    >
      {/* 1. Header & Thống kê tải phòng ban */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pb-3 border-b border-indigo-100 dark:border-indigo-900/40 min-w-0">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex items-center justify-center w-7 h-7 rounded-lg bg-indigo-600 text-white shadow-sm shrink-0">
            <TrendingUp className="w-4 h-4" />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100 uppercase tracking-tight">
                Tình hình tải công việc
              </span>
              {departmentName && (
                <Badge
                  variant="outline"
                  className="text-[10px] bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800 font-medium truncate max-w-[200px]"
                >
                  {departmentName}
                </Badge>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              Công thức: Ưu tiên cán bộ việc đang ít (cân bằng tải) & chất lượng KPI phù hợp
            </p>
          </div>
        </div>

        {/* Snapshot Tải phòng ban */}
        <div className="flex items-center gap-1.5 flex-wrap shrink-0">
          <Badge
            variant="secondary"
            className="text-[11px] font-normal bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800 flex items-center gap-1"
            title="Số cán bộ có <= 2 công việc đang thực hiện"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            <span>Tải nhẹ:</span>
            <strong className="font-semibold">{stats.light}</strong>
          </Badge>

          <Badge
            variant="secondary"
            className="text-[11px] font-normal bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800 flex items-center gap-1"
            title="Số cán bộ có 3 - 5 công việc đang thực hiện"
          >
            <Briefcase className="w-3 h-3 text-blue-600" />
            <span>Tải vừa:</span>
            <strong className="font-semibold">{stats.medium}</strong>
          </Badge>

          {stats.heavy > 0 && (
            <Badge
              variant="secondary"
              className="text-[11px] font-normal bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800 flex items-center gap-1"
              title="Số cán bộ có > 5 công việc đang thực hiện (cần tránh quá tải)"
            >
              <Flame className="w-3 h-3 text-amber-600" />
              <span>Nhiều việc:</span>
              <strong className="font-semibold">{stats.heavy}</strong>
            </Badge>
          )}
        </div>
      </div>

      {/* 2. Loading state */}
      {isLoading && (
        <div className="py-4 flex items-center justify-center gap-2 text-xs text-indigo-600 dark:text-indigo-400">
          <Sparkles className="w-4 h-4 animate-spin" />
          <span>Đang tính toán đề xuất phân công thông minh...</span>
        </div>
      )}

      {/* 3. Thẻ Đề xuất nổi bật (Top candidate) */}
      {!isLoading && topCandidate && (
        <div className="p-3 rounded-lg bg-white dark:bg-slate-900 border border-indigo-200/80 dark:border-indigo-800/80 shadow-sm space-y-2.5 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 min-w-0">
            <div className="flex items-center gap-2.5 min-w-0">
              <Avatar className="w-9 h-9 border border-indigo-200 dark:border-indigo-800 shrink-0">
                <AvatarImage src={topCandidate.avatar || undefined} />
                <AvatarFallback className="bg-indigo-100 text-indigo-700 dark:bg-indigo-900 dark:text-indigo-200 text-xs font-bold">
                  {(topCandidate.fullName || topCandidate.employeeName || "CB")
                    .slice(0, 2)
                    .toUpperCase()}
                </AvatarFallback>
              </Avatar>

              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <Badge className="text-[10px] h-4.5 bg-gradient-to-r from-indigo-600 to-blue-600 text-white font-medium border-0 gap-1 px-1.5 shrink-0">
                    <Sparkles className="w-2.5 h-2.5" />
                    Đề xuất tối ưu
                  </Badge>
                  <span className="text-xs font-bold text-slate-900 dark:text-slate-100 truncate">
                    {topCandidate.fullName || topCandidate.employeeName}
                  </span>
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 shrink-0">
                    ({topCandidate.employeeCode})
                  </span>
                </div>

                <div className="flex items-center gap-2 text-[11px] text-slate-600 dark:text-slate-300 mt-0.5 flex-wrap">
                  <span className="font-medium text-emerald-600 dark:text-emerald-400">
                    {topCandidate.currentLoad === 0
                      ? "⚡ Đang rảnh (0 việc)"
                      : `⚡ Đang xử lý: ${topCandidate.currentLoad} việc`}
                  </span>
                  <span className="text-slate-300 dark:text-slate-700">•</span>
                  <span className="text-indigo-600 dark:text-indigo-400 font-medium">
                    KPI: {topCandidate.performanceScore} điểm
                  </span>
                  {topCandidate.reason && (
                    <>
                      <span className="text-slate-300 dark:text-slate-700">•</span>
                      <span className="italic text-slate-500 text-[10.5px]">
                        {topCandidate.reason}
                      </span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {/* Thao tác 1-chạm */}
            <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0">
              <Button
                type="button"
                size="sm"
                variant={currentAssigneeCode === topCandidate.employeeCode ? "default" : "outline"}
                className={`h-8 px-2.5 text-xs gap-1 font-medium shadow-sm transition-all ${
                  currentAssigneeCode === topCandidate.employeeCode
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white border-emerald-600"
                    : "border-indigo-300 text-indigo-700 hover:bg-indigo-50 dark:border-indigo-700 dark:text-indigo-300 dark:hover:bg-indigo-950/50"
                }`}
                onClick={() => {
                  onSelectAssignee(topCandidate.employeeCode);
                  toast.success(
                    `Đã chọn đồng chí ${topCandidate.fullName || topCandidate.employeeName} làm chủ trì nhận việc`
                  );
                }}
              >
                {currentAssigneeCode === topCandidate.employeeCode ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Đã chọn</span>
                  </>
                ) : (
                  <>
                    <UserCheck className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
                    <span>⚡ Phân công người này</span>
                  </>
                )}
              </Button>

              {onInsertToDescription && (
                <Button
                  type="button"
                  size="sm"
                  variant="ghost"
                  className="h-8 px-2 text-xs gap-1 text-slate-600 hover:text-indigo-700 hover:bg-indigo-50 dark:text-slate-400 dark:hover:text-indigo-300 dark:hover:bg-indigo-950/40"
                  title="Chèn tóm tắt căn cứ đề xuất vào ô Mô tả công việc"
                  onClick={() => handleInsertBasis(topCandidate)}
                >
                  <FileText className="w-3.5 h-3.5 text-slate-500" />
                  <span className="hidden sm:inline">📋 Chèn vào mô tả</span>
                </Button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 4. Xem chi tiết tải của tất cả cán bộ trong phòng (Collapsible) */}
      {!isLoading && employees.length > 1 && (
        <div className="pt-1 min-w-0">
          <button
            type="button"
            className="flex items-center justify-between w-full text-[11.5px] font-semibold text-slate-600 hover:text-indigo-700 dark:text-slate-400 dark:hover:text-indigo-300 py-1 transition-colors"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            <span className="flex items-center gap-1.5">
              <span>Bảng theo dõi tải các cán bộ trong phòng ({employees.length} nhân sự)</span>
              {stats.heavy > 0 && (
                <span className="text-[10px] text-amber-600 font-normal">
                  (Có {stats.heavy} người đang nhiều việc)
                </span>
              )}
            </span>
            <span className="flex items-center gap-1 text-xs">
              {isExpanded ? (
                <>
                  <span>Thu gọn</span>
                  <ChevronUp className="w-3.5 h-3.5" />
                </>
              ) : (
                <>
                  <span>Xem chi tiết</span>
                  <ChevronDown className="w-3.5 h-3.5" />
                </>
              )}
            </span>
          </button>

          {isExpanded && (
            <div className="mt-2 space-y-1.5 max-h-56 overflow-y-auto pr-1 animate-in fade-in duration-150">
              {employees.map((emp) => {
                const isSelected = currentAssigneeCode === emp.employeeCode;
                const isHeavy = (emp.currentLoad || 0) > 5;
                const isMedium = (emp.currentLoad || 0) >= 3 && (emp.currentLoad || 0) <= 5;
                const isLight = (emp.currentLoad || 0) <= 2;

                return (
                  <div
                    key={emp.employeeCode}
                    className={`p-2 rounded-lg border text-xs flex items-center justify-between gap-2 transition-colors min-w-0 ${
                      isSelected
                        ? "bg-indigo-50/90 border-indigo-300 dark:bg-indigo-950/60 dark:border-indigo-700"
                        : "bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/60"
                    }`}
                  >
                    <div className="flex items-center gap-2 min-w-0 flex-1">
                      <Avatar className="w-7 h-7 shrink-0 text-[10px]">
                        <AvatarImage src={emp.avatar || undefined} />
                        <AvatarFallback className="bg-slate-100 text-slate-700">
                          {(emp.fullName || emp.employeeName || "NV").slice(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>

                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="font-medium text-slate-800 dark:text-slate-200 truncate">
                            {emp.fullName || emp.employeeName}
                          </span>
                          {emp.jobTitleName && (
                            <span className="text-[10.5px] text-slate-400 truncate">
                              • {emp.jobTitleName}
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 text-[10.5px] text-slate-500 mt-0.5">
                          <span>KPI: {emp.performanceScore}đ</span>
                          <span>•</span>
                          <span className="italic">{emp.reason}</span>
                        </div>
                      </div>
                    </div>

                    {/* Badge tải & Nút gán */}
                    <div className="flex items-center gap-1.5 shrink-0">
                      {isLight && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300"
                        >
                          {emp.currentLoad} việc (Tải nhẹ)
                        </Badge>
                      )}
                      {isMedium && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300"
                        >
                          {emp.currentLoad} việc (Tải vừa)
                        </Badge>
                      )}
                      {isHeavy && (
                        <Badge
                          variant="secondary"
                          className="text-[10px] h-5 bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 flex items-center gap-0.5"
                        >
                          <AlertTriangle className="w-2.5 h-2.5 text-amber-600" />
                          <span>{emp.currentLoad} việc (Nhiều việc)</span>
                        </Badge>
                      )}

                      <Button
                        type="button"
                        size="sm"
                        variant={isSelected ? "default" : "outline"}
                        className={`h-6 px-2 text-[11px] ${
                          isSelected
                            ? "bg-indigo-600 text-white"
                            : "hover:bg-indigo-50 text-slate-700 dark:text-slate-300"
                        }`}
                        onClick={() => {
                          onSelectAssignee(emp.employeeCode);
                          toast.success(
                            `Đã chọn đồng chí ${emp.fullName || emp.employeeName} làm chủ trì nhận việc`
                          );
                        }}
                      >
                        {isSelected ? "Đã chọn" : "Chọn"}
                      </Button>

                      {onInsertToDescription && (
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="h-6 w-6 p-0 text-slate-400 hover:text-indigo-600"
                          title="Chèn căn cứ vào mô tả"
                          onClick={() => handleInsertBasis(emp)}
                        >
                          <FileText className="w-3.5 h-3.5" />
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
