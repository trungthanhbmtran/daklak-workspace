import React from 'react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertCircle, Clock, FileText, XCircle } from 'lucide-react';

// ─── DOSSIER STATUS ───

export type DossierStatus = 'PROCESSING' | 'WAITING_FOR_DOCS' | 'COMPLETED' | 'REJECTED' | 'NEW' | string;

export const DOSSIER_STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  PROCESSING: { label: 'Đang xử lý', cls: 'bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200', icon: <Clock className="w-3.5 h-3.5" /> },
  WAITING_FOR_DOCS: { label: 'Chờ bổ sung', cls: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200', icon: <AlertCircle className="w-3.5 h-3.5" /> },
  COMPLETED: { label: 'Hoàn thành', cls: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200', icon: <CheckCircle2 className="w-3.5 h-3.5" /> },
  REJECTED: { label: 'Từ chối', cls: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200', icon: <XCircle className="w-3.5 h-3.5" /> },
  NEW: { label: 'Mới tiếp nhận', cls: 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200', icon: <FileText className="w-3.5 h-3.5" /> },
};

export function DossierStatusBadge({ code, className, showIcon = false }: { code: string; className?: string; showIcon?: boolean }) {
  const cfg = DOSSIER_STATUS_CONFIG[code] || DOSSIER_STATUS_CONFIG.NEW;
  return (
    <Badge className={cn('font-semibold', cfg.cls, className)}>
      {showIcon && <span className="mr-1.5">{cfg.icon}</span>}
      {cfg.label}
    </Badge>
  );
}

// ─── DOSSIER COMPONENT STATUS ───

export type DossierComponentStatus = 'VALID' | 'MISSING' | 'PENDING_REVIEW' | string;

export const DOSSIER_COMPONENT_STATUS_CONFIG: Record<string, { label: string; cls: string; icon: React.ReactNode }> = {
  VALID: { label: 'Hợp lệ', cls: 'bg-emerald-100 text-emerald-700 hover:bg-emerald-100 border-emerald-200', icon: <CheckCircle2 className="w-5 h-5 text-emerald-500" /> },
  MISSING: { label: 'Còn thiếu', cls: 'bg-rose-100 text-rose-700 hover:bg-rose-100 border-rose-200', icon: <AlertCircle className="w-5 h-5 text-rose-500" /> },
  PENDING_REVIEW: { label: 'Chờ duyệt', cls: 'bg-amber-100 text-amber-700 hover:bg-amber-100 border-amber-200', icon: <AlertCircle className="w-5 h-5 text-amber-500" /> },
  UNKNOWN: { label: 'Chưa rõ', cls: 'bg-slate-100 text-slate-700 hover:bg-slate-100 border-slate-200', icon: <FileText className="w-5 h-5 text-slate-400" /> },
};

export function DossierComponentStatusBadge({ code, className }: { code: string; className?: string }) {
  const cfg = DOSSIER_COMPONENT_STATUS_CONFIG[code] || DOSSIER_COMPONENT_STATUS_CONFIG.UNKNOWN;
  return (
    <Badge className={cn('font-semibold', cfg.cls, className)}>
      {cfg.label}
    </Badge>
  );
}

export function DossierComponentStatusIcon({ code, className }: { code: string; className?: string }) {
  const cfg = DOSSIER_COMPONENT_STATUS_CONFIG[code] || DOSSIER_COMPONENT_STATUS_CONFIG.UNKNOWN;
  return (
    <span className={cn('flex items-center justify-center shrink-0', className)}>
      {cfg.icon}
    </span>
  );
}
