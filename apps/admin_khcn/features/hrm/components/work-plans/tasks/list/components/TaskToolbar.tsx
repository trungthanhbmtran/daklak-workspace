'use client';

import React, { memo } from 'react';
import { Button } from '@/components/ui/button';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search } from '@/components/ui/search';
import { LayoutGrid, List as ListIcon, Filter, Target, ClipboardList, CheckCircle2, BarChart3, Clock } from 'lucide-react';

export type TaskTab = 'PENDING_ASSIGN' | 'MY_EXECUTION' | 'I_ASSIGNED';

/** Meta mô tả mỗi tab — không trùng chức năng */
export const TAB_META: Record<TaskTab, {
  icon: React.ReactNode;
  label: string;
  hint: string;
  color: string;
  emptyMessage: string;
  emptyHint: string;
}> = {
  PENDING_ASSIGN: {
    icon: <ClipboardList className="w-3.5 h-3.5" />,
    label: 'Chờ giao',
    hint: 'Nhiệm vụ từ kế hoạch chưa có người thực hiện — chọn để phân công',
    color: 'text-amber-600',
    emptyMessage: 'Không có nhiệm vụ nào chờ giao',
    emptyHint: 'Tất cả nhiệm vụ đã được phân công người thực hiện.',
  },
  MY_EXECUTION: {
    icon: <CheckCircle2 className="w-3.5 h-3.5" />,
    label: 'Việc của tôi',
    hint: 'Nhiệm vụ được giao cho bạn — hành động để cập nhật tiến độ',
    color: 'text-indigo-600',
    emptyMessage: 'Bạn chưa có nhiệm vụ nào được giao',
    emptyHint: 'Khi có nhiệm vụ mới, chúng sẽ xuất hiện tại đây.',
  },
  I_ASSIGNED: {
    icon: <BarChart3 className="w-3.5 h-3.5" />,
    label: 'Tôi đã giao',
    hint: 'Theo dõi tiến độ các nhiệm vụ bạn đã giao cho người khác',
    color: 'text-emerald-600',
    emptyMessage: 'Bạn chưa giao nhiệm vụ nào',
    emptyHint: 'Hãy phân công nhiệm vụ từ tab "Chờ giao".',
  },
};

interface TaskToolbarProps {
  activeTab: TaskTab;
  statusFilter: string;
  priorityFilter: string;
  viewMode: 'grid' | 'list';
  onTabChange: (tab: TaskTab) => void;
  onStatusChange: (v: string) => void;
  onPriorityChange: (v: string) => void;
  onViewChange: (v: 'grid' | 'list') => void;
  taskStatusCategories?: any[];
  /** Badge counts */
  counts?: { pendingAssign?: number; myExecution?: number; iAssigned?: number };
}

const TAB_ORDER: TaskTab[] = ['PENDING_ASSIGN', 'MY_EXECUTION', 'I_ASSIGNED'];

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
  counts = {},
}: TaskToolbarProps) {
  const meta = TAB_META[activeTab];

  return (
    <div className="flex flex-col gap-3 mb-2">
      {/* Row 1: Tabs + Badge + Sub-header */}
      <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
        <Tabs value={activeTab} onValueChange={(v: any) => onTabChange(v)} className="w-full sm:w-auto">
          <TabsList className="h-11 rounded-xl bg-slate-100 dark:bg-slate-800 p-1 border border-slate-200 dark:border-slate-700 flex gap-1">
            {TAB_ORDER.map((tab) => {
              const tm = TAB_META[tab];
              const count = tab === 'PENDING_ASSIGN' ? counts.pendingAssign
                : tab === 'MY_EXECUTION' ? counts.myExecution
                : counts.iAssigned;

              return (
                <TabsTrigger
                  key={tab}
                  value={tab}
                  className="rounded-lg text-[12px] font-bold tracking-wide data-[state=active]:bg-white dark:data-[state=active]:bg-slate-700 data-[state=active]:shadow-sm transition-all h-full px-3 flex items-center gap-1.5 whitespace-nowrap"
                >
                  <span className="hidden sm:block">{tm.icon}</span>
                  {tm.label}
                  {count !== undefined && count > 0 && (
                    <span className={`text-[10px] font-black px-1.5 py-0.5 rounded-full ml-0.5 ${
                      tab === 'PENDING_ASSIGN' 
                        ? 'bg-amber-100 text-amber-700' 
                        : tab === 'MY_EXECUTION' 
                        ? 'bg-indigo-100 text-indigo-700'
                        : 'bg-emerald-100 text-emerald-700'
                    }`}>
                      {count}
                    </span>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </Tabs>

        {/* Sub-header mô tả tab đang active */}
        <div className={`flex items-center gap-1.5 text-[11px] font-semibold ${meta.color} bg-white dark:bg-slate-900 border border-current/20 rounded-full px-3 py-1.5 shadow-sm`}>
          <Clock className="w-3 h-3 shrink-0" />
          <span className="hidden lg:block">{meta.hint}</span>
          <span className="lg:hidden">{meta.label}</span>
        </div>
      </div>

      {/* Row 2: Search + Filters + ViewToggle */}
      <div className="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-3">
        <div className="w-full sm:max-w-[320px]">
          <Search
            placeholder="Tìm kiếm công việc..."
            className="w-full h-11 rounded-xl bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 transition-all"
          />
        </div>

        <div className="flex flex-wrap sm:flex-nowrap items-center gap-3 w-full sm:w-auto shrink-0">
          {/* Status select — ẩn ở tab I_ASSIGNED (chỉ xem all) */}
          {activeTab !== 'I_ASSIGNED' && (
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
                      <SelectItem key={c.code} value={c.code} className={`rounded-lg font-semibold py-2.5 cursor-pointer ${colorClass}`}>
                        {c.nameVi || c.name || c.code}
                      </SelectItem>
                    );
                  })}
                </SelectContent>
              </Select>
            </div>
          )}

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
    </div>
  );
});
