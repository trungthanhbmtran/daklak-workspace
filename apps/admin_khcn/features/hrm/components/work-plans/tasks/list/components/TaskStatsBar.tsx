'use client';

import React, { memo } from 'react';
import { AlertCircle, Clock, Calendar, CheckCircle2, ClipboardList, Hourglass } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatsBarProps {
  stats: { overdue: number; warning: number; inTime: number; doneInTime: number; doneOverdue: number; unassigned?: number; pendingApproval?: number };
  activeFilter: string | null;
  onFilterChange: (id: string | null) => void;
}

/**
 * Stats cards hiển thị tổng quan theo trạng thái thời hạn + workflow.
 * Memo-ized: chỉ re-render khi stats hoặc activeFilter thay đổi.
 */
export const TaskStatsBar = memo(function TaskStatsBar({
  stats,
  activeFilter,
  onFilterChange,
}: TaskStatsBarProps) {
  const total = (stats.overdue || 0) + (stats.warning || 0) + (stats.inTime || 0) + (stats.doneInTime || 0) + (stats.doneOverdue || 0);

  const CARDS = [
    {
      id: 'overdue',
      label: 'Quá hạn',
      sublabel: 'Đang xử lý',
      value: stats.overdue,
      icon: <AlertCircle className="h-5 w-5" />,
      cls: 'from-rose-500 to-red-600',
      ring: 'ring-rose-400/30',
      bg: 'bg-gradient-to-br from-rose-500 to-red-600',
    },
    {
      id: 'warning',
      label: 'Sắp đến hạn',
      sublabel: 'Đang xử lý',
      value: stats.warning,
      icon: <Clock className="h-5 w-5" />,
      cls: 'from-amber-400 to-orange-500',
      ring: 'ring-amber-400/30',
      bg: 'bg-gradient-to-br from-amber-400 to-orange-500',
    },
    {
      id: 'inTime',
      label: 'Trong hạn',
      sublabel: 'Đang xử lý',
      value: stats.inTime,
      icon: <Calendar className="h-5 w-5" />,
      cls: 'from-blue-500 to-indigo-600',
      ring: 'ring-blue-400/30',
      bg: 'bg-gradient-to-br from-blue-500 to-indigo-600',
    },
    {
      id: 'pendingApproval',
      label: 'Chờ nghiệm thu',
      sublabel: 'Cần phê duyệt',
      value: stats.pendingApproval || 0,
      icon: <Hourglass className="h-5 w-5" />,
      cls: 'from-fuchsia-500 to-purple-600',
      ring: 'ring-fuchsia-400/30',
      bg: 'bg-gradient-to-br from-fuchsia-500 to-purple-600',
    },
    {
      id: 'unassigned',
      label: 'Chưa phân công',
      sublabel: 'Chờ xử lý',
      value: stats.unassigned || 0,
      icon: <ClipboardList className="h-5 w-5" />,
      cls: 'from-slate-400 to-slate-500',
      ring: 'ring-slate-400/30',
      bg: 'bg-gradient-to-br from-slate-400 to-slate-500',
    },
    {
      id: 'doneInTime',
      label: 'Đúng hạn',
      sublabel: 'Đã hoàn thành',
      value: stats.doneInTime,
      icon: <CheckCircle2 className="h-5 w-5" />,
      cls: 'from-emerald-400 to-teal-500',
      ring: 'ring-emerald-400/30',
      bg: 'bg-gradient-to-br from-emerald-400 to-teal-500',
    },
  ];

  return (
    <div className="mb-4">
      {/* Summary bar */}
      {total > 0 && (
        <div className="flex items-center gap-3 mb-3 px-1">
          <span className="text-sm font-black text-slate-600 dark:text-slate-300 shrink-0">
            {total} công việc
          </span>
          <div className="flex-1 flex h-2 rounded-full overflow-hidden gap-0.5">
            {stats.overdue > 0 && (
              <div
                className="bg-rose-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.overdue / total) * 100}%` }}
                title={`Quá hạn: ${stats.overdue}`}
              />
            )}
            {stats.warning > 0 && (
              <div
                className="bg-amber-400 rounded-full transition-all duration-500"
                style={{ width: `${(stats.warning / total) * 100}%` }}
                title={`Sắp đến hạn: ${stats.warning}`}
              />
            )}
            {stats.inTime > 0 && (
              <div
                className="bg-blue-500 rounded-full transition-all duration-500"
                style={{ width: `${(stats.inTime / total) * 100}%` }}
                title={`Trong hạn: ${stats.inTime}`}
              />
            )}
            {stats.doneInTime > 0 && (
              <div
                className="bg-emerald-400 rounded-full transition-all duration-500"
                style={{ width: `${(stats.doneInTime / total) * 100}%` }}
                title={`Đã xong đúng hạn: ${stats.doneInTime}`}
              />
            )}
            {stats.doneOverdue > 0 && (
              <div
                className="bg-orange-400 rounded-full transition-all duration-500"
                style={{ width: `${(stats.doneOverdue / total) * 100}%` }}
                title={`Đã xong trễ hạn: ${stats.doneOverdue}`}
              />
            )}
          </div>
          {activeFilter && (
            <button
              onClick={() => onFilterChange(null)}
              className="text-[10px] font-bold text-slate-400 hover:text-rose-500 transition-colors shrink-0 flex items-center gap-1"
            >
              ✕ Xóa lọc
            </button>
          )}
        </div>
      )}

      {/* Cards grid */}
      <div className="grid grid-cols-3 xl:grid-cols-6 gap-2.5 relative z-10">
        {CARDS.map((card) => (
          <div
            key={card.id}
            onClick={() => onFilterChange(activeFilter === card.id ? null : card.id)}
            className={cn(
              'p-3.5 rounded-xl cursor-pointer transition-all duration-300 flex flex-col gap-2 text-white relative overflow-hidden shadow-md border-2',
              card.bg,
              activeFilter === card.id
                ? `border-white/80 dark:border-slate-800 scale-[1.03] ring-4 ${card.ring}`
                : 'border-transparent opacity-85 hover:opacity-100 hover:-translate-y-0.5 hover:shadow-lg'
            )}
          >
            {/* Background decoration */}
            <div className="absolute -right-4 -top-4 w-16 h-16 bg-white/10 rounded-full blur-xl" />

            <div className="flex items-center justify-between relative z-10">
              <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-white/20 backdrop-blur-sm border border-white/20 shrink-0">
                {card.icon}
              </div>
              <h3 className="text-3xl font-black drop-shadow tracking-tighter">{card.value}</h3>
            </div>

            <div className="relative z-10">
              <p className="text-[9px] font-bold uppercase tracking-wider opacity-75 leading-none">{card.sublabel}</p>
              <p className="text-[11px] font-black uppercase tracking-wide opacity-95 leading-tight mt-0.5">{card.label}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
});
