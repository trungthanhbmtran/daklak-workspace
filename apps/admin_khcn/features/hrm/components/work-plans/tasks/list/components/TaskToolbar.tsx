'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from '@/components/ui/search';
import { LayoutGrid, List as ListIcon, Filter, Target } from 'lucide-react';

type Tab = 'ALL' | 'MY_TASKS' | 'ASSIGNED_BY_ME' | 'DEPT_TASKS';

interface TaskToolbarProps {
  activeTab: Tab;
  statusFilter: string;
  priorityFilter: string;
  viewMode: 'grid' | 'list';
  onTabChange: (tab: Tab) => void;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onViewChange: (v: 'grid' | 'list') => void;
  taskStatusCategories?: any[];
}

/**
 * Thanh toolbar: Search + Tabs + Status/Priority select + ViewMode toggle.
 * Memo-ized: chỉ re-render khi filter thay đổi, không re-render theo task data.
 */
export const TaskToolbar = memo(function TaskToolbar({
  activeTab,
  statusFilter,
  priorityFilter,
  viewMode,
  onTabChange,
  onStatusChange,
  onPriorityChange,
  onViewChange,
  taskStatusCategories = [],
}: TaskToolbarProps) {
  return (
    <div className="relative flex flex-col xl:flex-row justify-between items-center gap-4 mb-2">
      {/* Left: Search + Tabs */}
      <div className="flex flex-col sm:flex-row gap-4 items-center w-full xl:w-auto flex-1">
        <div className="w-full sm:max-w-[320px]">
          <Search
            placeholder="Tìm kiếm công việc..."
            className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all"
          />
        </div>

        <Tabs value={activeTab} onValueChange={(v: any) => onTabChange(v)} className="w-full sm:w-[480px] h-11">
          <TabsList className="h-full w-full grid grid-cols-4 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700">
            {([
              { value: 'ALL',            label: 'Tất cả',  activeColor: 'text-indigo-600' },
              { value: 'MY_TASKS',       label: 'Của tôi', activeColor: 'text-indigo-600' },
              { value: 'ASSIGNED_BY_ME', label: 'Đã giao', activeColor: 'text-emerald-600' },
              { value: 'DEPT_TASKS',     label: 'Phòng',   activeColor: 'text-indigo-600' },
            ] as const).map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className={`rounded-lg text-[13px] font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:${tab.activeColor} dark:data-[state=active]:text-indigo-400 transition-all h-full`}
              >
                {tab.label}
              </TabsTrigger>
            ))}
          </TabsList>
        </Tabs>
      </div>

      {/* Right: Selects + ViewToggle */}
      <div className="flex flex-wrap sm:flex-nowrap items-center gap-4 w-full sm:w-auto shrink-0">
        {/* Status select */}
        <div className="flex-1 sm:flex-none">
          <Select value={statusFilter} onValueChange={onStatusChange}>
            <SelectTrigger className="w-full sm:w-[180px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Target className="w-4 h-4 text-indigo-500" />
                <SelectValue placeholder="Trạng thái" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
              <SelectItem value="ALL" className="rounded-lg font-semibold py-2.5 cursor-pointer">Tất cả trạng thái</SelectItem>
              {taskStatusCategories.map((c: any) => {
                let colorClass = "text-slate-600 focus:bg-slate-50 dark:text-slate-300 dark:focus:bg-slate-800";
                if (c.code === 'DONE') colorClass = "text-emerald-600 focus:bg-emerald-50 dark:text-emerald-400 dark:focus:bg-emerald-900/20";
                else if (c.code === 'PROCESSING' || c.code === 'IN_PROGRESS') colorClass = "text-amber-600 focus:bg-amber-50 dark:text-amber-400 dark:focus:bg-amber-900/20";
                else if (c.code === 'PENDING' || c.code === 'TODO' || c.code === 'UNASSIGNED') colorClass = "text-blue-600 focus:bg-blue-50 dark:text-blue-400 dark:focus:bg-blue-900/20";
                else if (c.code === 'OVERDUE') colorClass = "text-rose-600 focus:bg-rose-50 dark:text-rose-400 dark:focus:bg-rose-900/20";

                return (
                  <SelectItem key={c.code} value={c.code} className={`rounded-lg font-semibold py-2.5 cursor-pointer ${colorClass}`}>
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
            <SelectTrigger className="w-full sm:w-[170px] h-11 rounded-xl border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 font-semibold text-slate-700 dark:text-slate-200">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-rose-500" />
                <SelectValue placeholder="Ưu tiên" />
              </div>
            </SelectTrigger>
            <SelectContent className="rounded-xl border-slate-200 shadow-lg p-1">
              <SelectItem value="ALL"    className="rounded-lg font-semibold py-2.5 cursor-pointer">Mọi ưu tiên</SelectItem>
              <SelectItem value="HIGH"   className="rounded-lg font-semibold py-2.5 cursor-pointer text-rose-600 focus:bg-rose-50">🔴 Cao</SelectItem>
              <SelectItem value="MEDIUM" className="rounded-lg font-semibold py-2.5 cursor-pointer text-amber-600 focus:bg-amber-50">🟡 Trung bình</SelectItem>
              <SelectItem value="LOW"    className="rounded-lg font-semibold py-2.5 cursor-pointer text-emerald-600 focus:bg-emerald-50">🟢 Thấp</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Grid/List toggle */}
        <div className="hidden sm:flex items-center bg-slate-100 dark:bg-slate-800 p-1 rounded-xl border border-slate-200 dark:border-slate-700">
          {(['grid', 'list'] as const).map((mode) => (
            <Button
              key={mode}
              variant={viewMode === mode ? 'default' : 'ghost'}
              size="sm"
              className={`rounded-lg h-9 w-11 p-0 transition-all duration-300 ${viewMode === mode ? 'bg-white dark:bg-slate-700 text-indigo-600 dark:text-indigo-400 shadow-sm' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800'}`}
              onClick={() => onViewChange(mode)}
            >
              {mode === 'grid' ? <LayoutGrid className="h-4 w-4" /> : <ListIcon className="h-4 w-4" />}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
});
