'use client';

import React, { memo, useCallback } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Eye, UserCheck, CheckCircle2, BarChart3, Target } from 'lucide-react';
import { getStatusBadge, getPriorityColor, getPriorityName, getDueDateDisplay } from '../utils';

interface TaskTableProps {
  tasks: any[];
  priorities: any[];
  taskStatusCategories?: any[];
  /** Context xác định action hiển thị */
  context: any;
  onSelectTask: (task: any) => void;
  onSmartAssign: (task: any) => void;
  onHoverTask?: (task: any) => void;
}

/**
 * Table/list view hiển thị danh sách task dạng bảng.
 * Memo-ized: chỉ re-render khi tasks array thay đổi.
 */
export const TaskTable = memo(function TaskTable({
  tasks,
  priorities,
  taskStatusCategories,
  context,
  onSelectTask,
  onSmartAssign,
  onHoverTask,
}: TaskTableProps) {
  const handleAssign = useCallback((e: React.MouseEvent, task: any) => {
    e.stopPropagation();
    onSmartAssign(task);
  }, [onSmartAssign]);

  return (
    <Card className="border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 rounded-2xl overflow-hidden mt-6 shadow-sm">
      {/* Context label */}
      <div className={`px-6 py-2.5 text-[11px] font-bold border-b flex items-center gap-2 ${context === 'PENDING_ASSIGN' ? 'bg-amber-50 text-amber-700 border-amber-100' :
        context === 'MY_EXECUTION' ? 'bg-indigo-50 text-indigo-700 border-indigo-100' :
          'bg-emerald-50 text-emerald-700 border-emerald-100'
        }`}>
        {context === 'PENDING_ASSIGN' ? '🗂️ Danh sách chờ phân công' :
          context === 'MY_EXECUTION' ? '✅ Việc của tôi cần thực hiện' :
            '📊 Việc tôi đã giao'}
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-slate-500 uppercase bg-slate-50/50 dark:bg-slate-800/50 backdrop-blur-md border-b border-slate-200/50 dark:border-slate-700/50">
            <tr>
              <th className="px-6 py-5 font-bold tracking-wider">Tên công việc</th>
              <th className="px-6 py-5 font-bold tracking-wider">Trạng thái</th>
              <th className="px-6 py-5 font-bold tracking-wider">Mức ưu tiên</th>
              <th className="px-6 py-5 font-bold tracking-wider">
                {context === 'PENDING_ASSIGN' ? 'Người tạo / Kế hoạch' :
                  context === 'I_ASSIGNED' ? 'Người thực hiện / Tiến độ' :
                    'Thực hiện / Chỉ đạo'}
              </th>
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
                  <td className="px-6 py-5">{getStatusBadge(task.status || 'TODO', taskStatusCategories)}</td>

                  {/* Priority */}
                  <td className="px-6 py-5">
                    <span className={`font-black tracking-widest text-xs flex items-center ${getPriorityColor(task.priority)}`}>
                      <span className="w-1.5 h-1.5 rounded-full bg-current mr-2 animate-pulse" />
                      {getPriorityName(task.priority, priorities)}
                    </span>
                  </td>

                  {/* 4th col: dynamic per context */}
                  <td className="px-6 py-5">
                    {context === 'PENDING_ASSIGN' ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center text-xs font-bold mr-2.5 shrink-0">
                            {((task.assignerName || task.creatorName || task.creatorEmployeeCode || '?')?.charAt(0) || '?')}
                          </div>
                          <span className="font-medium text-sm truncate">
                            {task.assignerName || task.creatorName || task.creatorEmployeeCode || 'Hệ thống'}
                          </span>
                        </div>
                        {task.plan && (
                          <div className="text-[10px] font-bold text-indigo-600 bg-indigo-50 inline-flex items-center gap-1 px-1.5 py-0.5 rounded border border-indigo-100 w-fit ml-[38px]">
                            <Target className="w-3 h-3" /> {task.plan.title}
                          </div>
                        )}
                      </div>
                    ) : context === 'I_ASSIGNED' ? (
                      <div className="flex flex-col gap-1.5">
                        <div className="flex items-center gap-2">
                          <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex justify-center items-center text-xs font-bold shrink-0">
                            {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                          </div>
                          <span className="font-medium text-sm truncate">
                            {task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode)}
                          </span>
                        </div>
                        {task.progress !== undefined && (
                          <div className="flex items-center gap-2">
                            <div className="flex-1 bg-slate-100 rounded-full h-1.5 overflow-hidden">
                              <div className={`h-1.5 rounded-full ${task.progress === 100 ? 'bg-emerald-500' : 'bg-indigo-500'}`} style={{ width: `${task.progress ?? 0}%` }} />
                            </div>
                            <span className="text-[10px] font-black text-slate-500 w-7">{task.progress ?? 0}%</span>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="flex flex-col gap-2">
                        <div className="flex items-center">
                          <div className="w-7 h-7 rounded-full bg-indigo-100 text-indigo-600 flex justify-center items-center text-xs font-bold mr-2.5 shrink-0">
                            {task.assigneeCode === 'UNASSIGNED' ? '?' : ((task.assigneeName || task.assigneeCode)?.charAt(0) || '?')}
                          </div>
                          <span className={`font-medium text-sm truncate ${task.assigneeCode === 'UNASSIGNED' ? 'text-amber-600 italic' : ''
                            }`}>
                            {task.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : (task.assigneeName || task.assigneeCode)}
                          </span>
                        </div>
                        {task.supervisorCode && (
                          <div className="flex items-center">
                            <div className="w-7 h-7 rounded-full bg-amber-100 text-amber-600 flex justify-center items-center text-xs font-bold mr-2.5 shrink-0">
                              {(task.supervisorName || task.supervisorCode)?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-sm text-amber-700 dark:text-amber-500 truncate">
                              {task.supervisorName || task.supervisorCode} (CĐ)
                            </span>
                          </div>
                        )}
                        {task.approverCode && (
                          <div className="flex items-start mt-1.5">
                            <div className="w-7 h-7 rounded-full bg-teal-100 text-teal-600 flex justify-center items-center text-xs font-bold mr-2.5 shrink-0">
                              {(task.approverName || task.approverCode)?.charAt(0) || '?'}
                            </div>
                            <div className="flex flex-col min-w-0">
                              <span className="font-medium text-sm text-teal-700 dark:text-teal-500 truncate">
                                {task.approverName || task.approverCode} (TD)
                              </span>
                              {(task.domainName || task.domain?.name) && (
                                <span className="text-[9px] font-bold text-teal-600/70 dark:text-teal-400/70 uppercase tracking-wider truncate">
                                  {task.domainName || task.domain?.name}
                                </span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    )}
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

                  {/* Actions — context specific */}
                  <td className="px-6 py-5 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                      {context === 'PENDING_ASSIGN' && (!task.assigneeCode || task.assigneeCode === 'UNASSIGNED') && (
                        <Button size="sm" className="h-8 rounded-full text-xs bg-amber-500 hover:bg-amber-600 text-white font-bold" onClick={(e) => handleAssign(e, task)}>
                          <UserCheck className="h-3.5 w-3.5 mr-1" /> Phân công
                        </Button>
                      )}
                      {context === 'MY_EXECUTION' && task.status !== 'DONE' && (
                        <Button size="sm" className="h-8 rounded-full text-xs bg-emerald-500 hover:bg-emerald-600 text-white font-bold" onClick={() => onSelectTask(task)}>
                          <CheckCircle2 className="h-3.5 w-3.5 mr-1" /> Thực hiện
                        </Button>
                      )}
                      {context === 'I_ASSIGNED' && (
                        <Button size="sm" variant="ghost" className="h-8 rounded-full text-xs text-emerald-700 font-bold" onClick={() => onSelectTask(task)}>
                          <BarChart3 className="h-3.5 w-3.5 mr-1" /> Tiến độ
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => onSelectTask(task)} className="h-9 w-9 rounded-full bg-slate-50 text-indigo-600 hover:bg-indigo-50 transition-colors shadow-sm">
                        <Eye className="h-4 w-4" />
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
