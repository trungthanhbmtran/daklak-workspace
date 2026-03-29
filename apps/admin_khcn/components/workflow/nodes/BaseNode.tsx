import React, { memo } from "react";
import { Handle, Position } from "@xyflow/react";
import { cn } from "@/lib/utils";

interface BaseNodeProps {
  children: React.ReactNode;
  label: string;
  icon?: React.ReactNode;
  selected?: boolean;
  className?: string;
  type: string;
}

export const BaseNode = ({
  children,
  label,
  icon,
  selected,
  className,
  type,
}: BaseNodeProps) => {
  return (
    <div
      className={cn(
        "min-w-[180px] rounded-xl border-2 bg-card p-0 shadow-lg transition-all duration-200",
        selected ? "border-primary ring-2 ring-primary/20" : "border-border/60 hover:border-border-foreground/40",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border/40 bg-muted/40 px-3 py-2 rounded-t-xl">
        <div className="flex h-6 w-6 items-center justify-center rounded-md bg-background shadow-sm">
          {icon}
        </div>
        <span className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {label}
        </span>
      </div>
      <div className="p-3">{children}</div>
      
      {/* Handles */}
      {type !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="h-2 w-2 border-2 border-background ring-2 ring-border"
        />
      )}
      {type !== "end" && (
        <Handle
          type="source"
          position={Position.Right}
          className="h-2 w-2 border-2 border-background ring-2 ring-border"
        />
      )}
    </div>
  );
};

export default memo(BaseNode);
