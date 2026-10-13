"use client";

import { memo } from "react";
import { Handle, Position, type NodeProps } from "@xyflow/react";
import {
  getNodeRoleInfo,
  extractFormBadge,
  NODE_LABELS,
  type CanvasNode,
} from "../utils/workflow-graph-utils";

export const WorkflowNodeCard = memo(function WorkflowNodeCard({
  id,
  data,
  type,
  selected,
}: NodeProps<CanvasNode>) {
  const isGateway = type?.toLowerCase().includes("gateway") ?? false;
  const isService = type?.toLowerCase().includes("service") ?? false;
  const isStart = type === "start";
  const isEnd = type === "end";

  const inputHandles = (data.inputHandles ?? []).filter(Boolean) as string[];
  const outputHandles = (data.outputHandles ?? []).filter(Boolean) as string[];

  const roleInfo = getNodeRoleInfo(id, type, data);
  const formBadge = extractFormBadge(
    data.label,
    typeof data.description === "string" ? data.description : undefined,
    data.formSchema
  );

  const tone = isStart
    ? "border-emerald-400 bg-emerald-50/90 dark:border-emerald-600 dark:bg-emerald-950/40"
    : isEnd
    ? "border-slate-400 bg-slate-100/90 dark:border-slate-600 dark:bg-slate-800/60"
    : isGateway
    ? "border-amber-400 bg-amber-50/90 dark:border-amber-600 dark:bg-amber-950/40"
    : isService
    ? "border-cyan-400 bg-cyan-50/90 dark:border-cyan-600 dark:bg-cyan-950/40"
    : "border-primary/30 bg-card/95";

  return (
    <div
      className={`min-w-48 max-w-64 rounded-xl border-2 p-3 shadow-md backdrop-blur-xs transition-all ${tone} ${
        selected ? "ring-2 ring-primary ring-offset-2 scale-[1.02] shadow-lg" : "hover:shadow-md"
      }`}
    >
      {/* ===================== TARGET HANDLES (ĐIỂM NỐI ĐẾN) ===================== */}
      {type !== "start" && (
        <>
          <Handle
            id="target-top"
            type="target"
            position={Position.Top}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          <Handle
            id="target-bottom"
            type="target"
            position={Position.Bottom}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          <Handle
            id="target-left"
            type="target"
            position={Position.Left}
            className="!size-3 !border-2 !border-background !bg-primary hover:scale-125 transition-transform"
          />
          {inputHandles.map((handleId, index) => {
            if (handleId === "target-left" || handleId === "target-top" || handleId === "target-bottom") return null;
            return (
              <Handle
                key={handleId}
                id={handleId}
                type="target"
                position={Position.Left}
                style={{ top: `${((index + 1) / (inputHandles.length + 1)) * 100}%` }}
                className="!size-3 !border-2 !border-background !bg-primary"
              />
            );
          })}
        </>
      )}

      {/* ===================== HEADER: BADGE THẨM QUYỀN & MẪU BIỂU ===================== */}
      <div className="flex flex-wrap items-center justify-between gap-1 border-b border-border/50 pb-1.5">
        <span
          className={`inline-flex items-center rounded-xs border px-1.5 py-0 text-[9px] font-semibold tracking-wider ${roleInfo.badgeClass}`}
        >
          {roleInfo.label}
        </span>
        {formBadge && (
          <span className="inline-flex items-center rounded-xs border border-teal-300 bg-teal-500/10 px-1 py-0 text-[9px] font-mono font-medium text-teal-700 dark:text-teal-300">
            {formBadge}
          </span>
        )}
      </div>

      {/* ===================== TIÊU ĐỀ BƯỚC ===================== */}
      <p className="mt-1.5 min-w-0 whitespace-normal break-words [overflow-wrap:anywhere] text-xs font-semibold leading-snug text-foreground">
        {data.label || NODE_LABELS[type ?? ""] || "Bước mới"}
      </p>

      {/* ===================== MÔ TẢ TÓM TẮT ===================== */}
      {typeof data.description === "string" && data.description.trim() && (
        <p className="mt-1 min-w-0 line-clamp-2 text-[10px] leading-tight text-muted-foreground break-words">
          {data.description}
        </p>
      )}

      {/* ===================== SOURCE HANDLES (ĐIỂM NỐI ĐI) ===================== */}
      {type !== "end" && (
        <>
          <Handle
            id="source-top"
            type="source"
            position={Position.Top}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          <Handle
            id="source-bottom"
            type="source"
            position={Position.Bottom}
            className="!size-2.5 !border-2 !border-background !bg-primary opacity-80 hover:opacity-100"
          />
          <Handle
            id="source-right"
            type="source"
            position={Position.Right}
            className="!size-3 !border-2 !border-background !bg-primary hover:scale-125 transition-transform"
          />
          {outputHandles.map((handleId, index) => {
            if (handleId === "source-right" || handleId === "source-top" || handleId === "source-bottom") return null;
            return (
              <Handle
                key={handleId}
                id={handleId}
                type="source"
                position={Position.Right}
                style={{ top: `${((index + 1) / (outputHandles.length + 1)) * 100}%` }}
                className="!size-3 !border-2 !border-background !bg-primary"
              />
            );
          })}
        </>
      )}
    </div>
  );
});
