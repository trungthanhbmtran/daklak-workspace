'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from '@/components/ui/search';
import { Filter, Target, User, Users, ClipboardList, Eye, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export type TaskRoleFilter = 'ALL' | 'UNASSIGNED' | 'ASSIGNEE' | 'OWNER' | 'APPROVER' | 'COORDINATOR';

export const ROLE_META: Record<TaskRoleFilter, { label: string; icon: React.ReactNode; color: string }> = {
  ALL: { label: 'Tất cả công việc', icon: <ClipboardList className="w-4 h-4" />, color: 'text-slate-600 bg-slate-100' },
  ASSIGNEE: { label: 'Việc tôi làm', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-100' },
  OWNER: { label: 'Việc tôi giao', icon: <User className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-100' },
  APPROVER: { label: 'Tôi giám sát', icon: <Eye className="w-4 h-4" />, color: 'text-rose-600 bg-rose-100' },
  COORDINATOR: { label: 'Tôi phối hợp', icon: <Users className="w-4 h-4" />, color: 'text-amber-600 bg-amber-100' },
  UNASSIGNED: { label: 'Chờ phân công', icon: <Target className="w-4 h-4" />, color: 'text-orange-600 bg-orange-100' },
};

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
  taskStatusCategories?: any[];
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
  taskStatusCategories = [],
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-4 mb-4">
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
          {/* Role select */}
          <div className="flex-1 sm:flex-none">
            <Select value={roleFilter} onValueChange={(v) => onRoleChange(v as TaskRoleFilter)}>
              <SelectTrigger className="w-full sm:w-[190px] h-10 rounded-md border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Vai trò" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-md border-slate-200 shadow-xl p-1.5">
                {Object.entries(ROLE_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key} className="rounded-md font-semibold py-2 cursor-pointer">
                    <div className="flex items-center gap-2.5">
                      {meta.label}
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

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

      {/* Role Legend Bar */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 hide-scrollbar">
        {Object.values(ROLE_META).map((meta, idx) => (
          <div key={idx} className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap border border-transparent shadow-sm", meta.color)}>
            {meta.icon}
            {meta.label}
          </div>
        ))}
      </div>
    </div>
  );
});
