'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Filter, Target, ClipboardList, Search } from 'lucide-react';
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
      <div className="inline-flex items-center p-1 bg-muted rounded-xl overflow-x-auto hide-scrollbar max-w-full">
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
                  ? cn("bg-background shadow-sm font-bold", textColor) 
                  : "text-muted-foreground hover:text-foreground hover:bg-muted-foreground/10"
              )}
            >
              {meta.icon}
              {meta.label}
            </button>
          );
        })}
      </div>

      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 bg-card p-2 rounded-xl border border-border shadow-sm">
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
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Tìm kiếm công việc..."
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              className="w-full h-10 pl-11 pr-4 rounded-md bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-primary/30 transition-all font-medium text-foreground placeholder:font-normal placeholder:text-muted-foreground"
            />
          </div>
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0">


          {/* Status select */}
          <div className="flex-1 sm:flex-none">
            <Select value={statusFilter} onValueChange={onStatusChange}>
              <SelectTrigger className="w-full sm:w-[180px] h-10 rounded-md border-input bg-background font-semibold text-foreground hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-xl p-1.5">
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
              <SelectTrigger className="w-full sm:w-[160px] h-10 rounded-md border-input bg-background font-semibold text-foreground hover:bg-muted/50 transition-colors">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Ưu tiên" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-md border-border shadow-xl p-1.5">
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
