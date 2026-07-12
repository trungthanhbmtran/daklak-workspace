"use client";

import React, { useMemo } from 'react';
import { TASK_STATUS_CONFIG } from '@/components/shared/badges/TaskBadges';
import { Target, MessageSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskKanbanBoardProps {
  tasks: any[];
  isLoading?: boolean;
  onSelectTask: (task: any) => void;
  onSmartAssign?: (task: any) => void;
}

const COLUMNS = [
  { id: 'TODO', label: 'Cần làm', color: 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300' },
  { id: 'IN_PROGRESS', label: 'Đang thực hiện', color: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-300' },
  { id: 'PENDING_APPROVAL', label: 'Chờ nghiệm thu', color: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-300' },
  { id: 'DONE', label: 'Hoàn thành', color: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-300' },
];

export const TaskKanbanBoard = React.memo(function TaskKanbanBoard({
  tasks,
  isLoading,
  onSelectTask,
  onSmartAssign,
}: TaskKanbanBoardProps) {
  
  // Phân loại task vào các cột
  const columnsData = useMemo(() => {
    const data: Record<string, any[]> = { TODO: [], IN_PROGRESS: [], PENDING_APPROVAL: [], DONE: [] };
    
    tasks.forEach(task => {
      const status = task.status || 'TODO';
      if (data[status]) {
        data[status].push(task);
      } else {
        data['TODO'].push(task);
      }
    });
    
    return data;
  }, [tasks]);

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center min-h-[400px]">
        <div className="w-8 h-8 rounded-full border-4 border-muted border-t-indigo-600 animate-spin" />
      </div>
    );
  }

  if (tasks.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center min-h-[400px] text-center">
        <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mb-4 text-3xl">📋</div>
        <h3 className="text-base font-bold text-foreground mb-1">Không có công việc</h3>
        <p className="text-sm text-muted-foreground">Chưa có công việc nào trong danh sách này.</p>
      </div>
    );
  }

  return (
    <div className="flex-1 flex gap-4 overflow-x-auto h-full px-1 pb-4 hide-scrollbar">
      {COLUMNS.map(col => {
        const colTasks = columnsData[col.id];
        
        return (
          <div key={col.id} className="flex flex-col flex-shrink-0 w-[300px] bg-slate-50 dark:bg-slate-900/50 rounded-xl border border-slate-200 dark:border-slate-800 h-full max-h-full overflow-hidden">
            {/* Column Header */}
            <div className="p-3 border-b border-slate-200 dark:border-slate-800 flex justify-between items-center bg-white dark:bg-slate-900 sticky top-0 z-10 shrink-0">
              <div className="flex items-center gap-2">
                <span className={cn("px-2.5 py-0.5 rounded-full text-[11px] font-bold tracking-wider", col.color)}>
                  {col.label}
                </span>
                <span className="text-xs font-semibold text-muted-foreground">{colTasks.length}</span>
              </div>
            </div>

            {/* Column Body */}
            <div className="flex-1 overflow-y-auto p-2 space-y-2">
              {colTasks.map(task => {
                const isUnassigned = !task.assigneeCode || task.assigneeCode === 'UNASSIGNED';
                const hasChildren = task.children?.length > 0 || (task._count?.children || 0) > 0;
                
                return (
                  <div
                    key={task.id}
                    onClick={() => onSelectTask(task)}
                    className="bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md hover:border-indigo-300 dark:hover:border-indigo-700 transition-all cursor-pointer group flex flex-col gap-2"
                  >
                    <div className="flex justify-between items-start gap-2">
                      <p className="text-sm font-semibold text-foreground leading-tight line-clamp-3">
                        {task.title}
                      </p>
                    </div>

                    <div className="flex items-center justify-between mt-1 pt-2 border-t border-slate-100 dark:border-slate-700/50">
                      <div className="flex items-center gap-2">
                        {/* Avatar */}
                        <div
                          className={cn(
                            'w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ring-2 ring-background shrink-0',
                            isUnassigned ? 'bg-orange-100 text-orange-600' : 'bg-indigo-500 text-white'
                          )}
                          title={isUnassigned ? 'Chưa phân công' : task.assigneeName}
                        >
                          {isUnassigned ? <Target className="w-3 h-3" /> : (task.assigneeName || task.assigneeCode)?.charAt(0)}
                        </div>
                        
                        {isUnassigned && onSmartAssign && (
                          <button 
                            onClick={(e) => { e.stopPropagation(); onSmartAssign(task); }}
                            className="text-[10px] font-bold bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full hover:bg-amber-200"
                          >
                            Giao việc
                          </button>
                        )}
                      </div>

                      <div className="flex items-center gap-2 text-muted-foreground">
                        {hasChildren && (
                          <div className="flex items-center gap-1 text-[11px] font-medium bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-md">
                            <span className="opacity-70">↳</span>
                            {task._count?.children || task.children?.length || 0}
                          </div>
                        )}
                        {task.dueDate && (
                          <div className="text-[10px] font-medium opacity-80">
                            {new Date(task.dueDate).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
});
