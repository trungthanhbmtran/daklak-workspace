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
        "group min-w-[240px] max-w-[380px] rounded-3xl border bg-white/80 dark:bg-black/60 backdrop-blur-2xl p-0 shadow-[0_8px_32px_rgba(0,0,0,0.06)] dark:shadow-[0_8px_32px_rgba(0,0,0,0.3)] transition-all duration-300 ease-out relative overflow-hidden",
        selected
          ? "border-primary/60 ring-4 ring-primary/10 shadow-[0_0_40px_rgba(var(--primary),0.2)] scale-[1.03]"
          : "border-white/40 dark:border-white/10 hover:border-primary/30 hover:shadow-xl",
        className
      )}
    >
      {/* Subtle top gradient glow */}
      <div className="absolute top-0 left-0 right-0 h-24 bg-gradient-to-b from-primary/5 to-transparent opacity-50 pointer-events-none" />

      <div className="flex items-center gap-3 border-b border-border/30 bg-muted/20 px-5 py-4 transition-colors group-hover:bg-muted/30 relative z-10">
        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-background shadow-sm border border-border/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300">
          {icon}
        </div>
        <span className="text-[12px] font-black uppercase tracking-[0.15em] text-foreground/85">
          {label}
        </span>
      </div>
      <div className="p-5 relative z-10">{children}</div>
      
      {/* Handles */}
      {type !== "start" && (
        <Handle
          type="target"
          position={Position.Left}
          className="h-7 w-7 -ml-3.5 border-[3px] border-background bg-slate-300 ring-2 ring-border/30 transition-all hover:scale-125 hover:bg-primary z-20 shadow-md"
        />
      )}
      {type !== "end" && !type.includes("gateway") && (
        <Handle
          type="source"
          position={Position.Right}
          className="h-7 w-7 -mr-3.5 border-[3px] border-background bg-primary ring-2 ring-primary/20 transition-all hover:scale-125 hover:shadow-[0_0_15px_rgba(var(--primary),0.6)] z-20 shadow-md"
        />
      )}
    </div>
  );
};

export default memo(BaseNode);
