"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  ChevronDown, ChevronRight, PlusCircle, UserCheck,
  Clock, CheckCircle2, AlertTriangle, Circle, RotateCcw
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { SubTaskModal } from './SubTaskModal';
import { TaskAssignModal } from './TaskAssignModal';

// ─── Utils ──────────────────────────────────────────────────────────────────

/** Build cây task từ flat list — không biết trước số cấp */
export function buildTaskTree(flatTasks: any[]): any[] {
  const map = new Map<string, any>();
  for (const t of flatTasks) {
    map.set(String(t.id), { ...t, children: [] });
  }
  const roots: any[] = [];
  for (const t of map.values()) {
    if (t.parentId && map.has(String(t.parentId))) {
      map.get(String(t.parentId))!.children.push(t);
    } else {
      roots.push(t);
    }
  }
  return roots;
}

const STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  TEMPLATE: { label: 'Chờ giao', icon: <Circle className="w-3 h-3" />, cls: 'bg-slate-100 text-slate-600 border-slate-200' },
  TODO: { label: 'Chờ thực hiện', icon: <Clock className="w-3 h-3" />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  IN_PROGRESS: { label: 'Đang thực hiện', icon: <RotateCcw className="w-3 h-3" />, cls: 'bg-amber-50 text-amber-700 border-amber-200' },
  REVIEWING: { label: 'Chờ duyệt', icon: <Clock className="w-3 h-3" />, cls: 'bg-violet-50 text-violet-700 border-violet-200' },
  DONE: { label: 'Hoàn thành', icon: <CheckCircle2 className="w-3 h-3" />, cls: 'bg-emerald-50 text-emerald-700 border-emerald-200' },
  OVERDUE: { label: 'Quá hạn', icon: <AlertTriangle className="w-3 h-3" />, cls: 'bg-red-50 text-red-700 border-red-200' },
  RETURNED: { label: 'Trả lại', icon: <RotateCcw className="w-3 h-3" />, cls: 'bg-orange-50 text-orange-700 border-orange-200' },
};

// Màu theo cấp (depth)
const DEPTH_COLORS = [
  'bg-indigo-50 border-l-2 border-l-indigo-400',
  'bg-violet-50 border-l-2 border-l-violet-400',
  'bg-sky-50 border-l-2 border-l-sky-400',
  'bg-teal-50 border-l-2 border-l-teal-400',
  'bg-slate-50 border-l-2 border-l-slate-300',
];

// ─── TaskRow ─────────────────────────────────────────────────────────────────

interface TaskRowProps {
  task: any;
  depth: number;
  currentUserCode: string;
  currentUserUnit?: number;
  planId: number;
  onRefresh: () => void;
}

const STATUS_COLORS: Record<string, string> = {
  TEMPLATE: 'bg-slate-300',
  TODO: 'bg-blue-500',
  IN_PROGRESS: 'bg-amber-500',
  REVIEWING: 'bg-violet-500',
  DONE: 'bg-emerald-500',
  OVERDUE: 'bg-red-500',
  RETURNED: 'bg-orange-500',
};

function TaskRow({ task, depth, currentUserCode, currentUserUnit, planId, onRefresh }: TaskRowProps) {
  const [expanded, setExpanded] = useState(depth < 2);
  const [subTaskModalOpen, setSubTaskModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const hasChildren = task.children?.length > 0;

  const permissions = task.permissions || {};
  const canEdit = permissions.canEdit ?? (currentUserCode === task.assignerCode || currentUserUnit === 1 || currentUserCode === task.assigneeCode);
  const canAssign = permissions.canAssign ?? canEdit;
  const canAddSubTask = permissions.canAddSubTask ?? canEdit;

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const statusColor = STATUS_COLORS[task.status] || STATUS_COLORS.TODO;
  const depthCls = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];

  return (
    <div className="relative">
      <div
        className={cn(
          'group flex items-center gap-2 pr-4 py-1.5 border-b border-slate-50 hover:bg-slate-50/80 transition-colors relative',
          depth === 0 && cn('px-4 py-2 border-b-slate-100', depthCls),
        )}
      >
        {depth > 0 && (
          <div className="absolute left-[-22px] top-1/2 -translate-y-1/2 flex items-center">
            <div className="w-[18px] h-px bg-slate-200"></div>
          </div>
        )}

        <button
          className="w-5 h-5 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-700 relative z-10 bg-white group-hover:bg-slate-50 rounded"
          onClick={() => setExpanded(v => !v)}
        >
          {hasChildren ? (
            expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />
          ) : (
            <span className="w-3.5 h-3.5 inline-block" />
          )}
        </button>

        <div className="flex-1 min-w-0 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2.5 min-w-0 flex-1">
            <span 
              className={cn("w-2 h-2 rounded-full shrink-0", statusColor)} 
              title={statusCfg.label}
            />
            <p className={cn(
              'text-sm truncate text-slate-700',
              depth === 0 ? 'font-bold text-slate-900' : 'font-medium',
              task.status === 'DONE' && 'text-slate-500 line-through opacity-70'
            )} title={task.title}>
              {task.title}
            </p>
            {task.children?.length > 0 && (
              <span className="text-[10px] text-slate-400 shrink-0">
                ({task.children.length})
              </span>
            )}
          </div>

          <div className="flex items-center gap-4 shrink-0">
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity">
              {canAddSubTask && (
                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-violet-600 hover:bg-violet-50" onClick={() => setSubTaskModalOpen(true)} title="Thêm việc con">
                  <PlusCircle className="w-3.5 h-3.5" />
                </Button>
              )}
              {(!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50" onClick={() => setAssignModalOpen(true)} title="Giao việc">
                  <UserCheck className="w-3.5 h-3.5" />
                </Button>
              )}
              {task.assigneeCode && task.assigneeCode !== 'UNASSIGNED' && task.status !== 'DONE' && canAssign && (
                <Button size="icon" variant="ghost" className="h-6 w-6 text-slate-400 hover:text-slate-700 hover:bg-slate-200" onClick={() => setAssignModalOpen(true)} title="Chuyển giao">
                  <RotateCcw className="w-3 h-3" />
                </Button>
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-slate-500 w-[180px] justify-end">
              {task.dueDate && (
                <span className={cn("flex items-center gap-1 shrink-0", task.status === 'OVERDUE' && 'text-red-500 font-medium')} title="Hạn chót">
                  <Clock className="w-3 h-3" />
                  {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                </span>
              )}
              
              {task.assigneeCode && task.assigneeCode !== 'UNASSIGNED' ? (
                <span className="flex items-center gap-1.5 truncate max-w-[100px]" title={task.assigneeName || task.assigneeCode}>
                  <span className="w-4 h-4 rounded-full bg-slate-100 border border-slate-200 flex items-center justify-center text-[9px] text-slate-600 font-bold shrink-0">
                    {(task.assigneeName || task.assigneeCode).charAt(0).toUpperCase()}
                  </span>
                  <span className="truncate">{task.assigneeName || task.assigneeCode}</span>
                </span>
              ) : (
                <span className="italic text-slate-400 truncate max-w-[100px]">Chưa giao</span>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-task rows (đệ quy) */}
      {expanded && hasChildren && (
        <div className={cn("ml-6 pl-6", depth === 0 && "ml-6 pl-6", "border-l border-slate-200")}>
          {task.children.map((child: any) => (
            <TaskRow
              key={child.id}
              task={child}
              depth={depth + 1}
              currentUserCode={currentUserCode}
              planId={planId}
              onRefresh={onRefresh}
            />
          ))}
        </div>
      )}

      {/* Modals */}
      <SubTaskModal
        isOpen={subTaskModalOpen}
        onClose={(created) => {
          setSubTaskModalOpen(false);
          if (created) onRefresh();
        }}
        parentTask={task}
        planId={planId}
      />

      <TaskAssignModal
        isOpen={assignModalOpen}
        task={task}
        onClose={(taskId) => {
          setAssignModalOpen(false);
          if (taskId) onRefresh();
        }}
      />
    </div>
  );
}

// ─── PlanTaskTree ─────────────────────────────────────────────────────────────

interface PlanTaskTreeProps {
  tasks: any[];        // Flat list từ API
  currentUserCode: string;
  planId: number;
  planCreatorUnit?: number;  // departmentId của kế hoạch
  currentUserUnit?: number;  // unitId của user hiện tại
  onAddRootTask?: () => void;
  onRefresh: () => void;
  isLoading?: boolean;
}

export function PlanTaskTree({
  tasks,
  currentUserCode,
  planId,
  planCreatorUnit,
  currentUserUnit,
  onAddRootTask,
  onRefresh,
  isLoading,
}: PlanTaskTreeProps) {
  const tree = buildTaskTree(tasks);

  // Bất kỳ ai truy cập được kế hoạch này đều có thể thêm đầu việc lớn (nếu có quyền tác vụ)
  const canAddRoot = true;

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
          <h3 className="font-bold text-slate-800 text-sm">Cây nhiệm vụ triển khai</h3>
          <p className="text-xs text-slate-500 mt-0.5">{tasks.length} nhiệm vụ · mọi cấp phân cấp</p>
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

      {/* Tree rows */}
      <div className="divide-y divide-slate-50">
        {tree.length === 0 ? (
          <div className="py-12 text-center text-slate-400 text-sm">
            <Circle className="w-8 h-8 mx-auto mb-2 opacity-30" />
            Chưa có nhiệm vụ nào. Thêm đầu việc để bắt đầu triển khai.
          </div>
        ) : (
          tree.map((task) => (
            <TaskRow
              key={task.id}
              task={task}
              depth={0}
              currentUserCode={currentUserCode}
              planId={planId}
              onRefresh={onRefresh}
            />
          ))
        )}
      </div>
    </div>
  );
}
