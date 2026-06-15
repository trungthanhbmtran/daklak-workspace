"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, ChevronRight, PlusCircle,
  Clock, CheckCircle2, AlertTriangle, Circle, RotateCcw,
  Target, User, Users, Eye
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_META } from './TaskToolbar';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  TEMPLATE:    { label: 'Chờ giao',      icon: <Circle className="w-3 h-3" />,       cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  TODO:        { label: 'Chờ thực hiện', icon: <Clock className="w-3 h-3" />,        cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Đang thực hiện',icon: <RotateCcw className="w-3 h-3" />,   cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  REVIEWING:   { label: 'Chờ duyệt',     icon: <Clock className="w-3 h-3" />,        cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  DONE:        { label: 'Hoàn thành',    icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OVERDUE:     { label: 'Quá hạn',       icon: <AlertTriangle className="w-3 h-3" />,cls: 'bg-red-50 text-red-700 border-red-200' },
  RETURNED:    { label: 'Trả lại',       icon: <RotateCcw className="w-3 h-3" />,   cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};

function getRoleBadge(task: any, currentUserCode: string) {
  if (task.assigneeCode === 'UNASSIGNED') {
    return { key: 'UNASSIGNED', ...ROLE_META.UNASSIGNED };
  }
  if (task.assigneeCode === currentUserCode) {
    return { key: 'ASSIGNEE', ...ROLE_META.ASSIGNEE };
  }
  if (task.assignerCode === currentUserCode || task.creatorEmployeeCode === currentUserCode) {
    return { key: 'OWNER', ...ROLE_META.OWNER };
  }
  if (task.supervisorCode === currentUserCode) {
    return { key: 'APPROVER', ...ROLE_META.APPROVER };
  }
  if (Array.isArray(task.coassigneeCodes) && task.coassigneeCodes.includes(currentUserCode)) {
    return { key: 'COORDINATOR', ...ROLE_META.COORDINATOR };
  }
  return null;
}

interface TaskRowProps {
  task: any;
  depth: number;
  currentUserCode: string;
  isLastChild?: boolean;
  onSelectTask: (task: any) => void;
  onSmartAssign: (task: any) => void;
}

function TaskRow({ task, depth, currentUserCode, onSelectTask, onSmartAssign, isLastChild }: TaskRowProps) {
  const [expanded, setExpanded] = useState(depth < 2);

  const hasChildren = task.children?.length > 0;
  const allowedActions = task.allowedActions || [];
  const canAssign = allowedActions.includes('ASSIGN');

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const isUnassigned = !task.assigneeCode || task.assigneeCode === 'UNASSIGNED';
  
  const roleBadge = getRoleBadge(task, currentUserCode);

  return (
    <div className="relative">
      {/* Nét dọc nối sub-tasks cùng cấp */}
      {depth > 0 && !isLastChild && (
        <div className="absolute left-[-16px] top-8 bottom-[-8px] w-px bg-slate-200/80" />
      )}

      {/* Row */}
      <div
        className={cn(
          'group flex items-start gap-2 pr-4 py-3 hover:bg-slate-50 transition-colors rounded-xl relative my-1 cursor-pointer border border-transparent hover:border-slate-200',
          depth === 0 && 'px-3 bg-white shadow-sm border-slate-100',
        )}
        onClick={() => onSelectTask(task)}
      >
        {/* Nét ngang nối từ nét dọc của cha */}
        {depth > 0 && (
          <div className="absolute left-[-16px] top-[24px] flex items-center">
            <div className={cn(
              "w-[16px] border-b-[1.5px] border-slate-300",
              isLastChild ? "h-[24px] border-l-[1.5px] rounded-bl-xl absolute bottom-0 left-0" : "h-px absolute"
            )} />
          </div>
        )}

        {/* Expand toggle */}
        <button
          className={cn(
            "mt-1 w-6 h-6 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-800 relative z-10 rounded transition-colors",
            hasChildren ? "hover:bg-slate-200/50" : ""
          )}
          onClick={(e) => {
            e.stopPropagation();
            setExpanded(v => !v);
          }}
        >
          {hasChildren
            ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
            : <span className="w-1.5 h-1.5 rounded-full bg-slate-200/50 inline-block" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                {roleBadge && (
                  <Badge variant="outline" className={cn('text-[10px] font-bold border-0 px-1.5 py-0.5 gap-1', roleBadge.color)}>
                    {roleBadge.icon} {roleBadge.label}
                  </Badge>
                )}
                {task.priority === 'HIGH' && (
                  <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-600 border-rose-200">🔴 Ưu tiên cao</Badge>
                )}
              </div>
              
              <p className={cn(
                'font-semibold text-slate-800 text-sm mb-2',
                depth === 0 && 'text-base font-bold',
              )}>
                {task.title}
              </p>

              <div className="flex items-center gap-3 mt-1 flex-wrap">
                <Badge variant="outline" className={cn('text-[10px] font-bold border px-1.5 py-0.5 gap-1', statusCfg.cls)}>
                  {statusCfg.icon} {statusCfg.label}
                </Badge>

                {!isUnassigned ? (
                  <span className="text-xs text-slate-600 flex items-center gap-1.5 bg-slate-100 px-2 py-0.5 rounded-full">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] text-indigo-700 font-bold">
                      {(task.assigneeName || task.assigneeCode).charAt(0).toUpperCase()}
                    </span>
                    {task.assigneeName || task.assigneeCode}
                  </span>
                ) : (
                  <span className="text-xs text-orange-600 bg-orange-50 px-2 py-0.5 rounded-full font-semibold flex items-center gap-1">
                    <Target className="w-3 h-3" />
                    Chưa phân công
                  </span>
                )}

                {task.dueDate && (
                  <span className="text-[11px] text-slate-500 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}

                {hasChildren && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    {task.children.length} việc con
                  </span>
                )}
              </div>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              {canAssign && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-8 px-4 text-xs font-bold text-indigo-600 bg-indigo-50 hover:bg-indigo-100 hover:text-indigo-700 rounded-full relative z-10"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSmartAssign(task);
                  }}
                >
                  Phân công
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-task rows (đệ quy) */}
      {expanded && hasChildren && (
        <div className={cn("ml-8 pl-4", depth === 0 && "ml-4 pl-4", "relative")}>
          <div className="absolute left-[-8px] top-0 bottom-4 w-[1.5px] bg-slate-200" />
          {task.children.map((child: any, index: number) => (
            <TaskRow
              key={child.id}
              task={child}
              depth={depth + 1}
              currentUserCode={currentUserCode}
              onSelectTask={onSelectTask}
              onSmartAssign={onSmartAssign}
              isLastChild={index === task.children.length - 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}

interface GlobalTaskTreeProps {
  tasks: any[];
  currentUserCode: string;
  isLoading?: boolean;
  onSelectTask: (task: any) => void;
  onSmartAssign: (task: any) => void;
}

export function GlobalTaskTree({
  tasks,
  currentUserCode,
  isLoading,
  onSelectTask,
  onSmartAssign,
}: GlobalTaskTreeProps) {
  
  // Build tree from flat tasks
  const tree = useMemo(() => {
    if (!tasks || tasks.length === 0) return [];
    
    // Deep copy to avoid mutating original
    const flatTasks = JSON.parse(JSON.stringify(tasks));
    const taskMap = new Map();
    flatTasks.forEach((t: any) => {
      taskMap.set(t.id, { ...t, children: [] });
    });

    const roots: any[] = [];
    taskMap.forEach(task => {
      if (task.parentId && taskMap.has(task.parentId)) {
        taskMap.get(task.parentId).children.push(task);
      } else {
        roots.push(task);
      }
    });
    return roots;
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-400">
        <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mb-4" />
        Đang tải dữ liệu công việc...
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="text-center py-20 bg-slate-50 dark:bg-slate-900 rounded-3xl border border-dashed border-slate-200 dark:border-slate-800">
        <div className="mx-auto w-20 h-20 bg-slate-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 text-2xl">
          🌳
        </div>
        <h3 className="text-xl font-bold text-slate-700 dark:text-slate-300">
          Chưa có công việc nào
        </h3>
        <p className="text-slate-500 mt-2 text-sm max-w-md mx-auto">
          Không tìm thấy công việc nào phù hợp với bộ lọc hiện tại.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-2 sm:p-4 overflow-hidden shadow-sm">
      <div className="flex items-center justify-between px-2 pb-3 mb-2 border-b border-slate-200">
        <h3 className="font-bold text-slate-800 text-sm">Cấu trúc công việc liên quan</h3>
      </div>
      <div className="divide-y divide-slate-100">
        {tree.map((task, index) => (
          <TaskRow
            key={task.id}
            task={task}
            depth={0}
            currentUserCode={currentUserCode}
            onSelectTask={onSelectTask}
            onSmartAssign={onSmartAssign}
            isLastChild={index === tree.length - 1}
          />
        ))}
      </div>
    </div>
  );
}
