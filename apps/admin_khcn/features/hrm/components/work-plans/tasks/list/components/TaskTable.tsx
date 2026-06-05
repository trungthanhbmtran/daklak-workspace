'use client';

import React, { memo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, Edit, Trash2, PlayCircle, Target } from 'lucide-react';
import { getStatusBadge, getPriorityColor, getPriorityName, getDueDateDisplay } from '../utils';

interface TaskTableProps {
  tasks: any[];
  priorities: any[];
  onSelectTask: (task: any) => void;
  onSmartAssign: (task: any) => void;
  /** Prefetch task detail khi hover row */
  onHoverTask?: (task: any) => void;
}

/**
 * Table/list view hiển thị danh sách task dạng bảng.
 * Memo-ized: chỉ re-render khi tasks array thay đổi.
 */
export const TaskTable = memo(function TaskTable({
  tasks,
  priorities,
  onSelectTask,
  onSmartAssign,
  onHoverTask,
}: TaskTableProps) {
  const handleSmartAssign = useCallback((e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    onSmartAssign(task);
  }, [onSmartAssign]);

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mt-6 shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-5 font-bold tracking-wider">Tên công việc</th>
              <th className="px-6 py-5 font-bold tracking-wider">Trạng thái</th>
              <th className="px-6 py-5 font-bold tracking-wider">Mức độ ưu tiên</th>
              <th className="px-6 py-5 font-bold tracking-wider">Thực hiện / Chỉ đạo</th>
              <th className="px-6 py-5 font-bold tracking-wider">Hạn chót</th>
              <th className="px-6 py-5 text-right font-bold tracking-wider">Thao tác</th>
            </tr>
          </thead>
          <tbody>
            {tasks.map((task: any) => {
              const dueInfo = getDueDateDisplay(task.dueDate, task.status);
              return (
                <tr
                  key={task.id}
                  className="bg-transparent border-b border-slate-100/50 dark:border-slate-800/50 hover:bg-white dark:hover:bg-slate-800 transition-all duration-300 group"
                  onMouseEnter={() => onHoverTask?.(task)}
                >
                  {/* Title */}
                  <td className="px-6 py-5 font-semibold text-slate-900 dark:text-white max-w-xs group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                    <div className="truncate mb-1">{task.title}</div>
                    {task.plan && (
                      <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-indigo-100">
                        <Target className="w-3 h-3" /> {task.plan.title}
                      </div>
                    )}
                  </td>

                  {/* Status */}
                  <td className="px-6 py-5">{getStatusBadge(task.status || 'TODO')}</td>

                  {/* Priority */}
                  <td className="px-6 py-5">
                    <span className={`font-black tracking-widest text-xs flex items-center ${getPriorityColor(task.priority)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                      {getPriorityName(task.priority, priorities)}
                    </span>
                  </td>

                  {/* Assignee + Supervisor */}
                  <td className="px-6 py-5">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-center">
                        <div className="w-7 h-7 rounded-full bg-linear-to-br from-indigo-100 to-indigo-50 text-indigo-600 flex justify-center items-center text-xs font-bold mr-2.5 shrink-0">
                          {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                        </div>
                        <span className="font-medium text-sm truncate">
                          {task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode || 'Chưa phân công')}
                        </span>
                      </div>
                      {task.supervisorCode && (
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-linear-to-br from-amber-100 to-amber-50 text-amber-600 flex justify-center items-center text-xs font-bold mr-2.5 shrink-0">
                            {(task.supervisorName || task.supervisorCode)?.charAt(0) || '?'}
                          </div>
                          <span className="font-medium text-sm text-amber-700 dark:text-amber-500 truncate">
                            {task.supervisorName || task.supervisorCode} (CĐ)
                          </span>
                        </div>
                      )}
                    </div>
                  </td>

                  {/* Due date */}
                  <td className="px-6 py-5">
                    <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border ${dueInfo.bg} ${dueInfo.border} ${dueInfo.color}`}>
                      {dueInfo.icon}
                      <div className="flex flex-col leading-tight">
                        {dueInfo.text && <span className="text-[10px] font-bold uppercase tracking-wider opacity-90 mb-0.5">{dueInfo.text}</span>}
                        <span className="font-bold text-sm">{dueInfo.label}</span>
                      </div>
                    </div>
                  </td>

                  {/* Actions */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {(!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => handleSmartAssign(e, task)}
                          className="h-9 w-9 rounded-full bg-indigo-50 text-indigo-600 hover:bg-indigo-600 hover:text-white transition-colors shadow-sm"
                        >
                          <PlayCircle className="h-4 w-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => onSelectTask(task)}
                        className="h-9 w-9 rounded-full bg-slate-50 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm"
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-50 text-amber-600 hover:bg-amber-50 transition-colors shadow-sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-9 w-9 rounded-full bg-slate-50 text-rose-600 hover:bg-rose-50 transition-colors shadow-sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </Card>
  );
});
