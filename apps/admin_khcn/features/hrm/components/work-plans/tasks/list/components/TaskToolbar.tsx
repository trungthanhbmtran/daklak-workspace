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
  taskStatusCategories = [],
}: TaskToolbarProps) {
  return (
    <div className="flex flex-col gap-3 mb-2">
      {/* Row: Search + Filters */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div className="w-full sm:max-w-[320px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-11 pl-9 pr-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0">
          {/* Role select */}
          <div className="flex-1 sm:flex-none">
            <Select value={roleFilter} onValueChange={(v) => onRoleChange(v as TaskRoleFilter)}>
              <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Vai trò" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
                {Object.entries(ROLE_META).map(([key, meta]) => (
                  <SelectItem key={key} value={key} className="rounded-lg font-semibold py-2.5 cursor-pointer">
                    <div className="flex items-center gap-2">
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
              <SelectTrigger className="w-full sm:w-[170px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-indigo-500" />
                  <SelectValue placeholder="Trạng thái" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
                <SelectItem value="ALL" className="rounded-lg font-semibold py-2.5 cursor-pointer">Tất cả trạng thái</SelectItem>
                {taskStatusCategories.map((c: any) => {
                  let colorClass = "text-slate-600 focus:bg-slate-50 dark:text-slate-300";
                  if (c.code === 'DONE') colorClass = "text-emerald-600 focus:bg-emerald-50";
                  else if (c.code === 'PROCESSING' || c.code === 'IN_PROGRESS') colorClass = "text-amber-600 focus:bg-amber-50";
                  else if (c.code === 'PENDING' || c.code === 'TODO' || c.code === 'UNASSIGNED') colorClass = "text-blue-600 focus:bg-blue-50";
                  else if (c.code === 'OVERDUE') colorClass = "text-rose-600 focus:bg-rose-50";
                  return (
                    <SelectItem key={c.code} value={c.code} className={cn("rounded-lg font-semibold py-2.5 cursor-pointer", colorClass)}>
                      {c.nameVi || c.name || c.code}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
          </div>

          {/* Priority select */}
          <div className="flex-1 sm:flex-none">
            <Select value={priorityFilter} onValueChange={onPriorityChange}>
              <SelectTrigger className="w-full sm:w-[160px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
                <div className="flex items-center gap-2">
                  <Filter className="w-4 h-4 text-rose-500" />
                  <SelectValue placeholder="Ưu tiên" />
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
                <SelectItem value="ALL" className="rounded-lg font-semibold py-2.5 cursor-pointer">Mọi ưu tiên</SelectItem>
                <SelectItem value="HIGH" className="rounded-lg font-semibold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50">🔴 Cao</SelectItem>
                <SelectItem value="MEDIUM" className="rounded-lg font-semibold py-2.5 cursor-pointer text-amber-600 focus:bg-amber-50">🟡 Trung bình</SelectItem>
                <SelectItem value="LOW" className="rounded-lg font-semibold py-2.5 cursor-pointer text-emerald-600 focus:bg-emerald-50">🟢 Thấp</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
      
      {/* Visual Role Badges Legend */}
      <div className="flex items-center gap-3 mt-1 overflow-x-auto pb-2 scrollbar-none">
        <span className="text-xs font-semibold text-slate-500 shrink-0">Chú thích vai trò:</span>
        {Object.entries(ROLE_META).filter(([k]) => k !== 'ALL').map(([key, meta]) => (
          <div key={key} className={cn("flex items-center gap-1.5 px-2 py-1 rounded-md text-[11px] font-bold shrink-0", meta.color)}>
            {meta.icon} {meta.label}
          </div>
        ))}
      </div>
    </div>
  );
});
