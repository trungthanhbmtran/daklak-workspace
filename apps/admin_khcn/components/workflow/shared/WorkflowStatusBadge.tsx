import React from "react";
import { Badge } from "@/components/ui/badge";
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  XCircle,
  PauseCircle,
  FileText
} from "lucide-react";

export const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  // Workflow Execution Statuses
  RUNNING: { label: "Đang chạy", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Play },
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  FAILED: { label: "Lỗi", color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle },
  WAITING: { label: "Đang chờ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  
  // Task/Step Statuses
  TODO: { label: "Cần làm", color: "bg-slate-100 text-slate-700 border-slate-200", icon: FileText },
  IN_PROGRESS: { label: "Đang xử lý", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Activity },
  PENDING_APPROVAL: { label: "Chờ duyệt", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
  APPROVED: { label: "Đã duyệt", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  REJECTED: { label: "Từ chối", color: "bg-rose-100 text-rose-700 border-rose-200", icon: XCircle },
  RETURNED: { label: "Trả lại", color: "bg-orange-100 text-orange-700 border-orange-200", icon: PauseCircle },
  DONE: { label: "Hoàn tất", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
};

interface WorkflowStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export const WorkflowStatusBadge = ({ status, className = "", showIcon = true }: WorkflowStatusBadgeProps) => {
  const normalizedStatus = status?.toUpperCase() || "UNKNOWN";
  const config = STATUS_CONFIG[normalizedStatus] || { 
    label: status || "Không xác định", 
    color: "bg-muted text-muted-foreground border-border", 
    icon: Activity 
  };
  
  const StatusIcon = config.icon;

  return (
    <Badge className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit border ${config.color} ${className}`}>
      {showIcon && <StatusIcon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};
