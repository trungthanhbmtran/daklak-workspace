import React, { useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import * as LucideIcons from "lucide-react";
import { Activity } from "lucide-react";
import { useWorkflowStatuses } from "@/features/workflow/hooks";

interface WorkflowStatusBadgeProps {
  status: string;
  className?: string;
  showIcon?: boolean;
}

export const WorkflowStatusBadge = ({ status, className = "", showIcon = true }: WorkflowStatusBadgeProps) => {
  const { data: statuses } = useWorkflowStatuses();

  let normalizedStatus = status?.toUpperCase() || "UNKNOWN";

  // Relaxed mapping to handle various spacings, quotes, and legacy aliases
  if (
    normalizedStatus.includes("APPROVED") || 
    normalizedStatus === "DUYỆT" || 
    normalizedStatus === "PHÊ DUYỆT"
  ) {
    if (normalizedStatus !== "PENDING_APPROVAL") {
      normalizedStatus = "APPROVED";
    }
  } else if (
    normalizedStatus.includes("REJECTED") || 
    normalizedStatus.includes("TỪ CHỐI") || 
    normalizedStatus.includes("TRẢ LẠI")
  ) {
    normalizedStatus = "REJECTED";
  }

  const config = useMemo(() => {
    if (statuses && statuses.length > 0) {
      const found = statuses.find((s) => s.code === normalizedStatus);
      if (found) {
        return {
          label: found.label,
          color: found.color,
          icon: (LucideIcons as any)[found.icon] || Activity
        };
      }
    }
    return { 
      label: status || "Không xác định", 
      color: "bg-muted text-muted-foreground border-border", 
      icon: Activity 
    };
  }, [statuses, normalizedStatus, status]);

  const StatusIcon = config.icon;

  return (
    <Badge className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit border ${config.color} ${className}`}>
      {showIcon && <StatusIcon className="h-3 w-3" />}
      {config.label}
    </Badge>
  );
};
