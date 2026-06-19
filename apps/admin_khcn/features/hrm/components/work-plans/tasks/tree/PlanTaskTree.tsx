"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, ChevronRight, PlusCircle,
  Clock, CheckCircle2, AlertTriangle, Circle, RotateCcw,
  Info
} from 'lucide-react';
import { cn } from '@/lib/utils';

// ─── Status Config ────────────────────────────────────────────────────────────

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  TEMPLATE:    { label: 'Chờ giao',      icon: <Circle className="w-3 h-3" />,       cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  TODO:        { label: 'Chờ thực hiện', icon: <Clock className="w-3 h-3" />,        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Đang thực hiện',icon: <RotateCcw className="w-3 h-3" />,   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  REVIEWING:   { label: 'Chờ duyệt',     icon: <Clock className="w-3 h-3" />,        cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  DONE:        { label: 'Hoàn thành',    icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OVERDUE:     { label: 'Quá hạn',       icon: <AlertTriangle className="w-3 h-3" />,cls: 'bg-red-50 text-red-700 border-red-200' },
  RETURNED:    { label: 'Trả lại',       icon: <RotateCcw className="w-3 h-3" />,   cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};

// ─── TaskRow ──────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: any;
  depth: number;
  planId: number;
  indexSequence: string;
  isLastChild?: boolean;
  onRequestAssign: (task: any) => void;
}

function TaskRow({ task, depth, planId, indexSequence, onRequestAssign, isLastChild }: TaskRowProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  const hasChildren = task.children?.length > 0;
  const allowedActions = task.allowedActions || [];
  const canAssign = allowedActions.includes('ASSIGN');

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const isUnassigned = !task.assigneeCode || task.assigneeCode === 'UNASSIGNED';

  return (
    <div className="relative">
      {/* Nét dọc nối sub-tasks liên tục */}
      {depth > 0 && (
        <div className={cn(
          "absolute left-[-16px] top-[-4px] w-[1.5px] bg-slate-300",
          isLastChild ? "h-[24px]" : "bottom-[-4px]"
        )} />
      )}

      {/* Row */}
      <div
        className={cn(
          'group flex items-start gap-2 pr-4 py-2 hover:bg-slate-50/80 transition-colors rounded-md relative my-0.5',
          depth === 0 && 'px-2',
        )}
      >
        {/* Nét ngang nối từ nét dọc của cha */}
        {depth > 0 && (
          <div className="absolute left-[-16px] top-[20px] w-[16px] h-[1.5px] bg-slate-300" />
        )}

        {/* Expand toggle */}
        <button
          className={cn(
            "mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-800 relative z-10 rounded transition-colors",
            hasChildren ? "hover:bg-slate-200/50" : ""
          )}
          onClick={() => setExpanded(v => !v)}
        >
          {hasChildren
            ? (expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)
            : <span className="w-1.5 h-1.5 rounded-full bg-slate-200/50 inline-block" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 min-w-0">
              <p className={cn(
                'font-semibold text-slate-800 text-sm truncate flex items-center gap-1',
                depth === 0 && 'text-sm font-bold',
              )}>
                <span className="text-indigo-600 font-bold">{indexSequence}</span> {task.title}
              </p>

              <div className="flex items-center gap-2 mt-1 flex-wrap">
                <Badge variant="outline" className={cn('text-[10px] font-bold border px-1.5 py-0 gap-1', statusCfg.cls)}>
                  {statusCfg.icon} {statusCfg.label}
                </Badge>

                {!isUnassigned ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] text-indigo-700 font-bold">
                      {(task.assigneeName || task.assigneeCode).charAt(0).toUpperCase()}
                    </span>
                    {task.assigneeName || task.assigneeCode}
                  </span>
                ) : (
                  <span className="text-xs text-amber-500 italic font-medium">Chưa phân công</span>
                )}

                {task.dueDate && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}

                {hasChildren && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    {task.children.length} việc con (cấp dưới tự xây dựng)
                  </span>
                )}
              </div>
            </div>

            {canAssign && (
              <Button
                size="sm"
                variant="ghost"
                className="h-7 px-3 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-full shrink-0 relative z-10"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  onRequestAssign(task);
                }}
              >
                Giao việc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Sub-task rows (đệ quy) — hiển thị để xem, không có action */}
      {expanded && hasChildren && (
        <div className={cn("ml-8 pl-4", depth === 0 && "ml-4 pl-4", "relative")}>
          {task.children.map((child: any, index: number) => (
            <TaskRow
              key={child.id}
              task={child}
              depth={depth + 1}
              planId={planId}
              indexSequence={`${indexSequence}.${index + 1}`}
              onRequestAssign={onRequestAssign}
              isLastChild={index === task.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

// ─── PlanTaskTree ─────────────────────────────────────────────────────────────

interface PlanTaskTreeProps {
  tasks: any[];
  planId: number;
  canAddRoot?: boolean;
  onAddRootTask?: () => void;
  onRefresh?: () => void;
  isLoading?: boolean;
  /** Callback giao việc — MasterPlanDetail truyền vào để mở SmartAssignDrawer dùng chung */
  onRequestAssign?: (task: any) => void;
}

export function PlanTaskTree({
  tasks,
  planId,
  canAddRoot = false,
  onAddRootTask,
  isLoading,
  onRequestAssign,
}: PlanTaskTreeProps) {
  const tree = tasks || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-16 text-slate-400">
        <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-indigo-500 rounded-full mr-2" />
        Đang tải...
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white overflow-hidden shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-slate-50/80 border-b border-slate-100">
        <div>
          <h3 className="font-bold text-slate-800 text-sm">Cấu trúc đầu việc — Kế hoạch</h3>
          <p className="text-xs text-slate-500 mt-0.5">
            {tree.length} đầu việc cấp 1 · Sub-task do người được giao tự xây dựng
          </p>
        </div>
        {canAddRoot && onAddRootTask && (
          <Button
            size="sm"
            onClick={onAddRootTask}
            className="h-9 px-4 text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full gap-1.5 shadow-md shadow-indigo-200"
          >
            <PlusCircle className="w-4 h-4" /> Thêm đầu việc lớn
          </Button>
        )}
      </div>

      {/* Context hint */}
      <div className="flex items-center gap-2 px-4 py-2 bg-amber-50/60 border-b border-amber-100 text-[11px] text-amber-700 font-semibold">
        <Info className="w-3.5 h-3.5 shrink-0" />
        Sau khi giao việc, người nhận sẽ tự xây dựng kế hoạch thực hiện chi tiết trong tab &quot;Việc của tôi&quot;
      </div>

      {/* Tree rows */}
      <div className="divide-y divide-slate-50/50 p-2">
        {tree.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Circle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Chưa có đầu việc nào. Thêm đầu việc lớn để bắt đầu kế hoạch.
          </div>
        ) : (
          tree.map((task, index) => (
            <TaskRow
              key={task.id}
              task={task}
              depth={0}
              planId={planId}
              indexSequence={`${index + 1}`}
              onRequestAssign={onRequestAssign || (() => {})}
              isLastChild={index === tree.length - 1}
            />
          ))
        )}
      </div>
    </div>
  );
}
