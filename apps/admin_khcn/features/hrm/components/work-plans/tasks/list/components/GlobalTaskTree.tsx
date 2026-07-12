"use client";

import React, { useState } from 'react';
import { ChevronDown, ChevronRight, Target, ClipboardList } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useTaskSubtasks } from '@/features/hrm/hooks/useTasks';
import { TASK_STATUS_CONFIG } from '@/components/shared/badges/TaskBadges';

interface TaskRowProps {
  task: any;
  depth: number;
  activeTaskId?: number;
  isLastChild?: boolean;
  onSelectTask: (task: any) => void;
}

const TaskRow = React.memo(function TaskRow({
  task,
  depth,
  activeTaskId,
  onSelectTask,
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
  const statusCfg = TASK_STATUS_CONFIG[task.status] || TASK_STATUS_CONFIG.TODO;
  const isUnassigned = !task.assigneeCode || task.assigneeCode === 'UNASSIGNED';
  const isActive = activeTaskId === task.id;

  return (
    <div className="relative font-sans">
      {depth > 0 && (
        <div
          className={cn(
            'absolute left-[-16px] top-[-4px] w-[2px] bg-border',
            isLastChild ? 'h-[24px]' : 'bottom-[-4px]',
          )}
        />
      )}

      <div
        className={cn(
          'relative flex items-center gap-2 transition-all duration-150 cursor-pointer group/row py-2 px-2 mx-1 rounded-lg',
          isActive
            ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-900 dark:text-indigo-100 font-medium'
            : 'hover:bg-muted/60 text-foreground',
          depth === 0 && !isActive ? 'border-b border-border/50 rounded-none' : ''
        )}
        onClick={() => onSelectTask(task)}
      >
        {depth > 0 && (
          <div className="absolute left-[-16px] top-[14px] w-[16px] h-[2px] bg-border" />
        )}

        <button
          className={cn(
            'w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-colors',
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
            expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <div className={cn('w-2 h-2 rounded-full', statusCfg.dot)} />
          )}
        </button>

        {/* Avatar */}
        <div
          className={cn(
            'w-6 h-6 rounded-full flex items-center justify-center shrink-0 text-[10px] font-bold border border-background',
            isUnassigned ? 'bg-orange-100 text-orange-600' : 'bg-indigo-500 text-white'
          )}
        >
          {isUnassigned ? <Target className="w-3 h-3" /> : (task.assigneeName || task.assigneeCode)?.charAt(0)}
        </div>

        {/* Title */}
        <div className="flex-1 min-w-0 pr-1">
          <p className={cn(
            'truncate text-[13px] leading-tight',
            isActive ? 'font-bold text-indigo-700 dark:text-indigo-400' : 'font-medium text-foreground'
          )}>
            {task.title}
          </p>
          {/* Trạng thái / Ngày (nếu màn hình hẹp thì hiện ngày nhỏ dưới tên) */}
          <div className="flex items-center gap-2 mt-0.5 opacity-60">
            <span className="text-[10px] font-semibold">{statusCfg.label}</span>
            {task.dueDate && (
              <>
                <span className="text-[10px]">•</span>
                <span className="text-[10px]">{new Date(task.dueDate).toLocaleDateString('vi-VN')}</span>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Sub-task rows */}
      {expanded && hasChildren && (
        <div className="ml-7 relative animate-in fade-in duration-200">
          {isLoadingSubtasks && (
            <div className="py-2 flex items-center gap-2 text-xs text-muted-foreground pl-2">
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
                activeTaskId={activeTaskId}
                onSelectTask={onSelectTask}
                isLastChild={index === displayChildren.length - 1}
              />
            ))}
        </div>
      )}
    </div>
  );
});

interface GlobalTaskTreeProps {
  tasks: any[];
  isLoading?: boolean;
  activeTaskId?: number;
  onSelectTask: (task: any) => void;
}

export const GlobalTaskTree = React.memo(function GlobalTaskTree({
  tasks,
  isLoading,
  activeTaskId,
  onSelectTask,
}: GlobalTaskTreeProps) {
  const tree = tasks || [];

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20">
        <div className="w-8 h-8 rounded-full border-4 border-muted border-t-indigo-600 animate-spin mb-3" />
        <p className="text-xs font-semibold text-muted-foreground">Đang tải công việc...</p>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center mb-3 text-2xl">
          📋
        </div>
        <h3 className="text-sm font-bold text-foreground">Trống</h3>
        <p className="text-xs text-muted-foreground mt-1">Không có công việc nào.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-background">
      <div className="flex-1 overflow-y-auto py-1 hide-scrollbar">
        {tree.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            depth={0}
            activeTaskId={activeTaskId}
            onSelectTask={onSelectTask}
            isLastChild={index === tree.length - 1}
          />
        ))}
      </div>
      {/* Footer info */}
      <div className="flex items-center gap-1.5 px-4 py-2 bg-muted/30 border-t border-border shrink-0">
        <ClipboardList className="w-3.5 h-3.5 text-muted-foreground" />
        <span className="text-[11px] font-semibold text-muted-foreground">
          {tree.length} công việc
        </span>
      </div>
    </div>
  );
});
