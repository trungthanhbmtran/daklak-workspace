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

function TaskRow({ task, depth, currentUserCode, currentUserUnit, planId, onRefresh }: TaskRowProps) {
  const [expanded, setExpanded] = useState(depth < 2); // Mở 2 cấp đầu mặc định
  const [subTaskModalOpen, setSubTaskModalOpen] = useState(false);
  const [assignModalOpen, setAssignModalOpen] = useState(false);

  const hasChildren = task.children?.length > 0;

  // Quyền: Lấy từ backend cấp sẵn (nếu có), fallback về logic cơ bản nếu thiếu
  const permissions = task.permissions || {};
  const canEdit = permissions.canEdit ?? (currentUserCode === task.assignerCode || currentUserUnit === 1 || currentUserCode === task.assigneeCode);
  const canAssign = permissions.canAssign ?? canEdit;
  const canAddSubTask = permissions.canAddSubTask ?? canEdit;

  const statusCfg = STATUS_CONFIG[task.status] || STATUS_CONFIG.TODO;
  const depthCls = DEPTH_COLORS[Math.min(depth, DEPTH_COLORS.length - 1)];
  const indentPx = depth * 20;

  return (
    <>
      {/* Row */}
      <div
        className={cn(
          'group flex items-start gap-2 px-4 py-3 border-b border-slate-100 hover:bg-white/80 transition-colors rounded-sm',
          depth === 0 && depthCls,
        )}
        style={{ paddingLeft: `${16 + indentPx}px` }}
      >
        {/* Expand toggle */}
        <button
          className="mt-0.5 w-5 h-5 shrink-0 flex items-center justify-center text-slate-400 hover:text-slate-700"
          onClick={() => setExpanded(v => !v)}
        >
          {hasChildren
            ? (expanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />)
            : <span className="w-3.5 h-3.5 inline-block" />}
        </button>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <Badge className="text-[10px] bg-indigo-600 hover:bg-indigo-600 font-bold px-1.5 py-0">Nhiệm vụ Cấp {depth + 1}</Badge>
              </div>
              <p className={cn(
                'font-semibold text-slate-800 text-sm leading-snug',
                depth === 0 && 'text-base font-bold',
              )}>
                {task.title}
              </p>

              {/* Assignee + Status */}
              <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                <Badge variant="outline" className={cn('text-[10px] font-bold border px-1.5 py-0 gap-1', statusCfg.cls)}>
                  {statusCfg.icon} {statusCfg.label}
                </Badge>

                {task.assigneeCode && task.assigneeCode !== 'UNASSIGNED' ? (
                  <span className="text-xs text-slate-500 flex items-center gap-1">
                    <span className="w-4 h-4 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] text-indigo-700 font-bold">
                      {(task.assigneeName || task.assigneeCode).charAt(0).toUpperCase()}
                    </span>
                    {task.assigneeName || task.assigneeCode}
                  </span>
                ) : (
                  <span className="text-xs text-slate-400 italic">Chưa phân công</span>
                )}

                {task.dueDate && (
                  <span className="text-[11px] text-slate-400 flex items-center gap-0.5">
                    <Clock className="w-3 h-3" />
                    {new Date(task.dueDate).toLocaleDateString('vi-VN')}
                  </span>
                )}

                {task.children?.length > 0 && (
                  <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded border border-slate-200">
                    {task.children.length} nhiệm vụ con
                  </span>
                )}
              </div>
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1.5 shrink-0 transition-opacity">
              {canAddSubTask && (
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-3 text-[11px] font-bold text-violet-700 border-violet-200 hover:bg-violet-50 rounded-full gap-1 shadow-sm"
                  onClick={() => setSubTaskModalOpen(true)}
                >
                  <PlusCircle className="w-3.5 h-3.5" /> Thêm việc con
                </Button>
              )}

              {(!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                <Button
                  size="sm"
                  className="h-8 px-4 text-[11px] font-bold bg-indigo-600 hover:bg-indigo-700 text-white rounded-full gap-1 shadow-md shadow-indigo-200 animate-pulse-once"
                  onClick={() => setAssignModalOpen(true)}
                >
                  <UserCheck className="w-3.5 h-3.5" /> Giao việc ngay
                </Button>
              )}

              {task.assigneeCode && task.assigneeCode !== 'UNASSIGNED' && task.status !== 'DONE' && canAssign && (
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 px-2.5 text-[11px] text-slate-500 hover:text-slate-800 rounded-full gap-1"
                  onClick={() => setAssignModalOpen(true)}
                >
                  Chuyển giao
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Sub-task rows (đệ quy) */}
      {expanded && hasChildren && task.children.map((child: any) => (
        <TaskRow
          key={child.id}
          task={child}
          depth={depth + 1}
          currentUserCode={currentUserCode}
          planId={planId}
          onRefresh={onRefresh}
        />
      ))}

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
    </>
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
