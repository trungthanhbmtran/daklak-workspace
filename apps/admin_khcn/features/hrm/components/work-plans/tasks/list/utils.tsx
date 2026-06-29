import React from 'react';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export type DueDateInfo = {
  label: string;
  text: string;
  color: string;
  bg: string;
  border: string;
  icon: React.ReactNode;
};

export const getDueDateDisplay = (
  dueDate: string | undefined | null,
  status: string,
): DueDateInfo => {
  if (!dueDate) return {
    label: 'Không có thời hạn', text: '',
    color: 'text-slate-500', bg: 'bg-slate-50 dark:bg-slate-800/50',
    border: 'border-slate-100 dark:border-slate-800',
    icon: <Calendar className="w-4 h-4" />,
  };
  if (status === 'DONE') return {
    label: new Date(dueDate).toLocaleDateString('vi-VN'), text: 'Đã hoàn thành',
    color: 'text-emerald-600 dark:text-emerald-400', bg: 'bg-emerald-50 dark:bg-emerald-900/10',
    border: 'border-emerald-200 dark:border-emerald-800/30',
    icon: <CheckCircle2 className="w-4 h-4" />,
  };

  const due = new Date(dueDate);
  const now = new Date();
  due.setHours(0, 0, 0, 0);
  now.setHours(0, 0, 0, 0);
  const diffDays = Math.ceil((due.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays < 0) return {
    label: due.toLocaleDateString('vi-VN'),
    text: `Quá hạn ${Math.abs(diffDays)} ngày`,
    color: 'text-rose-600 dark:text-rose-400', bg: 'bg-rose-50 dark:bg-rose-900/10',
    border: 'border-rose-200 dark:border-rose-800/30',
    icon: <AlertCircle className="w-4 h-4" />,
  };
  if (diffDays === 0) return {
    label: due.toLocaleDateString('vi-VN'), text: 'Hạn cuối hôm nay!',
    color: 'text-orange-600 dark:text-orange-400', bg: 'bg-orange-50 dark:bg-orange-900/10',
    border: 'border-orange-200 dark:border-orange-800/30',
    icon: <Clock className="w-4 h-4 animate-pulse" />,
  };
  if (diffDays <= 3) return {
    label: due.toLocaleDateString('vi-VN'),
    text: `Còn ${diffDays} ngày (Sắp đến hạn)`,
    color: 'text-amber-600 dark:text-amber-400', bg: 'bg-amber-50 dark:bg-amber-900/10',
    border: 'border-amber-200 dark:border-amber-800/30',
    icon: <Clock className="w-4 h-4" />,
  };
  return {
    label: due.toLocaleDateString('vi-VN'), text: `Còn ${diffDays} ngày`,
    color: 'text-indigo-600 dark:text-indigo-400', bg: 'bg-indigo-50/50 dark:bg-indigo-900/10',
    border: 'border-indigo-100 dark:border-indigo-800/30',
    icon: <Calendar className="w-4 h-4" />,
  };
};
