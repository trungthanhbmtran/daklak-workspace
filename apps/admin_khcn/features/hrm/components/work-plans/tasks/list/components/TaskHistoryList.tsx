import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { hrmTasksApi } from '@/features/hrm/api/tasks.api';
import { Loader2 } from 'lucide-react';

export function TaskHistoryList({ taskId }: { taskId: number }) {
  const { data, isLoading } = useQuery({
    queryKey: ['taskHistory', taskId],
    queryFn: () => hrmTasksApi.getHistory(taskId),
    enabled: !!taskId,
  });

  if (isLoading) return <div className="flex justify-center p-4"><Loader2 className="w-5 h-5 animate-spin text-muted-foreground" /></div>;

  const history = data?.data || [];
  
  if (history.length === 0) return <div className="text-sm text-muted-foreground p-4 text-center">Chưa có thay đổi nào.</div>;

  return (
    <div className="space-y-4 p-4">
      <h4 className="text-sm font-bold text-slate-700 dark:text-slate-200 uppercase tracking-wider">Lịch sử Cập nhật</h4>
      <div className="relative border-l border-slate-200 dark:border-slate-800 ml-3 space-y-6">
        {history.map((item: any) => (
          <div key={item.id} className="relative pl-6">
            <div className="absolute -left-1.5 top-1.5 w-3 h-3 rounded-full bg-indigo-500 ring-4 ring-slate-50 dark:ring-slate-900" />
            <div className="text-[13px]">
              <span className="font-semibold text-slate-900 dark:text-slate-100">{item.actorCode || 'Hệ thống'}</span>
              <span className="text-slate-500 mx-2">đã</span>
              <span className="font-medium text-indigo-600 dark:text-indigo-400">{item.action}</span>
            </div>
            <div className="text-[11px] text-slate-400 mt-1">
              {new Date(item.createdAt).toLocaleString('vi-VN')}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
