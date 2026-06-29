'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Target, User, Users, ClipboardList, Eye, CheckCircle2, Search } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';

import { TaskRoleFilter, TASK_ROLE_META } from '@/components/shared/badges/TaskBadges';

interface TaskToolbarProps {
  roleFilter: TaskRoleFilter;
  statusFilter: string;
  priorityFilter: string;
  searchQuery: string;
  onRoleChange: (role: TaskRoleFilter) => void;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onSearchChange: (v: string) => void;
  onCreateTask?: () => void;
}

export const TaskToolbar = memo(function TaskToolbar({
  roleFilter,
  statusFilter,
  priorityFilter,
  searchQuery,
  onRoleChange,
  onStatusChange,
  onPriorityChange,
  onSearchChange,
  onCreateTask,
}: TaskToolbarProps) {
  const { data: statusRes }: any = useGetCategoryByGroup('TASK_STATUS');
  const taskStatusCategories = statusRes?.data || [];
  
  return (
    <div className="flex flex-col gap-4 mb-4">
      {/* Role Filter Tabs (Segmented Control) */}
      <div className="inline-flex items-center p-1 bg-slate-100/80 dark:bg-slate-800/80 rounded-xl overflow-x-auto hide-scrollbar max-w-full">
        {Object.entries(TASK_ROLE_META).map(([key, meta]) => {
          const isActive = roleFilter === key;
          // Extract just the text color from meta.color (e.g., 'text-indigo-600')
          const textColor = meta.color.split(' ').find(c => c.startsWith('text-'));
          
          return (
            <button
              key={key}
              onClick={() => onRoleChange(key as TaskRoleFilter)}
              className={cn(
                "flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-[13px] font-medium whitespace-nowrap transition-all duration-200",
                isActive 
                  ? cn("bg-white dark:bg-slate-900 shadow-sm font-bold", textColor) 
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 hover:bg-slate-200/50 dark:hover:bg-slate-700/50"
              )}
            >
              {meta.icon}
              {meta.label}
            </button>
          );
        })}
      </div>

      {/* Row: Search + Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-white/50 dark:bg-slate-900/50 p-2 rounded-xl border border-slate-200/60 dark:border-slate-800 shadow-sm">
        <div className="flex w-full xl:w-auto items-center gap-3">
          {onCreateTask && (
            <Button
              onClick={onCreateTask}
              className="h-10 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white font-semibold shadow-sm px-5"
            >
              <ClipboardList className="w-4 h-4 mr-2" />
              Khởi tạo công việc
            </Button>
          )}
          <div className="w-full sm:w-[350px] relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-11 pr-4 rounded-md bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/30 transition-all font-medium text-slate-800 dark:text-slate-100 placeholder:font-normal placeholder:text-slate-400"
            />
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0">


          {/* Status select */}
          <div className="flex-1 sm:flex-none">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200 shadow-xl p-1.5">
                <SelectItem value="ALL" className="rounded-md font-semibold py-2 cursor-pointer">Tất cả trạng thái</SelectItem>
                {taskStatusCategories?.map((st: any) => (
                  <SelectItem key={st.id} value={st.code} className="rounded-md font-semibold py-2 cursor-pointer">
                    {st.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority select */}
          <div className="flex-1 sm:flex-none">
            <Select value={priorityFilter} onValueChange={onPriorityChange}>
              <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Ưu tiên" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200 shadow-xl p-1.5">
                <SelectItem value="ALL" className="rounded-md font-semibold py-2 cursor-pointer">Tất cả mức độ</SelectItem>
                <SelectItem value="HIGH" className="rounded-md font-semibold py-2 cursor-pointer text-rose-600">🔴 Cao</SelectItem>
                <SelectItem value="MEDIUM" className="rounded-md font-semibold py-2 cursor-pointer text-amber-600">🟡 Trung bình</SelectItem>
                <SelectItem value="LOW" className="rounded-md font-semibold py-2 cursor-pointer text-blue-600">🔵 Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>

    </div>
  );
});
