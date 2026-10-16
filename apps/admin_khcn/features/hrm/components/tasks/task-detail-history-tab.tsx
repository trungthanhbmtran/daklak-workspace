/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useTaskHistory } from "../../hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { Heading, Text } from "@/components/ui/typography";
import {
  History,
  Clock,
  ArrowRightCircle,
  FileText,
  AlertCircle,
  CheckCircle2,
  User,
  PlusCircle,
  Calendar,
  Award,
  Edit3,
} from "lucide-react";
import { format } from "date-fns";
import { translateTaskStatus } from "./task-utils";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

export function TaskHistoryTab({ taskId, currentTask }: { taskId: number; currentTask?: any }) {
  const isValidTaskId = Boolean(taskId && Number(taskId) > 0);
  const { data: historyData, isLoading: historyLoading } = useTaskHistory(isValidTaskId ? Number(taskId) : undefined, {
    enabled: isValidTaskId,
  });
  const rawHistory = (historyData as any)?.data ?? historyData;
  const history: any[] = Array.isArray(rawHistory)
    ? rawHistory
    : Array.isArray(rawHistory?.data)
    ? rawHistory.data
    : [];

  const getActionIcon = (actionStr: string) => {
    const act = (actionStr || "").toLowerCase();
    if (act.includes("tạo") || act.includes("khởi tạo")) {
      return { icon: PlusCircle, bg: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    if (act.includes("giao") || act.includes("phân công")) {
      return { icon: User, bg: "bg-indigo-100 text-indigo-700 border-indigo-200" };
    }
    if (act.includes("bắt đầu") || act.includes("tiếp nhận")) {
      return { icon: ArrowRightCircle, bg: "bg-blue-100 text-blue-700 border-blue-200" };
    }
    if (act.includes("tiến độ") || act.includes("báo cáo")) {
      return { icon: FileText, bg: "bg-amber-100 text-amber-700 border-amber-200" };
    }
    if (act.includes("gia hạn")) {
      return { icon: Calendar, bg: "bg-purple-100 text-purple-700 border-purple-200" };
    }
    if (act.includes("hoàn thành")) {
      return { icon: CheckCircle2, bg: "bg-emerald-100 text-emerald-700 border-emerald-200" };
    }
    if (act.includes("thẩm định") || act.includes("đánh giá")) {
      return { icon: Award, bg: "bg-indigo-100 text-indigo-700 border-indigo-200" };
    }
    if (act.includes("cập nhật") || act.includes("chỉnh sửa")) {
      return { icon: Edit3, bg: "bg-slate-100 text-slate-700 border-slate-200" };
    }
    return { icon: History, bg: "bg-slate-100 text-slate-700 border-slate-200" };
  };

  const buildTimeline = () => {
    if (history.length > 0) {
      return history
        .map((h: any) => {
          let content = h.note || h.detail || h.newValue?.reason || h.newValue?.message || "";

          if (h.newValue?.progress !== undefined) {
            content += (content ? "\n" : "") + `Tiến độ mới: ${h.newValue.progress}%`;
          }
          if (h.newValue?.status) {
            content += (content ? "\n" : "") + `Trạng thái mới: ${translateTaskStatus(h.newValue.status)}`;
          }
          if (h.action === "Cập nhật thông tin" && h.newValue) {
            if (h.newValue.title) content += (content ? "\n" : "") + `Tiêu đề: ${h.newValue.title}`;
            if (h.newValue.priority) content += (content ? "\n" : "") + `Mức độ ưu tiên: ${h.newValue.priority}`;
            if (h.newValue.dueDate) content += (content ? "\n" : "") + `Hạn chót: ${safeFormatDate(h.newValue.dueDate, "dd/MM/yyyy")}`;
          }

          if (h.assigneeName) {
            content += (content ? "\n" : "") + `Người xử lý: ${h.assigneeName}`;
          }
          if (h.coassigneeNames && h.coassigneeNames.length > 0) {
            content += (content ? "\n" : "") + `Người phối hợp: ${h.coassigneeNames.join(", ")}`;
          }

          const actionStyle = getActionIcon(h.action || h.description || "");

          return {
            id: h.id,
            title: (h.actorName || "Hệ thống") + " đã " + (h.action?.toLowerCase() || h.description || "thao tác"),
            time: h.createdAt,
            icon: actionStyle.icon,
            iconBg: actionStyle.bg,
            content: content,
          };
        })
        .sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }

    // Fallback timeline
    const timeline: any[] = [];
    if (currentTask.createdAt) {
      timeline.push({
        id: "t1",
        title: `Giao việc cho ${currentTask.assigneeName || currentTask.assignee?.fullName || "người xử lý"}`,
        time: currentTask.createdAt,
        icon: User,
        iconBg: "bg-blue-100 text-blue-700 border-blue-200",
        content: `Nhiệm vụ: ${currentTask.title}\nNội dung: ${currentTask.description || "Chưa có mô tả chi tiết."}`,
      });
    }

    if (currentTask.startDate && currentTask.status?.toUpperCase() !== "DRAFT" && currentTask.status?.toUpperCase() !== "ASSIGNED") {
      timeline.push({
        id: "t2",
        title: "Bắt đầu xử lý nhiệm vụ",
        time: currentTask.startDate,
        icon: ArrowRightCircle,
        iconBg: "bg-blue-100 text-blue-700 border-blue-200",
        content: "Cán bộ chủ trì đã tiếp nhận công việc và bắt đầu thực hiện.",
      });
    }

    if (currentTask.status === "PENDING_APPROVAL" || currentTask.status === "REVIEWING" || currentTask.status === "PENDING_REVIEW") {
      timeline.push({
        id: "t3",
        title: "Nộp báo cáo sản phẩm & Đề nghị thẩm định",
        time: currentTask.updatedAt,
        icon: FileText,
        iconBg: "bg-amber-100 text-amber-700 border-amber-200",
        content: "Đã hoàn thành các hạng mục công việc và gửi Lãnh đạo thẩm định đánh giá.",
      });
    }

    const dueDateObj = currentTask.dueDate ? new Date(currentTask.dueDate) : null;
    const completedAtObj = currentTask.completedAt ? new Date(currentTask.completedAt) : new Date();
    const isOverdue = dueDateObj && !isNaN(dueDateObj.getTime()) && dueDateObj < completedAtObj;

    if (isOverdue && currentTask.status?.toUpperCase() !== "COMPLETED") {
      timeline.push({
        id: "t4",
        title: "Cảnh báo quá hạn quy định",
        time: currentTask.dueDate,
        icon: AlertCircle,
        iconBg: "bg-red-100 text-red-700 border-red-200",
        content: "Công việc đã vượt quá thời hạn được giao nhưng chưa hoàn thành.",
      });
    }

    if (currentTask.status?.toUpperCase() === "COMPLETED") {
      timeline.push({
        id: "t5",
        title: "Hoàn thành & Nghiệm thu",
        time: currentTask.completedAt || currentTask.updatedAt,
        icon: CheckCircle2,
        iconBg: "bg-emerald-100 text-emerald-700 border-emerald-200",
        content: "Nhiệm vụ đã được nghiệm thu và hoàn thành toàn bộ.",
      });
    }

    return timeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const timelineEvents = buildTimeline();

  if (historyLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2.5 pb-2">
        <div className="p-1.5 rounded-lg bg-slate-100 text-slate-700">
          <History className="w-4 h-4" />
        </div>
        <div>
          <Heading level="h4" className="font-bold text-slate-900 text-sm">
            Nhật ký & Vết kiểm toán nhiệm vụ
          </Heading>
          <span className="text-[11px] text-slate-400">
            Toàn bộ diễn biến luân chuyển, giao việc, cập nhật và thẩm định công vụ
          </span>
        </div>
      </div>

      <div className="relative pl-6 border-l-2 border-slate-200 space-y-6 pb-4 ml-4">
        {timelineEvents.map((event) => {
          const Icon = event.icon;
          return (
            <div key={event.id} className="relative group">
              {/* Timeline Node Icon */}
              <div
                className={`absolute -left-[35px] top-0.5 w-7 h-7 rounded-full border flex items-center justify-center shadow-2xs ${event.iconBg}`}
              >
                <Icon className="w-3.5 h-3.5" />
              </div>

              {/* Event Content Card */}
              <div className="bg-white p-4 rounded-xl border border-slate-200/80 shadow-2xs space-y-1.5 hover:border-slate-300 transition-colors">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1">
                  <span className="font-semibold text-slate-900 text-xs">
                    {event.title}
                  </span>
                  <span className="text-[11px] text-slate-400 font-mono">
                    {safeFormatDate(event.time, "dd/MM/yyyy HH:mm")}
                  </span>
                </div>

                {event.content && (
                  <p className="text-xs text-slate-600 whitespace-pre-wrap leading-relaxed pt-1 border-t border-slate-50 font-normal">
                    {event.content}
                  </p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
