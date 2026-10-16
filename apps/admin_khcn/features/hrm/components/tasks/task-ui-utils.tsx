/* eslint-disable @typescript-eslint/no-explicit-any */
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";
import { Sparkles, Repeat, Briefcase } from "lucide-react";
export { translateTaskStatus, getTaskStatusColor } from "./task-utils";

export function unwrapTaskData(res: any): any {
  if (!res) return null;
  let target = res?.data ?? res;
  if (target && typeof target === "object" && target.data && !Array.isArray(target.data)) {
    target = target.data;
  }
  if (target && typeof target === "object" && target.data && !Array.isArray(target.data)) {
    target = target.data;
  }
  return target;
}

export const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

export const getDeadlineStatus = (dueDate: any, isCompleted: boolean, completedAt?: any) => {
  if (!dueDate) {
    return {
      label: "Không quy định hạn",
      color: "text-slate-500",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      isOverdue: false,
    };
  }
  const due = new Date(dueDate);
  if (isNaN(due.getTime())) {
    return {
      label: "Chưa xác định",
      color: "text-slate-500",
      badgeClass: "bg-slate-100 text-slate-600 border-slate-200",
      isOverdue: false,
    };
  }

  const now = new Date();
  if (isCompleted) {
    const comp = completedAt ? new Date(completedAt) : now;
    if (!isNaN(comp.getTime()) && comp > due) {
      return {
        label: "Hoàn thành trễ hạn",
        color: "text-amber-600",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
        isOverdue: false,
      };
    }
    return {
      label: "Hoàn thành đúng hạn",
      color: "text-emerald-600",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200 font-medium",
      isOverdue: false,
    };
  }

  const diffMs = due.getTime() - now.getTime();
  const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays < 0) {
    return {
      label: `Quá hạn ${Math.abs(diffDays)} ngày`,
      color: "text-red-600 font-bold",
      badgeClass: "bg-red-50 text-red-700 border-red-200 font-bold animate-pulse",
      isOverdue: true,
    };
  }
  if (diffDays === 0) {
    return {
      label: "Hôm nay đến hạn",
      color: "text-amber-600 font-semibold",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-semibold",
      isOverdue: false,
    };
  }
  if (diffDays <= 3) {
    return {
      label: `Còn ${diffDays} ngày`,
      color: "text-amber-600 font-medium",
      badgeClass: "bg-amber-50 text-amber-700 border-amber-200 font-medium",
      isOverdue: false,
    };
  }
  return {
    label: `Còn ${diffDays} ngày`,
    color: "text-slate-600",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    isOverdue: false,
  };
};

export const getPriorityBadgeComponent = (priority: string) => {
  const p = (priority || "").toUpperCase();
  switch (p) {
    case "URGENT":
    case "KHẨN":
      return (
        <Badge variant="destructive" className="bg-red-600 hover:bg-red-700 text-white font-semibold flex items-center gap-1 shadow-2xs">
          <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
          Khẩn cấp
        </Badge>
      );
    case "HIGH":
    case "CAO":
      return (
        <Badge variant="destructive" className="bg-rose-500 hover:bg-rose-600 text-white font-semibold">
          Ưu tiên cao
        </Badge>
      );
    case "LOW":
    case "THẤP":
      return (
        <Badge variant="outline" className="text-slate-500 bg-slate-50 border-slate-200">
          Ưu tiên thấp
        </Badge>
      );
    case "NORMAL":
    case "MEDIUM":
    case "THƯỜNG":
    default:
      return (
        <Badge variant="outline" className="text-blue-700 bg-blue-50 border-blue-200 font-medium">
          Bình thường
        </Badge>
      );
  }
};

export const getTaskTypeBadge = (task: any) => {
  if (task?.metadata?.taskType === "UNPLANNED" || task?.metadata?.isIncidental) {
    return (
      <Badge variant="outline" className="text-amber-700 bg-amber-50 border-amber-300 font-semibold flex items-center gap-1 shadow-2xs">
        <Sparkles className="w-3 h-3 text-amber-600" /> Việc phát sinh
      </Badge>
    );
  }
  if (task?.metadata?.taskType === "PERIODIC") {
    const rec = task.metadata?.recurrence;
    const recText =
      rec === "DAILY"
        ? "Hàng ngày"
        : rec === "WEEKLY"
        ? "Hàng tuần"
        : rec === "MONTHLY"
        ? "Hàng tháng"
        : rec === "QUARTERLY"
        ? "Hàng quý"
        : rec === "YEARLY"
        ? "Hàng năm"
        : "";
    return (
      <Badge variant="outline" className="text-emerald-700 bg-emerald-50 border-emerald-200 font-medium flex items-center gap-1">
        <Repeat className="w-3 h-3 text-emerald-600" /> Định kỳ {recText && `(${recText})`}
      </Badge>
    );
  }
  return (
    <Badge variant="outline" className="text-slate-600 bg-slate-50 border-slate-200 font-medium flex items-center gap-1">
      <Briefcase className="w-3 h-3 text-slate-500" /> Thường xuyên
    </Badge>
  );
};
