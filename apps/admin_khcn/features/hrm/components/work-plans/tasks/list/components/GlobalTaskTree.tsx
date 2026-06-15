"use client";

import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, ChevronRight, PlusCircle,
  Clock, CheckCircle2, AlertTriangle, Circle, RotateCcw,
  Target, User, Users, Eye, ClipboardList
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { ROLE_META } from './TaskToolbar';

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string; dot: string }> = {
  TEMPLATE:    { label: 'Chờ giao',      icon: <Circle className="w-3.5 h-3.5" />,       cls: 'bg-slate-100/80 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  TODO:        { label: 'Chờ thực hiện', icon: <Clock className="w-3.5 h-3.5" />,        cls: 'bg-blue-50/80 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Đang thực hiện',icon: <RotateCcw className="w-3.5 h-3.5" />,   cls: 'bg-amber-50/80 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  REVIEWING:   { label: 'Chờ duyệt',     icon: <Clock className="w-3.5 h-3.5" />,        cls: 'bg-violet-50/80 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  DONE:        { label: 'Hoàn thành',    icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-emerald-50/80 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  OVERDUE:     { label: 'Quá hạn',       icon: <AlertTriangle className="w-3.5 h-3.5" />,cls: 'bg-rose-50/80 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  RETURNED:    { label: 'Trả lại',       icon: <RotateCcw className="w-3.5 h-3.5" />,   cls: 'bg-orange-50/80 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
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
  const isRoot = depth === 0;

  return (
    <div className="relative font-sans group/row">
      {/* Nét dọc nối sub-tasks cùng cấp */}
      {depth > 0 && !isLastChild && (
        <div className="absolute left-[-22px] top-[40px] bottom-[-16px] w-[2px] bg-indigo-100 dark:bg-slate-800" />
      )}

      {/* Row Card */}
      <div
        className={cn(
          'relative flex items-stretch gap-3 transition-all duration-300 rounded-lg cursor-pointer',
          isRoot 
            ? 'bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] p-4 my-4 hover:shadow-[0_8px_30px_-4px_rgba(0,0,0,0.1)] hover:border-indigo-300 dark:hover:border-indigo-500/50'
            : 'bg-slate-50/50 dark:bg-slate-800/40 border border-transparent hover:border-slate-200 dark:hover:border-slate-700 hover:bg-white dark:hover:bg-slate-800 p-3 my-2 shadow-sm'
        )}
        onClick={() => onSelectTask(task)}
      >
        {/* Nét ngang nối từ nét dọc của cha */}
        {depth > 0 && (
          <div className="absolute left-[-22px] top-[24px] flex items-center">
            <div className={cn(
              "w-[22px] border-b-[2px] border-indigo-200 dark:border-slate-700",
              isLastChild ? "h-[24px] border-l-[2px] absolute bottom-0 left-0" : "h-[2px] absolute"
            )} />
          </div>
        )}

        {/* Expand toggle */}
        <div className="flex flex-col items-center shrink-0 pt-1">
          <button
            className={cn(
              "w-7 h-7 rounded-full flex items-center justify-center transition-all duration-300 relative z-10",
              hasChildren 
                ? expanded 
                  ? "bg-indigo-100 text-indigo-600 hover:bg-indigo-200 dark:bg-indigo-900/50 dark:text-indigo-400" 
                  : "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700"
                : "bg-transparent text-slate-300 cursor-default"
            )}
            onClick={(e) => {
              if (!hasChildren) return;
              e.stopPropagation();
              setExpanded(v => !v);
            }}
          >
            {hasChildren
              ? (expanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />)
              : <div className={cn("w-2 h-2 rounded-full", statusCfg.dot)} />}
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                {roleBadge && (
                  <Badge variant="outline" className={cn('text-[11px] font-bold border-0 px-2 py-0.5 gap-1.5 shadow-sm', roleBadge.color)}>
                    {roleBadge.icon} {roleBadge.label}
                  </Badge>
                )}
                {task.priority === 'HIGH' && (
                  <Badge variant="outline" className="text-[10px] bg-rose-50 text-rose-600 border-rose-200 uppercase tracking-widest font-black">
                    🔴 Ưu tiên cao
                  </Badge>
                )}
                {hasChildren && (
                  <Badge variant="outline" className="text-[10px] bg-slate-100 text-slate-600 border-slate-200 gap-1 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700">
                    <ClipboardList className="w-3 h-3" />
                    {task.children.length} việc con
                  </Badge>
                )}
              </div>
              
              <h4 className={cn(
                'text-slate-800 dark:text-slate-100 leading-snug line-clamp-2 transition-colors group-hover/row:text-indigo-700 dark:group-hover/row:text-indigo-400',
                isRoot ? 'text-lg font-black' : 'text-sm font-bold'
              )}>
                {task.title}
              </h4>
              
              <div className="flex flex-wrap items-center gap-3 mt-2.5">
                <Badge variant="outline" className={cn('text-[11px] font-bold border px-2 py-0.5 gap-1.5 shadow-sm', statusCfg.cls)}>
                  {statusCfg.icon} {statusCfg.label}
                </Badge>

                {!isUnassigned ? (
                  <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 pl-1 pr-2.5 py-1 rounded-full border border-slate-200 dark:border-slate-700">
                    <div className="w-5 h-5 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-[10px] text-white font-bold shadow-inner">
                      {(task.assigneeName || task.assigneeCode).charAt(0).toUpperCase()}
                    </div>
                    <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate max-w-[150px]">
                      {task.assigneeName || task.assigneeCode}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center gap-1.5 bg-orange-50 dark:bg-orange-900/30 pl-2 pr-3 py-1 rounded-full border border-orange-200 dark:border-orange-800/50 text-orange-600 dark:text-orange-400">
                    <Target className="w-3.5 h-3.5" />
                    <span className="text-xs font-bold">Chưa phân công</span>
                  </div>
                )}

                {task.dueDate && (
                  <div className="flex items-center gap-1.5 text-xs font-medium text-slate-500 bg-white dark:bg-slate-900 px-2 py-1 rounded-md border border-slate-200 dark:border-slate-800">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </div>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-2 shrink-0 opacity-0 group-hover/row:opacity-100 transition-opacity duration-200">
              {canAssign && (
                <Button
                  size="sm"
                  className="h-9 px-4 text-xs font-bold bg-indigo-50 hover:bg-indigo-600 text-indigo-600 hover:text-white rounded-xl shadow-sm transition-colors border border-indigo-100 hover:border-transparent"
                  onClick={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                    onSmartAssign(task);
                  }}
                >
                  <Users className="w-3.5 h-3.5 mr-1.5" />
                  Phân công
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-task rows */}
      {expanded && hasChildren && (
        <div className={cn("ml-10 pl-2", isRoot && "ml-5 pl-2", "relative animate-in slide-in-from-top-2 fade-in duration-300")}>
          <div className="absolute left-[-14px] top-0 bottom-4 w-[2px] bg-indigo-100 dark:bg-slate-800" />
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
      <div className="flex flex-col items-center justify-center py-32 bg-white/50 dark:bg-slate-900/50 rounded-[2rem] border border-slate-100 dark:border-slate-800">
        <div className="relative mb-6">
          <div className="absolute inset-0 bg-indigo-500 blur-xl opacity-20 rounded-full animate-pulse" />
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-slate-100 border-t-indigo-600 relative z-10" />
        </div>
        <p className="text-slate-500 font-medium">Đang tải dữ liệu cấu trúc công việc...</p>
      </div>
    );
  }

  if (tree.length === 0) {
    return (
      <div className="text-center py-28 bg-white dark:bg-slate-900 rounded-[2rem] border border-dashed border-slate-200 dark:border-slate-800 shadow-sm">
        <div className="mx-auto w-24 h-24 bg-slate-50 dark:bg-slate-800 rounded-full flex items-center justify-center mb-6 text-4xl shadow-inner border border-slate-100 dark:border-slate-700">
          🌳
        </div>
        <h3 className="text-2xl font-black text-slate-800 dark:text-slate-100 mb-2">
          Cây công việc trống
        </h3>
        <p className="text-slate-500 text-sm max-w-sm mx-auto leading-relaxed">
          Không tìm thấy công việc nào phù hợp với bộ lọc hiện tại. Hãy thử thay đổi vai trò hoặc trạng thái.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-[2rem] border-0 sm:border border-slate-200/60 dark:border-slate-800 bg-transparent sm:bg-slate-50/30 dark:bg-slate-900/20 sm:p-6 p-2">
      <div className="flex items-center justify-between mb-4 pl-2">
        <h3 className="font-black text-slate-800 dark:text-slate-100 text-lg flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/50 flex items-center justify-center">
            <Target className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
          </div>
          Cấu trúc phân rã công việc
        </h3>
        <Badge variant="secondary" className="bg-white dark:bg-slate-800 text-slate-600 font-bold border-slate-200 shadow-sm">
          {tasks.length} hạng mục
        </Badge>
      </div>
      
      <div className="space-y-1">
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
