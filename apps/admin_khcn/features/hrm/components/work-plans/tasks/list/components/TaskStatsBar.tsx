'use client';

import React, { memo, useMemo } from 'react';
import { AlertCircle, Clock, Calendar, CheckCircle2 } from 'lucide-react';

interface TaskStatsBarProps {
  tasks: any[];
  activeFilter: string | null;
  onFilterChange: (id: string | null) => void;
}

/**
 * Stats cards hiển thị tổng quan theo-trạng thái thời hạn.
 * Memo-ized: chỉ re-render khi tasks hoặc activeFilter thay đổi.
 */
export const TaskStatsBar = memo(function TaskStatsBar({
  tasks,
  activeFilter,
  onFilterChange,
}: TaskStatsBarProps) {
  const stats = useMemo(() => {
    let overdue = 0, warning = 0, inTime = 0, doneInTime = 0, doneOverdue = 0;
    tasks.forEach((task: any) => {
      const due  = task.dueDate ? new Date(task.dueDate) : null;
      const now  = new Date();
      if (due) due.setHours(0, 0, 0, 0);
      now.setHours(0, 0, 0, 0);

      if (task.status === 'DONE') {
        const completedDate = new Date(task.completedAt || task.updatedAt || Date.now());
        completedDate.setHours(0, 0, 0, 0);
        if (due && completedDate > due) {
          doneOverdue++;
        } else {
          doneInTime++;
        }
      } else {
        if (!due) { inTime++; }
        else {
          const diff = Math.ceil((due.getTime() - now.getTime()) / 86_400_000);
          if (diff < 0) overdue++;
          else if (diff <= 3) warning++;
          else inTime++;
        }
      }
    });
    return { overdue, warning, inTime, doneInTime, doneOverdue };
  }, [tasks]);

  const CARDS = [
    { id: 'overdue',    label: 'Đang xử lý - Quá hạn',      value: stats.overdue,    icon: <AlertCircle className="h-6 w-6" />,   cls: 'bg-rose-500    hover:bg-rose-600    ring-rose-200'    },
    { id: 'warning',    label: 'Đang xử lý - Sắp đến hạn',  value: stats.warning,    icon: <Clock        className="h-6 w-6" />,   cls: 'bg-amber-500   hover:bg-amber-600   ring-amber-200'   },
    { id: 'inTime',     label: 'Đang xử lý - Trong hạn',     value: stats.inTime,     icon: <Calendar     className="h-6 w-6" />,   cls: 'bg-blue-500    hover:bg-blue-600    ring-blue-200'    },
    { id: 'doneInTime', label: 'Đã xong - Đúng hạn',         value: stats.doneInTime, icon: <CheckCircle2 className="h-6 w-6" />,   cls: 'bg-emerald-500 hover:bg-emerald-600 ring-emerald-200' },
    { id: 'doneOverdue',label: 'Đã xong - Trễ hạn',          value: stats.doneOverdue,icon: <AlertCircle  className="h-6 w-6" />,   cls: 'bg-orange-500  hover:bg-orange-600  ring-orange-200'  },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 xl:grid-cols-5 gap-4 relative z-10">
      {CARDS.map((card) => (
        <div
          key={card.id}
          onClick={() => onFilterChange(activeFilter === card.id ? null : card.id)}
          className={`p-4 rounded-[1.5rem] border cursor-pointer transition-all duration-300 flex flex-col justify-between shadow-sm hover:shadow-md text-white border-transparent ${card.cls} ${activeFilter === card.id ? 'ring-4 shadow-lg scale-105' : 'opacity-95 hover:opacity-100'}`}
        >
          <div className="flex justify-between items-start mb-3">
            <div className="w-12 h-12 rounded-full flex items-center justify-center bg-white/20">
              {card.icon}
            </div>
            <h3 className="text-4xl font-black">{card.value}</h3>
          </div>
          <p className="text-[12px] font-bold uppercase tracking-wider opacity-90 leading-tight">{card.label}</p>
        </div>
      ))}
    </div>
  );
});
