'use client';

import React, { memo, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { PlayCircle, Edit, Target } from 'lucide-react';
import { getStatusBadge, getPriorityColor, getPriorityName, getDueDateDisplay } from '../utils';

interface TaskGridProps {
  tasks: any[];
  priorities: any[];
  onSelectTask: (task: any) => void;
  onSmartAssign: (task: any) => void;
  /** Prefetch task detail khi hover card → dialog mở tức thì */
  onHoverTask?: (task: any) => void;
}

/**
 * Grid view hiển thị danh sách task dạng card.
 * Memo-ized: chỉ re-render khi tasks array thay đổi.
 */
export const TaskGrid = memo(function TaskGrid({
  tasks,
  priorities,
  onSelectTask,
  onSmartAssign,
  onHoverTask,
}: TaskGridProps) {
  const handleSmartAssign = useCallback((e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    onSmartAssign(task);
  }, [onSmartAssign]);

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 mt-6">
      {tasks.map((task: any) => {
        const dueInfo = getDueDateDisplay(task.dueDate, task.status);
        return (
          <Card
            key={task.id}
            className="group relative hover:shadow-md transition-shadow duration-300 border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden flex flex-col"
            onMouseEnter={() => onHoverTask?.(task)}
          >
            {/* Due badge overlay */}
            {dueInfo.text && task.status !== 'DONE' && task.dueDate && (
              <div className={`absolute top-0 right-0 px-3 py-1 rounded-bl-xl font-bold text-[10px] uppercase tracking-widest z-10 ${dueInfo.bg} ${dueInfo.color} border-b border-l ${dueInfo.border}`}>
                {dueInfo.text}
              </div>
            )}

            <CardContent className="p-0 flex flex-col h-full">
              <div className="p-5 flex-1 flex flex-col">
                {/* Header row */}
                <div className="flex justify-between items-start mb-3">
                  <div className="flex flex-wrap gap-2 items-center max-w-[70%]">
                    {getStatusBadge(task.status || 'TODO')}
                    {task.plan && (
                      <Badge variant="outline" className="bg-indigo-50 text-indigo-700 border-indigo-200 text-[10px] px-1.5 font-bold flex items-center gap-1 max-w-full">
                        <Target className="w-3 h-3 shrink-0" />
                        <span className="truncate">{task.plan.title}</span>
                      </Badge>
                    )}
                  </div>
                  <div className="flex gap-2 shrink-0">
                    {(!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                      <Button
                        variant="secondary"
                        size="sm"
                        className="h-8 rounded-full text-xs bg-indigo-50 text-indigo-700 hover:bg-indigo-100 font-semibold opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={(e) => handleSmartAssign(e, task)}
                      >
                        <PlayCircle className="w-3 h-3 mr-1" /> Phân công
                      </Button>
                    )}
                    <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full bg-slate-50 dark:bg-slate-800 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-indigo-50 hover:text-indigo-600">
                      <Edit className="h-4 w-4 text-slate-400 group-hover:text-indigo-600" />
                    </Button>
                  </div>
                </div>

                {/* Title + Desc */}
                <h3 className="font-bold text-lg text-slate-800 dark:text-slate-100 leading-snug mb-1.5 line-clamp-2 group-hover:text-indigo-600 transition-colors duration-200">
                  {task.title}
                </h3>
                <p className="text-sm text-slate-500 line-clamp-2 mb-4 min-h-[40px]">
                  {task.description || 'Chưa có mô tả chi tiết cho công việc này.'}
                </p>

                {/* Meta rows */}
                <div className="space-y-2 mt-auto">
                  {/* Assignee */}
                  <div className="flex items-center text-sm bg-slate-50 dark:bg-slate-800/50 p-2.5 rounded-xl border border-slate-100 dark:border-slate-700/50">
                    <div className="w-7 h-7 rounded-full bg-indigo-100 dark:bg-indigo-900/40 flex items-center justify-center mr-2.5 text-indigo-700 dark:text-indigo-300 font-bold text-xs shrink-0">
                      {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                    </div>
                    <div className="flex flex-col flex-1 min-w-0">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 mb-0.5">Người thực hiện</span>
                      <span className="truncate font-medium text-slate-800 dark:text-slate-200">
                        {task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode || 'Chưa phân công')}
                      </span>
                    </div>
                  </div>

                  {/* Supervisor */}
                  {task.supervisorCode && (
                    <div className="flex items-center text-sm bg-amber-50/50 dark:bg-amber-900/10 p-2.5 rounded-xl border border-amber-100 dark:border-amber-900/30">
                      <div className="w-7 h-7 rounded-full bg-amber-100 dark:bg-amber-900/40 flex items-center justify-center mr-2.5 text-amber-700 dark:text-amber-300 font-bold text-xs shrink-0">
                        {(task.supervisorName || task.supervisorCode)?.charAt(0) || '?'}
                      </div>
                      <div className="flex flex-col flex-1 min-w-0">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-amber-600/70 mb-0.5">Theo dõi / Chỉ đạo</span>
                        <span className="truncate font-medium text-amber-900 dark:text-amber-100">
                          {task.supervisorName || task.supervisorCode}
                        </span>
                      </div>
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

              {/* Footer */}
              <div className="px-5 py-3 bg-slate-50 dark:bg-slate-800/50 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center group-hover:bg-indigo-50/50 dark:group-hover:bg-indigo-900/20 transition-colors duration-200">
                <span className={`text-[10px] font-bold uppercase tracking-widest flex items-center ${getPriorityColor(task.priority)}`}>
                  <div className="w-1.5 h-1.5 rounded-full mr-1.5 bg-current shadow-sm" />
                  Ưu tiên: {getPriorityName(task.priority, priorities)}
                </span>
                <Button
                  variant="link"
                  onClick={() => onSelectTask(task)}
                  className="px-0 text-indigo-600 font-bold group-hover:translate-x-2 transition-transform duration-300"
                >
                  Chi tiết →
                </Button>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
});
