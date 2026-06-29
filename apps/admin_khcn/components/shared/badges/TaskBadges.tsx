'use client';

import React from 'react';
import { Badge } from '@/components/ui/badge';
import { useGetCategoryByGroup } from '@/features/system-admin/categories/hooks/useCategoryApi';
import { Target, User, Users, Eye, ClipboardList, CheckCircle2, Clock, RotateCcw, AlertTriangle, Circle } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- TASK STATUS ---
export const TASK_STATUS_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string; dot: string }> = {
  TEMPLATE: { label: 'Chờ giao', icon: <Circle className="w-3.5 h-3.5" />, cls: 'bg-slate-100/80 text-slate-700 border-slate-200', dot: 'bg-slate-400' },
  TODO: { label: 'Chờ thực hiện', icon: <Clock className="w-3.5 h-3.5" />, cls: 'bg-blue-50/80 text-blue-700 border-blue-200', dot: 'bg-blue-500' },
  IN_PROGRESS: { label: 'Đang thực hiện', icon: <RotateCcw className="w-3.5 h-3.5" />, cls: 'bg-amber-50/80 text-amber-700 border-amber-200', dot: 'bg-amber-500' },
  REVIEWING: { label: 'Chờ duyệt', icon: <Clock className="w-3.5 h-3.5" />, cls: 'bg-violet-50/80 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  DONE: { label: 'Hoàn thành', icon: <CheckCircle2 className="w-3.5 h-3.5" />, cls: 'bg-emerald-50/80 text-emerald-700 border-emerald-200', dot: 'bg-emerald-500' },
  OVERDUE: { label: 'Quá hạn', icon: <AlertTriangle className="w-3.5 h-3.5" />, cls: 'bg-rose-50/80 text-rose-700 border-rose-200', dot: 'bg-rose-500' },
  RETURNED: { label: 'Trả lại', icon: <RotateCcw className="w-3.5 h-3.5" />, cls: 'bg-orange-50/80 text-orange-700 border-orange-200', dot: 'bg-orange-500' },
};

interface TaskStatusBadgeProps {
  code: string;
  fallbackLabel?: string;
  className?: string;
  showIcon?: boolean;
}

export function TaskStatusBadge({ code, fallbackLabel, className, showIcon = false }: TaskStatusBadgeProps) {
  const { data: statusRes }: any = useGetCategoryByGroup('TASK_STATUS');
  const categories = statusRes?.data || [];
  const matched = categories.find((c: any) => c.code === code);
  
  const config = TASK_STATUS_CONFIG[code] || TASK_STATUS_CONFIG.TODO;
  const label = matched?.name || config?.label || fallbackLabel || code;

  // If we just want the simple color badge (from utils.tsx)
  if (!showIcon) {
    switch (code) {
      case 'DONE':        return <Badge className={cn("bg-emerald-500/10 text-emerald-600 hover:bg-emerald-500/20 border-emerald-200", className)}>{label}</Badge>;
      case 'IN_PROGRESS': 
      case 'PROCESSING':  return <Badge className={cn("bg-amber-500/10 text-amber-600 hover:bg-amber-500/20 border-amber-200", className)}>{label}</Badge>;
      case 'TODO':        
      case 'PENDING':     return <Badge className={cn("bg-blue-500/10 text-blue-600 hover:bg-blue-500/20 border-blue-200", className)}>{label}</Badge>;
      case 'PENDING_APPROVAL': return <Badge className={cn("bg-fuchsia-500/10 text-fuchsia-600 hover:bg-fuchsia-500/20 border-fuchsia-200", className)}>{label}</Badge>;
      case 'OVERDUE':     return <Badge className={cn("bg-rose-500/10 text-rose-600 hover:bg-rose-500/20 border-rose-200", className)}>{label}</Badge>;
      case 'RETURNED':    return <Badge className={cn("bg-orange-500/10 text-orange-600 hover:bg-orange-500/20 border-orange-200", className)}>{label}</Badge>;
      case 'REJECTED':
      case 'CANCELED':    return <Badge className={cn("bg-slate-500/10 text-slate-600 hover:bg-slate-500/20 border-slate-200", className)}>{label}</Badge>;
      case 'UNASSIGNED':  return <Badge className={cn("bg-slate-100 text-slate-500 border-slate-200 border-dashed", className)}>{label}</Badge>;
      default:            return <Badge variant="outline" className={className}>{label}</Badge>;
    }
  }

  // If we want the icon + colored background (from GlobalTaskTree)
  return (
    <Badge variant="outline" className={cn('text-[11px] font-bold border px-2 py-0.5 gap-1.5 shadow-sm', config.cls, className)}>
      {config.icon} {label}
    </Badge>
  );
}

// --- TASK PRIORITY ---
interface TaskPriorityBadgeProps {
  code: string;
  fallbackLabel?: string;
  className?: string;
}

export function TaskPriorityBadge({ code, fallbackLabel, className }: TaskPriorityBadgeProps) {
  const { data: prioritiesRes }: any = useGetCategoryByGroup('TASK_PRIORITY');
  const categories = prioritiesRes?.data || [];
  const matched = categories.find((c: any) => c.code === code);
  const label = matched?.name || fallbackLabel || code;

  let colorCls = 'bg-slate-50 text-slate-600 border-slate-200';
  let dotCls = 'bg-slate-500';
  
  if (code === 'HIGH') {
    colorCls = 'bg-rose-50 text-rose-600 border-rose-200';
    dotCls = 'bg-rose-500';
  } else if (code === 'MEDIUM') {
    colorCls = 'bg-amber-50 text-amber-600 border-amber-200';
    dotCls = 'bg-amber-500';
  } else if (code === 'LOW') {
    colorCls = 'bg-emerald-50 text-emerald-600 border-emerald-200';
    dotCls = 'bg-emerald-500';
  }

  return (
    <Badge variant="outline" className={cn("text-[10px] uppercase tracking-widest font-black gap-1.5 shadow-sm", colorCls, className)}>
      <div className={cn("w-1.5 h-1.5 rounded-full", dotCls)} />
      {label}
    </Badge>
  );
}

// --- TASK ROLE ---
export type TaskRoleFilter = 'ALL' | 'UNASSIGNED' | 'ASSIGNEE' | 'OWNER' | 'APPROVER' | 'COORDINATOR';

export const TASK_ROLE_META: Record<TaskRoleFilter, { label: string; icon: React.ReactNode; color: string }> = {
  ALL: { label: 'Tất cả công việc', icon: <ClipboardList className="w-4 h-4" />, color: 'text-slate-600 bg-slate-100 border-slate-200' },
  ASSIGNEE: { label: 'Việc tôi làm', icon: <CheckCircle2 className="w-4 h-4" />, color: 'text-indigo-600 bg-indigo-100 border-indigo-200' },
  OWNER: { label: 'Việc tôi giao', icon: <User className="w-4 h-4" />, color: 'text-emerald-600 bg-emerald-100 border-emerald-200' },
  APPROVER: { label: 'Tôi giám sát', icon: <Eye className="w-4 h-4" />, color: 'text-rose-600 bg-rose-100 border-rose-200' },
  COORDINATOR: { label: 'Tôi phối hợp', icon: <Users className="w-4 h-4" />, color: 'text-amber-600 bg-amber-100 border-amber-200' },
  UNASSIGNED: { label: 'Chờ phân công', icon: <Target className="w-4 h-4" />, color: 'text-orange-600 bg-orange-100 border-orange-200' },
};

interface TaskRoleBadgeProps {
  role: TaskRoleFilter;
  className?: string;
  showIcon?: boolean;
}

export function TaskRoleBadge({ role, className, showIcon = true }: TaskRoleBadgeProps) {
  const meta = TASK_ROLE_META[role];
  if (!meta) return null;
  
  return (
    <Badge variant="outline" className={cn('text-[11px] font-bold px-2 py-0.5 gap-1.5 shadow-sm border', meta.color, className)}>
      {showIcon && meta.icon}
      {meta.label}
    </Badge>
  );
}
