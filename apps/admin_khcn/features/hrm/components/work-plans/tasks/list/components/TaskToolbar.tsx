'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SlidersHorizontal, Search, Plus, X } from 'lucide-react';
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

/**
 * Toolbar gọn gàng — 2 hàng thay cho toolbar 2 tầng cũ:
 * Hàng 1: [+ Tạo mới] [🔍 Search] [Bộ lọc ▾]
 * Hàng 2: [Role tabs — scroll ngang]
 */
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
  const activeFilterCount =
    (statusFilter !== 'ALL' ? 1 : 0) + (priorityFilter !== 'ALL' ? 1 : 0);

  return (
    <div className="flex flex-col gap-2">
      {/* ── Hàng 1: Actions ── */}
      <div className="flex items-center gap-2">
        {onCreateTask && (
          <Button
            onClick={onCreateTask}
            size="sm"
            className="h-9 shrink-0 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold gap-1.5 px-4 rounded-lg shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span className="hidden sm:inline">Tạo mới</span>
          </Button>
        )}

        {/* Search */}
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
          <input
            type="text"
            placeholder="Tìm kiếm công việc..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full h-9 pl-9 pr-3 rounded-lg bg-background border border-input text-sm focus:outline-none focus:ring-2 focus:ring-ring/30 transition-all text-foreground placeholder:text-muted-foreground"
          />
        </div>

        {/* Filter popover */}
        <Popover>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="h-9 gap-2 shrink-0 relative px-3 rounded-lg"
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span className="hidden sm:inline text-sm">Bộ lọc</span>
              {activeFilterCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 w-[18px] h-[18px] bg-indigo-600 text-white text-[9px] font-bold rounded-full flex items-center justify-center">
                  {activeFilterCount}
                </span>
              )}
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-60 p-4 space-y-3.5 rounded-xl shadow-xl" align="end">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Bộ lọc nâng cao</p>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Trạng thái</label>
              <Select value={statusFilter} onValueChange={onStatusChange}>
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue placeholder="Tất cả trạng thái" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả trạng thái</SelectItem>
                  {taskStatusCategories.map((st: any) => (
                    <SelectItem key={st.id} value={st.code}>{st.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Mức ưu tiên</label>
              <Select value={priorityFilter} onValueChange={onPriorityChange}>
                <SelectTrigger className="h-9 rounded-lg text-sm">
                  <SelectValue placeholder="Tất cả mức độ" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">Tất cả mức độ</SelectItem>
                  <SelectItem value="HIGH">🔴 Cao</SelectItem>
                  <SelectItem value="MEDIUM">🟡 Trung bình</SelectItem>
                  <SelectItem value="LOW">🔵 Thấp</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {activeFilterCount > 0 && (
              <Button
                variant="ghost"
                className="w-full h-8 text-xs text-slate-500 hover:text-rose-500 gap-1"
                onClick={() => {
                  onStatusChange('ALL');
                  onPriorityChange('ALL');
                }}
              >
                <X className="w-3 h-3" /> Xóa bộ lọc
              </Button>
            )}
          </PopoverContent>
        </Popover>
      </div>

      {/* ── Hàng 2: Role tabs ── */}
      <div className="flex items-center gap-1 overflow-x-auto hide-scrollbar">
        {(Object.entries(TASK_ROLE_META) as [TaskRoleFilter, typeof TASK_ROLE_META[TaskRoleFilter]][]).map(
          ([key, meta]) => {
            const isActive = roleFilter === key;
            return (
              <button
                key={key}
                onClick={() => onRoleChange(key)}
                className={cn(
                  'flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-[12px] font-semibold whitespace-nowrap transition-all duration-150 shrink-0',
                  isActive
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted',
                )}
              >
                <span className="[&>svg]:w-3.5 [&>svg]:h-3.5">{meta.icon}</span>
                {meta.label}
              </button>
            );
          },
        )}
      </div>
    </div>
  );
});
