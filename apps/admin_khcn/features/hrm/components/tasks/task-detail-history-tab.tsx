"use client";

import { useTaskHistory } from "../../hooks/useTasks";
import { Skeleton } from "@/components/ui/skeleton";
import { History, Clock, ArrowRightCircle, FileText, AlertCircle, CheckCircle2 } from "lucide-react";
import { format } from "date-fns";

const safeFormatDate = (date: any, fmt: string) => {
  if (!date) return "Chưa xác định";
  const d = new Date(date);
  if (isNaN(d.getTime())) return "Chưa xác định";
  return format(d, fmt);
};

export function TaskHistoryTab({ taskId, currentTask }: { taskId: number; currentTask: any }) {
  const { data: historyData, isLoading: historyLoading } = useTaskHistory(taskId);
  const history: any[] = (historyData as any)?.data ?? [];

  const buildTimeline = () => {
    if (history.length > 0) {
      return history.map((h: any) => {
        let content = h.note || h.detail || h.newValue?.reason || h.newValue?.message || "";

        const translateStatus = (status: string) => {
          const map: Record<string, string> = {
            TODO: "Cần làm", IN_PROGRESS: "Đang thực hiện", PENDING_APPROVAL: "Chờ phê duyệt",
            COMPLETED: "Hoàn thành", RETURNED: "Bị trả lại", REJECTED: "Đã từ chối", CANCELLED: "Đã hủy", DRAFT: "Bản nháp"
          };
          return map[status?.toUpperCase()] || status;
        };

        if (h.newValue?.progress !== undefined) {
          content += (content ? "\n" : "") + `Tiến độ mới: ${h.newValue.progress}%`;
        }
        if (h.newValue?.status) {
          content += (content ? "\n" : "") + `Trạng thái mới: ${translateStatus(h.newValue.status)}`;
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
          content += (content ? "\n" : "") + `Người phối hợp: ${h.coassigneeNames.join(', ')}`;
        }

        return {
          id: h.id,
          title: (h.actorName || "Hệ thống") + " đã " + (h.action?.toLowerCase() || h.description || "thao tác"),
          time: h.createdAt,
          icon: History,
          iconColor: "text-slate-500",
          content: content,
        };
      }).sort((a: any, b: any) => new Date(a.time).getTime() - new Date(b.time).getTime());
    }
    
    // Fallback timeline
    const timeline: any[] = [];
    timeline.push({ id: "t1", title: `Giao việc cho ${currentTask.assignee?.fullName ?? "người xử lý"}`, time: currentTask.createdAt, icon: Clock, iconColor: "text-blue-500", content: `Nội dung: ${currentTask.description}` });
    if (currentTask.status?.toUpperCase() !== "DRAFT" && currentTask.status?.toUpperCase() !== "ASSIGNED" && currentTask.status?.toUpperCase() !== "TODO") {
      timeline.push({ id: "t2", title: "Bắt đầu xử lý", time: currentTask.startDate, icon: ArrowRightCircle, iconColor: "text-orange-500", content: "Đã tiếp nhận và đang xử lý." });
    }
    if (currentTask.status?.toUpperCase() === "PENDING_APPROVAL" || currentTask.status?.toUpperCase() === "COMPLETED") {
      timeline.push({ id: "t3", title: "Báo cáo kết quả", time: currentTask.updatedAt, icon: FileText, iconColor: "text-slate-600", content: "Đã báo cáo tiến độ và gửi yêu cầu phê duyệt." });
    }
    const isOverdue = new Date(currentTask.dueDate) < (currentTask.completedAt ? new Date(currentTask.completedAt) : new Date());
    if (isOverdue && currentTask.status?.toUpperCase() !== "COMPLETED") {
      timeline.push({ id: "t4", title: "Quá hạn", time: currentTask.dueDate, icon: AlertCircle, iconColor: "text-red-500", content: "Công việc đã vượt quá thời hạn quy định." });
    }
    if (currentTask.status?.toUpperCase() === "COMPLETED") {
      timeline.push({ id: "t5", title: "Hoàn thành", time: currentTask.completedAt || currentTask.updatedAt, icon: CheckCircle2, iconColor: "text-green-500", content: "Đã hoàn thành toàn bộ công việc." });
    }
    return timeline.sort((a, b) => new Date(a.time).getTime() - new Date(b.time).getTime());
  };

  const timelineEvents = buildTimeline();

  if (historyLoading) {
    return (
      <div className="space-y-4 mt-4">
        {[1, 2, 3].map(i => <Skeleton key={i} className="h-20 w-full" />)}
      </div>
    );
  }

  return (
    <div className="relative pl-6 border-l-2 border-slate-200 space-y-8 pb-4 ml-2 mt-4">
      {timelineEvents.map((event, index) => {
        const Icon = event.icon;
        return (
          <div key={event.id} className="relative">
            <div className="absolute -left-[33px] bg-white p-1">
              <Icon className={`w-4 h-4 ${event.iconColor}`} />
            </div>
            <p className="text-sm font-medium">{event.title}</p>
            <p className="text-xs text-slate-500 mt-1">{safeFormatDate(event.time, "dd/MM/yyyy HH:mm")}</p>
            {event.content && (
              <p className={`text-sm mt-2 p-3 rounded-md border whitespace-pre-wrap ${index === 0 ? 'bg-slate-50 text-slate-600' : 'bg-white'}`}>
                {event.content}
              </p>
            )}
          </div>
        );
      })}
    </div>
  );
}
