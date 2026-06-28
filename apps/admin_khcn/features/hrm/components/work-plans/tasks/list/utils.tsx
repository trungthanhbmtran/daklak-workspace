import { Badge } from '@/components/ui/badge';
import { Calendar, Clock, CheckCircle2, AlertCircle } from 'lucide-react';

export const getStatusBadge = (status: string, categories?: any[]) => {
  const matched = categories?.find(c => c.code === status);
  const label = matched?.name || status;

  switch (status) {
    case 'DONE':        return <Badge className="bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200">{label}</Badge>;
    case 'IN_PROGRESS': 
    case 'PROCESSING':  return <Badge className="bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200">{label}</Badge>;
    case 'TODO':        
    case 'PENDING':     return <Badge className="bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200">{label}</Badge>;
    case 'PENDING_APPROVAL': return <Badge className="bg-fuchsia-500/10 text-fuchsia-600 hover:bg-fuchsia-500/20 border-fuchsia-200">{label}</Badge>;
    case 'OVERDUE':     return <Badge className="bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200">{label}</Badge>;
    case 'RETURNED':    return <Badge className="bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200">{label}</Badge>;
    case 'REJECTED':
    case 'CANCELED':    return <Badge className="bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-200">{label}</Badge>;
    case 'UNASSIGNED':  return <Badge className="bg-slate-100 text-slate-500 border-slate-200 border-dashed">{label}</Badge>;
    default:            return <Badge variant="outline">{label}</Badge>;
  }
};

export const getPriorityColor = (priority: string) => {
  switch (priority) {
    case 'HIGH':   return 'text-rose-500';
    case 'MEDIUM': return 'text-amber-500';
    case 'LOW':    return 'text-emerald-500';
    default:       return 'text-slate-500';
  }
};

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

export const getPriorityName = (code: string, priorities: any[]): string => {
  const upper = (code || 'MEDIUM').toUpperCase();
  const matched = priorities.find((p: any) => p.code?.toUpperCase() === upper);
  if (matched?.name) return matched.name;
  switch (upper) {
    case 'HIGH':   return 'Cao';
    case 'MEDIUM': return 'Trung bình';
    case 'LOW':    return 'Thấp';
    default:       return upper;
  }
};
