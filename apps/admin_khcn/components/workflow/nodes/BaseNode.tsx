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
        "group min-w-[220px] max-w-[350px] rounded-2xl border bg-card/90 backdrop-blur-md p-0 shadow-lg transition-all duration-300",
        selected
          ? "border-primary ring-1 ring-primary/30 shadow-[0_0_20px_rgba(var(--primary),0.25)] scale-[1.02]"
          : "border-border/60 hover:border-primary/40 hover:shadow-xl",
        className
      )}
    >
      <div className="flex items-center gap-2.5 border-b border-border/40 bg-muted/30 px-4 py-3 rounded-t-2xl transition-colors group-hover:bg-muted/50">
        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-background shadow-sm border border-border/50 group-hover:scale-110 transition-transform duration-300">
          {icon}
        </div>
        <span className="text-[11px] font-black uppercase tracking-widest text-foreground/80">
          {label}
        </span>
      </div>
      <div className="p-4">{children}</div>
      
      {/* Handles */}
      {type !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="h-6 w-6 -ml-3 border-2 border-background bg-slate-400 ring-2 ring-border/50 transition-all hover:scale-125 hover:bg-primary z-10"
        />
      )}
      {type !== "end" && !type.includes("gateway") && (
        <Handle
          type="source"
          position={Position.Right}
          className="h-6 w-6 -mr-3 border-2 border-background bg-primary ring-2 ring-primary/30 transition-all hover:scale-125 hover:shadow-[0_0_10px_rgba(var(--primary),0.5)] z-10"
        />
      )}
    </div>
  );
};

export default memo(BaseNode);
