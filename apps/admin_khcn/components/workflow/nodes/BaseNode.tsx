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
        "group min-w-[220px] max-w-[350px] rounded-lg border bg-card p-0 shadow-sm transition-all duration-200",
        selected
          ? "border-primary ring-1 ring-primary shadow-md"
          : "border-border hover:border-primary/50 hover:shadow-md",
        className
      )}
    >
      <div className="flex items-center gap-2 border-b border-border bg-muted/40 px-3 py-2 rounded-t-lg">
        <div className="flex h-6 w-6 shrink-0 items-center justify-center rounded bg-background shadow-sm border border-border">
          {icon}
        </div>
        <span className="text-[12px] font-bold text-foreground">
          {label}
        </span>
      </div>
      <div className="p-3">{children}</div>
      
      {/* Handles */}
      {type !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="h-4 w-4 -ml-2 border-2 border-background bg-slate-400 z-10"
        />
      )}
      {type !== "end" && !type.includes("gateway") && (
        <Handle
          type="source"
          position={Position.Right}
          className="h-4 w-4 -mr-2 border-2 border-background bg-primary z-10"
        />
      )}
    </div>
  );
};

export default memo(BaseNode);
