'use client';

import React, { memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { UserCheck, CheckCircle2, Target, BarChart3 } from 'lucide-react';
import { getStatusBadge, getPriorityColor, getPriorityName, getDueDateDisplay } from '../utils';
import type { TaskTab } from './TaskToolbar';

interface TaskGridProps {
  tasks: any[];
  priorities: any[];
  taskStatusCategories?: any[];
  /** Tab hiện tại — xác định action nào hiển thị */
  context: TaskTab;
  onSelectTask: (task: any) => void;
  /** Dùng cho tab PENDING_ASSIGN: mở SmartAssignDrawer */
  onSmartAssign: (task: any) => void;
  /** Prefetch task detail khi hover card → dialog mở tức thì */
  onHoverTask?: (task: any) => void;
}

export const TaskGrid = memo(function TaskGrid({
  tasks,
  priorities,
  taskStatusCategories,
  context,
  onSelectTask,
  onSmartAssign,
  onHoverTask,
}: TaskGridProps) {

  const handleAssign = useCallback((e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    onSmartAssign(task);
  }, [onSmartAssign]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {tasks.map((task: any) => {
        const dueInfo = getDueDateDisplay(task.dueDate, task.status);
        const isUnassigned = !task.assigneeCode || task.assigneeCode === 'UNASSIGNED';

        return (
          <Card
            key={task.id}
            className="group relative hover:shadow-lg transition-all duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col cursor-pointer"
            onMouseEnter={() => onHoverTask?.(task)}
            onClick={() => onSelectTask(task)}
          >
            {/* Context indicator stripe */}
            <div className={`absolute top-0 left-0 right-0 h-0.5 ${
              context === 'PENDING_ASSIGN' ? 'bg-amber-400' :
              context === 'MY_EXECUTION' ? 'bg-indigo-500' :
              'bg-emerald-500'
            }`} />

            {/* Due badge */}
            {dueInfo.text && task.status !== 'DONE' && task.dueDate && (
              <div className={`absolute top-2 right-3 px-2.5 py-1 rounded-lg font-bold text-[10px] uppercase tracking-widest z-10 ${dueInfo.bg} ${dueInfo.color} border ${dueInfo.border}`}>
                {dueInfo.text}
              </div>
            )}

            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-5 flex-1 flex flex-col">
                {/* Header: status + plan badge */}
                <div className="flex justify-between items-start mb-3 gap-2">
                  <div className="flex flex-wrap gap-2 items-center max-w-[80%]">
                    {getStatusBadge(task.status || 'TODO', taskStatusCategories)}
                    {task.plan && (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 font-bold flex items-center gap-1 max-w-full">
                        <Target className="w-3 h-3 shrink-0" />
                        <span className="truncate">{task.plan.title}</span>
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Title + Desc */}
                <h3 className="font-bold text-[16px] text-slate-800 dark:text-slate-100 leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                  {task.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[40px]">
                  {task.description || 'Chưa có mô tả chi tiết cho công việc này.'}
                </p>

                {/* People */}
                <div className="space-y-2 mt-auto">
                  {/* Người thực hiện */}
                  <div className="flex items-center text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className={`w-7 h-7 rounded-full flex items-center justify-center mr-2.5 font-bold text-xs shrink-0 ${
                      isUnassigned ? 'bg-amber-100 text-amber-600' : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-900/40 dark:text-indigo-300'
                    }`}>
                      {isUnassigned ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Người thực hiện</span>
                      <span className={`truncate font-medium ${isUnassigned ? 'text-amber-600 italic' : 'text-slate-800 dark:text-slate-200'}`}>
                        {isUnassigned ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode)}
                      </span>
                    </div>
                  </div>

                  {/* Progress bar (tab I_ASSIGNED) */}
                  {context === 'I_ASSIGNED' && task.progress !== undefined && (
                    <div className="flex items-center gap-2">
                      <div className="flex-1 bg-slate-100 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            task.progress === 100 ? 'bg-emerald-500' :
                            task.progress > 50 ? 'bg-indigo-500' :
                            task.progress > 20 ? 'bg-amber-500' :
                            'bg-rose-400'
                          }`}
                          style={{ width: `${task.progress ?? 0}%` }}
                        />
                      </div>
                      <span className="text-[11px] font-black text-slate-500 w-8 shrink-0">{task.progress ?? 0}%</span>
                    </div>
                  )}

                  {/* Due date */}
                  <div className={`flex items-center text-sm ${dueInfo.color} ${dueInfo.bg} p-2.5 rounded-xl border ${dueInfo.border}`}>
                    <div className="w-7 h-7 rounded-full flex items-center justify-center mr-2.5 bg-white/80 dark:bg-slate-900/60">
                      {dueInfo.icon}
                    </div>
                    <div className="flex flex-col">
                      {dueInfo.text && <span className="text-[11px] font-bold uppercase tracking-wider opacity-90 mb-0.5">{dueInfo.text}</span>}
                      <span className="font-bold">{dueInfo.label}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer: action by context */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors duration-200">
                <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${getPriorityColor(task.priority)}`}>
                  <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current shadow-sm" />
                  {getPriorityName(task.priority, priorities)}
                </span>

                {/* Context-specific quick action */}
                {context === 'PENDING_ASSIGN' && isUnassigned && (
                  <Button
                    size="sm"
                    className="h-8 rounded-full text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => handleAssign(e, task)}
                  >
                    <UserCheck className="w-3.5 h-3.5 mr-1" /> Phân công
                  </Button>
                )}
                {context === 'MY_EXECUTION' && task.status !== 'DONE' && (
                  <Button
                    size="sm"
                    className="h-8 rounded-full text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold shadow-sm opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                  >
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Thực hiện
                  </Button>
                )}
                {context === 'I_ASSIGNED' && (
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-8 rounded-full text-xs text-emerald-700 font-bold opacity-0 group-hover:opacity-100 transition-all"
                    onClick={(e) => { e.stopPropagation(); onSelectTask(task); }}
                  >
                    <BarChart3 className="w-3.5 h-3.5 mr-1" /> Tiến độ
                  </Button>
                )}
                {context !== 'PENDING_ASSIGN' && context !== 'MY_EXECUTION' && context !== 'I_ASSIGNED' && (
                  <Button variant="link" onClick={(e) => { e.stopPropagation(); onSelectTask(task); }} className="px-0 text-indigo-600 font-bold group-hover:translate-x-2 transition-transform duration-300">
                    Chi tiết →
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
