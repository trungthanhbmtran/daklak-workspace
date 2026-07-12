"use client";

import React, { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  ChevronDown, ChevronRight,
  MoreHorizontal, Target, History, Eye,
  ClipboardList,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskSubtasks } from '@/features/hrm/hooks/useTasks';
import {
  TaskStatusBadge,
  TaskPriorityBadge,
  TASK_STATUS_CONFIG,
} from '@/components/shared/badges/TaskBadges';
import { WorkflowStatusBadge } from '@/components/workflow/shared/WorkflowStatusBadge';
import { useCategoryMap, TASK_WORKFLOW_ACTION_FALLBACK, WORKFLOW_STEP_ACTIONS } from '@/features/hrm/hooks/useCategoryMaps';

// ─── Types ────────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: any;
  depth: number;
  indexSequence: string;
  isLastChild?: boolean;
  onSelectTask: (task: any) => void;
  onSelectTaskHistory?: (task: any) => void;
  onSmartAssign: (task: any) => void;
}

// ─── TaskRow — memoized, đơn giản hóa ────────────────────────────────────────

const TaskRow = React.memo(function TaskRow({
  task,
  depth,
  indexSequence,
  onSelectTask,
  onSelectTaskHistory,
  onSmartAssign,
  isLastChild,
}: TaskRowProps) {
  const [expanded, setExpanded] = useState(false);

  const hasLoadedChildren = task.children?.length > 0;
  const countChildren = task._count?.children || 0;
  const hasChildren = hasLoadedChildren || countChildren > 0;

  const shouldFetchSubtasks = expanded && hasChildren && !hasLoadedChildren;
  const { data: subtasksResponse, isLoading: isLoadingSubtasks } = useTaskSubtasks(
    shouldFetchSubtasks ? task.id : undefined,
  );

  const displayChildren = hasLoadedChildren ? task.children : (subtasksResponse?.data || []);
  const allowedActions = task.allowedActions || [];
  const canAssign = allowedActions.includes('ASSIGN');

  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;
  const isUnassigned = !task.assigneeCode || task.assigneeCode === 'UNASSIGNED';
  const isRoot = depth === 0;

  // Label bước workflow hiện tại
  const workflowActionLabels = useCategoryMap('TASK_WORKFLOW_ACTION');
  const WORKFLOW_STEP_LABELS = { ...TASK_WORKFLOW_ACTION_FALLBACK, ...workflowActionLabels };
  const currentWorkflowAction = (task.allowedActions as string[] || []).find(
    (a) => (WORKFLOW_STEP_ACTIONS as readonly string[]).includes(a),
  );

  // Ngày hết hạn định dạng ngắn (dd/mm)
  const dueDateShort = task.dueDate
    ? new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })
    : null;

  const isOverdue =
    task.dueDate &&
    !['DONE', 'PENDING_APPROVAL'].includes(task.status) &&
    new Date(task.dueDate) < new Date();

  return (
    <div className="relative font-sans">
      {/* Nét dọc nối sub-tasks */}
      {depth > 0 && (
        <div
          className={cn(
            'absolute left-[-20px] top-[-4px] w-[2px] bg-border',
            isLastChild ? 'h-[28px]' : 'bottom-[-4px]',
          )}
        />
      )}

      {/* ── Row Card ─────────────────────────────────────────────────────────── */}
      <div
        className={cn(
          'relative flex items-center gap-2 transition-all duration-150 rounded-lg cursor-pointer group/row',
          isRoot
            ? 'bg-card border border-border hover:border-primary/40 hover:shadow-sm px-3 py-2.5 my-2'
            : 'hover:bg-muted/60 px-2 py-2 my-0.5',
        )}
        onClick={() => onSelectTask(task)}
      >
        {/* Nét ngang nối */}
        {depth > 0 && (
          <div className="absolute left-[-20px] top-[14px] w-[20px] h-[2px] bg-border" />
        )}

        {/* ── Expand toggle ── */}
        <button
          className={cn(
            'w-6 h-6 rounded-md flex items-center justify-center shrink-0 transition-colors',
            hasChildren
              ? 'hover:bg-muted text-muted-foreground hover:text-foreground'
              : 'cursor-default',
          )}
          onClick={(e) => {
            if (!hasChildren) return;
            e.stopPropagation();
            setExpanded((v) => !v);
          }}
        >
          {hasChildren ? (
            expanded ? (
              <ChevronDown className="w-3.5 h-3.5" />
            ) : (
              <ChevronRight className="w-3.5 h-3.5" />
            )
          ) : (
            <div className={cn('w-2 h-2 rounded-full', statusCfg.dot)} />
          )}
        </button>

        {/* ── Index ── */}
        <span className="text-[11px] text-muted-foreground font-mono shrink-0 w-6 text-right select-none">
          {indexSequence}
        </span>

        {/* ── Title + workflow chip ── */}
        <div className="flex-1 min-w-0 flex items-center gap-2">
          <p
            className={cn(
              'truncate text-foreground leading-snug font-semibold',
              isRoot ? 'text-[14px]' : 'text-[13px] font-medium',
            )}
          >
            {task.title}
          </p>

          {/* Workflow step chip — chỉ hiện khi có */}
          {task.workflowInstId && currentWorkflowAction && (
            <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-900/30 border border-indigo-100 dark:border-indigo-800 text-indigo-600 dark:text-indigo-400 text-[10px] font-bold shrink-0 whitespace-nowrap">
              <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
              {WORKFLOW_STEP_LABELS[currentWorkflowAction] ?? 'Đang xử lý'}
            </span>
          )}

          {/* Chưa phân công badge */}
          {isUnassigned && (
            <span className="hidden md:inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-orange-50 dark:bg-orange-900/30 border border-orange-200 dark:border-orange-800 text-orange-600 dark:text-orange-400 text-[10px] font-bold shrink-0">
              <Target className="w-2.5 h-2.5" />
              Chưa phân công
            </span>
          )}
        </div>

        {/* ── Right side info ── */}
        <div className="flex items-center gap-2 shrink-0">
          {/* Priority (chỉ khi HIGH) */}
          {task.priority === 'HIGH' && (
            <span className="hidden sm:inline text-[10px] font-bold text-rose-600 dark:text-rose-400">
              🔴
            </span>
          )}

          {/* Status badge */}
          {task.workflowInstId ? (
            <WorkflowStatusBadge status={task.status} showIcon={false} className="text-[10px] px-2 py-0.5" />
          ) : (
            <TaskStatusBadge code={task.status} className="text-[10px] px-2 py-0.5" />
          )}

          {/* Assignee avatar */}
          {!isUnassigned && (
            <div
              className="w-6 h-6 rounded-full bg-indigo-500 text-white text-[9px] font-bold flex items-center justify-center shrink-0 ring-2 ring-background"
              title={task.assigneeName || task.assigneeCode}
            >
              {(task.assigneeName || task.assigneeCode)?.charAt(0)?.toUpperCase()}
            </div>
          )}

          {/* Co-assignees count */}
          {task.coassigneeNames?.length > 0 && (
            <span className="text-[10px] text-muted-foreground hidden md:block">
              +{task.coassigneeNames.length}
            </span>
          )}

          {/* Due date */}
          {dueDateShort && (
            <span
              className={cn(
                'text-[11px] font-medium tabular-nums hidden sm:block',
                isOverdue ? 'text-rose-600 dark:text-rose-400' : 'text-muted-foreground',
              )}
            >
              {isOverdue && '⚠️'} {dueDateShort}
            </span>
          )}

          {/* Children count */}
          {hasChildren && (
            <span className="text-[10px] text-muted-foreground hidden xl:block">
              {hasLoadedChildren ? task.children.length : countChildren}↳
            </span>
          )}

          {/* ── Action dropdown ── */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="w-7 h-7 rounded-md flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity hover:bg-muted shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                <MoreHorizontal className="w-4 h-4 text-muted-foreground" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuItem onClick={() => onSelectTask(task)}>
                <Eye className="w-4 h-4 mr-2 text-indigo-500" />
                Xem chi tiết
              </DropdownMenuItem>
              {canAssign && (
                <DropdownMenuItem
                  onClick={(e) => {
                    e.stopPropagation();
                    onSmartAssign(task);
                  }}
                >
                  <Target className="w-4 h-4 mr-2 text-amber-500" />
                  Giao việc
                </DropdownMenuItem>
              )}
              {onSelectTaskHistory && task.workflowInstId && (
                <>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectTaskHistory(task);
                    }}
                  >
                    <History className="w-4 h-4 mr-2 text-slate-500" />
                    Xem lịch sử
                  </DropdownMenuItem>
                </>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      {/* ── Sub-task rows ── */}
      {expanded && hasChildren && (
        <div className={cn('ml-8 pl-1 relative animate-in slide-in-from-top-1 fade-in duration-200')}>
          {isLoadingSubtasks && (
            <div className="py-1.5 flex items-center gap-2 text-xs text-muted-foreground pl-2">
              <div className="w-3 h-3 rounded-full border-2 border-indigo-500 border-t-transparent animate-spin" />
              Đang tải...
            </div>
          )}
          {!isLoadingSubtasks &&
            displayChildren.map((child: any, index: number) => (
              <TaskRow
                key={child.id}
                task={child}
                depth={depth + 1}
                indexSequence={`${indexSequence}.${index + 1}`}
                onSelectTask={onSelectTask}
                onSelectTaskHistory={onSelectTaskHistory}
                onSmartAssign={onSmartAssign}
                isLastChild={index === displayChildren.length - 1}
              />
            ))}
        </div>
      )}
    </div>
  );
});

// ─── GlobalTaskTree ───────────────────────────────────────────────────────────

interface GlobalTaskTreeProps {
  tasks: any[];
  isLoading?: boolean;
  onSelectTask: (task: any) => void;
  onSelectTaskHistory?: (task: any) => void;
  onSmartAssign: (task: any) => void;
}

export const GlobalTaskTree = React.memo(function GlobalTaskTree({
  tasks,
  isLoading,
  onSelectTask,
  onSelectTaskHistory,
  onSmartAssign,
}: GlobalTaskTreeProps) {
  const tree = tasks || [];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 rounded-full border-4 border-muted border-t-indigo-600 animate-spin" />
          <p className="text-sm text-muted-foreground">Đang tải danh sách công việc...</p>
        </div>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-3xl">
          📋
        </div>
        <h3 className="text-base font-bold text-foreground mb-1">Không có công việc</h3>
        <p className="text-sm text-muted-foreground max-w-xs">
          Không tìm thấy công việc phù hợp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-0">
      {/* Header row */}
      <div className="flex items-center gap-2 px-3 py-1.5 text-[10px] font-black text-muted-foreground uppercase tracking-widest border-b border-border mb-1">
        <div className="w-6 h-4 shrink-0" />
        <div className="w-6 h-4 shrink-0" />
        <div className="flex-1">Tên công việc</div>
        <div className="flex items-center gap-2 shrink-0 pr-9">
          <span className="hidden sm:block w-20 text-center">Trạng thái</span>
          <span className="w-8 text-center">Người</span>
          <span className="hidden sm:block w-12 text-center">Hạn</span>
        </div>
      </div>

      {tree.map((task, index) => (
        <TaskRow
          key={task.id}
          task={task}
          depth={0}
          indexSequence={`${index + 1}`}
          onSelectTask={onSelectTask}
          onSelectTaskHistory={onSelectTaskHistory}
          onSmartAssign={onSmartAssign}
          isLastChild={index === tree.length - 1}
        />
      ))}

      {/* Footer info */}
      <div className="flex items-center gap-2 px-3 py-2 mt-1 border-t border-border">
        <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] text-muted-foreground">
          {tree.length} công việc đang hiển thị
        </span>
      </div>
    </div>
  );
});
