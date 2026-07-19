/* eslint-disable @typescript-eslint/no-explicit-any */
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

  const normalizedStatus = status?.toUpperCase() || "UNKNOWN";


  const config = useMemo(() => {
    if (statuses && statuses.length > 0) {
      const found = statuses.find((s) => s.code === normalizedStatus);
      if (found) {
        let color = "bg-muted text-muted-foreground border-border";
        let iconName = "Activity";
        
        try {
          if (found.description) {
            const parsed = JSON.parse(found.description);
            color = parsed.color || color;
            iconName = parsed.icon || iconName;
          }
        // eslint-disable-next-line unused-imports/no-unused-vars
        } catch (e) {
          // ignore parsing error
        }

        return {
          label: found.name || found.label || status, // fallback for legacy data just in case
          color: color,
          icon: (LucideIcons as any)[iconName] || Activity
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
