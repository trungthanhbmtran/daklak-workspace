'use client';

import React, { memo, useMemo } from 'react';
import { AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TaskStatsBarProps {
  stats: { overdue: number; warning: number; inTime: number; doneInTime: number; doneOverdue: number };
  activeFilter: string | null;
  onFilterChange: (id: string | null) => void;
}

/**
 * Stats cards hiển thị tổng quan theo-trạng thái thời hạn.
 * Memo-ized: chỉ re-render khi stats hoặc activeFilter thay đổi.
 */
export const TaskStatsBar = memo(function TaskStatsBar({
  stats,
  activeFilter,
  onFilterChange,
}: TaskStatsBarProps) {

  const CARDS = [
    { id: 'overdue', label: 'Đang xử lý - Quá hạn', value: stats.overdue, icon: <AlertCircle className="h-6 w-6" />, cls: 'from-rose-500 to-red-600 shadow-rose-200/50' },
    { id: 'warning', label: 'Đang xử lý - Sắp đến hạn', value: stats.warning, icon: <Clock className="h-6 w-6" />, cls: 'from-amber-400 to-orange-500 shadow-amber-200/50' },
    { id: 'inTime', label: 'Đang xử lý - Trong hạn', value: stats.inTime, icon: <Calendar className="h-6 w-6" />, cls: 'from-blue-500 to-indigo-600 shadow-blue-200/50' },
    { id: 'doneInTime', label: 'Đã xong - Đúng hạn', value: stats.doneInTime, icon: <CheckCircle2 className="h-6 w-6" />, cls: 'from-emerald-400 to-teal-500 shadow-emerald-200/50' },
    { id: 'doneOverdue', label: 'Đã xong - Trễ hạn', value: stats.doneOverdue, icon: <AlertCircle className="h-6 w-6" />, cls: 'from-orange-500 to-rose-500 shadow-orange-200/50' },
  ];

  return (
    <div className="grid grid-cols-2 xl:grid-cols-5 gap-4 relative z-10 mb-4">
      {CARDS.map((card) => (
        <div
          key={card.id}
          onClick={() => onFilterChange(activeFilter === card.id ? null : card.id)}
          className={cn(
            "p-5 rounded-xl cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-lg text-white relative overflow-hidden bg-gradient-to-br border-2",
            card.cls,
            activeFilter === card.id
              ? 'border-white dark:border-slate-800 scale-[1.02] ring-4 ring-indigo-500/30'
              : 'border-transparent opacity-90 hover:opacity-100 hover:-translate-y-1'
          )}
        >
          {/* Background decoration */}
          <div className="absolute -right-6 -top-6 w-24 h-24 bg-white/10 rounded-full blur-2xl" />

          <div className="flex justify-between items-start mb-4 relative z-10">
            <div className="w-12 h-12 rounded-lg flex items-center justify-center bg-white/20 shadow-inner backdrop-blur-sm border border-white/20">
              {card.icon}
            </div>
            <h3 className="text-4xl font-black drop-shadow-md tracking-tighter">{card.value}</h3>
          </div>
          <p className="text-[13px] font-black uppercase tracking-wider opacity-90 leading-tight relative z-10 drop-shadow-sm">
            {card.label}
          </p>
        </div>
      ))}
    </div>
  );
});
