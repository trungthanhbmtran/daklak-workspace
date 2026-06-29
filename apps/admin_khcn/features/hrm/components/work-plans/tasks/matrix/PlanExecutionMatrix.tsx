"use client";

import React, { useMemo } from 'react';
import { cn } from '@/lib/utils';
import { CheckCircle2, AlertTriangle, Clock, Circle, RotateCcw, Download } from 'lucide-react';
import { Button } from '@/components/ui/button';

// ─── Types ───────────────────────────────────────────────────────────────────

interface MatrixRow {
  stt: string;           // "1", "1.1", "1.1.2"
  depth: number;
  task: any;
}

// ─── Utils ───────────────────────────────────────────────────────────────────

function flattenTree(nodes: any[], prefix = '', depth = 0): MatrixRow[] {
  const rows: MatrixRow[] = [];
  nodes.forEach((node, idx) => {
    const stt = prefix ? `${prefix}.${idx + 1}` : `${idx + 1}`;
    rows.push({ stt, depth, task: node });
    if (node.children?.length) {
      rows.push(...flattenTree(node.children, stt, depth + 1));
    }
  });
  return rows;
}

import { TaskStatusBadge, TASK_STATUS_CONFIG } from '@/components/shared/badges/TaskBadges';

// Row background theo depth
const DEPTH_BG = [
  'bg-indigo-50/60',
  'bg-white',
  'bg-slate-50/50',
  'bg-white',
  'bg-slate-50/30',
];

// Font weight theo depth
const DEPTH_FW = [
  'font-bold text-slate-900',
  'font-semibold text-slate-800',
  'font-medium text-slate-700',
  'font-normal text-slate-600',
  'font-normal text-slate-500',
];

// ─── Export CSV ──────────────────────────────────────────────────────────────

function exportCsv(rows: MatrixRow[], planTitle: string) {
  const headers = ['STT', 'Nội dung', 'Người thực hiện', 'Người giao', 'Hạn hoàn thành', 'Trạng thái'];
  const lines = [
    headers.join(','),
    ...rows.map(r => [
      r.stt,
      `"${r.task.title.replace(/"/g, '""')}"`,
      `"${r.task.assigneeName || r.task.assigneeCode || ''}"`,
      `"${r.task.assignerName || r.task.assignerCode || ''}"`,
      r.task.dueDate ? new Date(r.task.dueDate).toLocaleDateString('vi-VN') : '',
      TASK_STATUS_CONFIG[r.task.status]?.label || r.task.status,
    ].join(','))
  ];

  const blob = new Blob(['\uFEFF' + lines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `ke-hoach-${planTitle.slice(0, 30).replace(/\s+/g, '-')}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Component ────────────────────────────────────────────────────────────────

interface PlanExecutionMatrixProps {
  tasks: any[];       // Flat list từ API
  planTitle: string;
  isLoading?: boolean;
}

export function PlanExecutionMatrix({ tasks, planTitle, isLoading }: PlanExecutionMatrixProps) {
  const rows = useMemo(() => {
    return flattenTree(tasks || []);
  }, [tasks]);

  // Thống kê nhanh
  const stats = useMemo(() => {
    const total = rows.length;
    const done = rows.filter(r => r.task.status === 'DONE').length;
    const overdue = rows.filter(r => r.task.status === 'OVERDUE').length;
    const inProgress = rows.filter(r => r.task.status === 'IN_PROGRESS' || r.task.status === 'PROCESSING').length;
    return { total, done, overdue, inProgress, pct: total > 0 ? Math.round((done / total) * 100) : 0 };
  }, [rows]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20 text-slate-400">
        <div className="animate-spin w-5 h-5 border-2 border-slate-300 border-t-indigo-500 rounded-full mr-2" />
        Đang tải...
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Stats bar */}
      <div className="grid grid-cols-4 gap-3">
        {[
          { label: 'Tổng nhiệm vụ', value: stats.total, cls: 'text-slate-700' },
          { label: 'Hoàn thành', value: stats.done, cls: 'text-emerald-600' },
          { label: 'Đang thực hiện', value: stats.inProgress, cls: 'text-amber-600' },
          { label: 'Quá hạn', value: stats.overdue, cls: 'text-red-600' },
        ].map(s => (
          <div key={s.label} className="bg-white rounded-xl border border-slate-200 px-4 py-3 text-center shadow-sm">
            <p className={cn('text-2xl font-black', s.cls)}>{s.value}</p>
            <p className="text-xs text-slate-500 mt-0.5">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="bg-white rounded-xl border border-slate-200 px-4 py-3 shadow-sm">
        <div className="flex items-center justify-between mb-2 text-sm">
          <span className="font-semibold text-slate-700">Tiến độ tổng thể</span>
          <span className="font-black text-slate-900">{stats.pct}%</span>
        </div>
        <div className="h-2.5 bg-slate-100 rounded-full overflow-hidden">
          <div
            className="h-full bg-linear-to-br from-indigo-500 to-emerald-500 rounded-full transition-all duration-500"
            style={{ width: `${stats.pct}%` }}
          />
        </div>
      </div>

      {/* Matrix table */}
      <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-sm">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-100 bg-slate-50/80">
          <div>
            <h3 className="font-bold text-slate-800 text-sm">Bảng tổng hợp kế hoạch</h3>
            <p className="text-xs text-slate-500">{rows.length} dòng · xuất được theo chuẩn Excel</p>
          </div>
          <Button
            variant="outline"
            size="sm"
            className="h-8 px-3 text-xs gap-1 rounded-full border-slate-200 text-slate-600 hover:text-slate-900"
            onClick={() => exportCsv(rows, planTitle)}
          >
            <Download className="w-3.5 h-3.5" /> Xuất CSV
          </Button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full min-w-[700px] text-sm">
            <thead>
              <tr className="bg-slate-800 text-white text-xs uppercase tracking-wider">
                <th className="w-16 px-3 py-3 text-center font-bold">STT</th>
                <th className="px-4 py-3 text-left font-bold">Nội dung nhiệm vụ</th>
                <th className="w-40 px-3 py-3 text-left font-bold">Người thực hiện</th>
                <th className="w-36 px-3 py-3 text-left font-bold">Người giao</th>
                <th className="w-28 px-3 py-3 text-center font-bold">Hạn hoàn thành</th>
                <th className="w-32 px-3 py-3 text-center font-bold">Trạng thái</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-400 text-sm">
                    Chưa có nhiệm vụ nào được tạo.
                  </td>
                </tr>
              ) : (
                rows.map((row, i) => {
                  const bgCls = DEPTH_BG[Math.min(row.depth, DEPTH_BG.length - 1)];
                  const fwCls = DEPTH_FW[Math.min(row.depth, DEPTH_FW.length - 1)];
                  const isOverdue = row.task.dueDate && new Date(row.task.dueDate) < new Date() && row.task.status !== 'DONE';

                  return (
                    <tr
                      key={row.task.id}
                      className={cn(
                        'border-b border-slate-100 hover:bg-indigo-50/40 transition-colors',
                        bgCls,
                        i % 2 === 1 && row.depth > 0 && 'bg-opacity-50'
                      )}
                    >
                      {/* STT */}
                      <td className="px-3 py-2.5 text-center">
                        <span className={cn(
                          'text-xs font-mono',
                          row.depth === 0 ? 'font-black text-indigo-700 text-sm' : 'text-slate-400'
                        )}>
                          {row.stt}
                        </span>
                      </td>

                      {/* Nội dung — thụt lề theo depth */}
                      <td
                        className="px-4 py-2.5"
                        style={{ paddingLeft: `${16 + row.depth * 20}px` }}
                      >
                        <span className={cn(fwCls, 'leading-snug block')}>
                          {row.task.title}
                        </span>
                        {row.task.description && (
                          <span className="text-xs text-slate-400 mt-0.5 block truncate max-w-xs">
                            {row.task.description}
                          </span>
                        )}
                      </td>

                      {/* Người thực hiện */}
                      <td className="px-3 py-2.5">
                        {row.task.assigneeCode && row.task.assigneeCode !== 'UNASSIGNED' ? (
                          <div className="flex items-center gap-1.5">
                            <span className="w-5 h-5 rounded-full bg-indigo-100 flex items-center justify-center text-[9px] text-indigo-700 font-bold shrink-0">
                              {(row.task.assigneeName || row.task.assigneeCode).charAt(0).toUpperCase()}
                            </span>
                            <span className="text-xs text-slate-700 font-medium truncate max-w-[120px]">
                              {row.task.assigneeName || row.task.assigneeCode}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-slate-300 italic">Chưa giao</span>
                        )}
                      </td>

                      {/* Người giao */}
                      <td className="px-3 py-2.5">
                        <span className="text-xs text-slate-500 truncate max-w-[120px] block">
                          {row.task.assignerName || row.task.assignerCode || '—'}
                        </span>
                      </td>

                      {/* Hạn */}
                      <td className="px-3 py-2.5 text-center">
                        {row.task.dueDate ? (
                          <span className={cn(
                            'text-xs font-medium',
                            isOverdue ? 'text-red-600 font-bold' : 'text-slate-600'
                          )}>
                            {new Date(row.task.dueDate).toLocaleDateString('vi-VN')}
                            {isOverdue && <span className="ml-1">⚠</span>}
                          </span>
                        ) : (
                          <span className="text-xs text-slate-300">—</span>
                        )}
                      </td>

                      {/* Trạng thái */}
                      <td className="px-3 py-2.5 text-center">
                        <TaskStatusBadge code={row.task.status} className="font-semibold text-[11px]" />
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
