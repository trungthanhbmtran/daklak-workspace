'use client';

import React, { memo } from 'react';
import { AlertCircle, Clock, Calendar, CheckCircle2, ClipboardList, Hourglass, X } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatsBarProps {
  stats: {
    overdue: number;
    warning: number;
    inTime: number;
    doneInTime: number;
    doneOverdue: number;
    unassigned?: number;
    pendingApproval?: number;
  };
  activeFilter: string | null;
  onFilterChange: (id: string | null) => void;
}

const CHIPS = [
  {
    id: 'overdue',
    Icon: AlertCircle,
    label: 'Quá hạn',
    base: 'bg-rose-100 text-rose-700 border-rose-200 hover:bg-rose-200 dark:bg-rose-900/30 dark:text-rose-300 dark:border-rose-800',
    active: 'bg-rose-600 text-white border-rose-600 hover:bg-rose-700',
    getValue: (s: any) => s.overdue as number,
  },
  {
    id: 'warning',
    Icon: Clock,
    label: 'Sắp hạn',
    base: 'bg-amber-100 text-amber-700 border-amber-200 hover:bg-amber-200 dark:bg-amber-900/30 dark:text-amber-300 dark:border-amber-800',
    active: 'bg-amber-500 text-white border-amber-500 hover:bg-amber-600',
    getValue: (s: any) => s.warning as number,
  },
  {
    id: 'inTime',
    Icon: Calendar,
    label: 'Trong hạn',
    base: 'bg-blue-100 text-blue-700 border-blue-200 hover:bg-blue-200 dark:bg-blue-900/30 dark:text-blue-300 dark:border-blue-800',
    active: 'bg-blue-600 text-white border-blue-600 hover:bg-blue-700',
    getValue: (s: any) => s.inTime as number,
  },
  {
    id: 'pendingApproval',
    Icon: Hourglass,
    label: 'Chờ duyệt',
    base: 'bg-violet-100 text-violet-700 border-violet-200 hover:bg-violet-200 dark:bg-violet-900/30 dark:text-violet-300 dark:border-violet-800',
    active: 'bg-violet-600 text-white border-violet-600 hover:bg-violet-700',
    getValue: (s: any) => (s.pendingApproval || 0) as number,
  },
  {
    id: 'unassigned',
    Icon: ClipboardList,
    label: 'Chưa phân công',
    base: 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
    active: 'bg-slate-700 text-white border-slate-700 hover:bg-slate-800',
    getValue: (s: any) => (s.unassigned || 0) as number,
  },
  {
    id: 'doneInTime',
    Icon: CheckCircle2,
    label: 'Hoàn thành',
    base: 'bg-emerald-100 text-emerald-700 border-emerald-200 hover:bg-emerald-200 dark:bg-emerald-900/30 dark:text-emerald-300 dark:border-emerald-800',
    active: 'bg-emerald-600 text-white border-emerald-600 hover:bg-emerald-700',
    getValue: (s: any) => s.doneInTime as number,
  },
] as const;

/**
 * Compact stats strip — một hàng chip nhỏ thay cho 6 card lớn.
 * Click vào chip để lọc, click lại hoặc "Xóa lọc" để bỏ lọc.
 */
export const TaskStatsBar = memo(function TaskStatsBar({
  stats,
  activeFilter,
  onFilterChange,
}: TaskStatsBarProps) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap">
      {CHIPS.map(({ id, Icon, label, base, active, getValue }) => {
        const count = getValue(stats);
        const isActive = activeFilter === id;
        const isEmpty = count === 0 && !isActive;
        return (
          <button
            key={id}
            onClick={() => onFilterChange(isActive ? null : id)}
            disabled={isEmpty}
            className={cn(
              'inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full border text-[12px] font-bold transition-all duration-150 select-none',
              isActive ? active : base,
              isEmpty && 'opacity-35 cursor-not-allowed pointer-events-none',
            )}
          >
            <Icon className="w-3 h-3 shrink-0" />
            <span className="tabular-nums">{count}</span>
            <span className="hidden sm:inline">{label}</span>
          </button>
        );
      })}

      {activeFilter && (
        <button
          onClick={() => onFilterChange(null)}
          className="inline-flex items-center gap-1 px-2 py-1.5 rounded-full text-[11px] font-bold text-slate-400 hover:text-rose-500 transition-colors"
        >
          <X className="w-3 h-3" /> Xóa lọc
        </button>
      )}
    </div>
  );
});
