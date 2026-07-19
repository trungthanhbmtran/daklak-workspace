/* eslint-disable @typescript-eslint/no-explicit-any */
import React from 'react';
import { useWorkflowLogs } from '../hooks';
import { CheckCircle2, Circle, ArrowRightCircle, AlertCircle } from 'lucide-react';
import { format } from 'date-fns';
import { vi } from 'date-fns/locale';
import { Heading, Text } from "@/components/ui/typography";


interface WorkflowTimelineProps {
  instanceId?: string;
}

export function WorkflowTimeline({ instanceId }: WorkflowTimelineProps) {
  const { data: logs, isLoading } = useWorkflowLogs(instanceId);

  if (!instanceId) return null;
  
  if (isLoading) {
    return <div className="p-4 text-sm text-slate-500">Đang tải lịch sử...</div>;
  }

  if (!logs || logs.length === 0) {
    return <div className="p-4 text-sm text-slate-500">Chưa có dữ liệu lịch sử quy trình.</div>;
  }

  const getActionName = (action: string) => {
    const map: Record<string, string> = {
      'ASSIGN': 'Phân công',
      'COMPLETE': 'Hoàn thành',
      'APPROVE': 'Duyệt',
      'RETURN': 'Trả lại',
      'COORDINATE': 'Phối hợp',
      'CHAT': 'Bình luận',
      'EDIT': 'Chỉnh sửa',
      'DELETE': 'Xóa',
      'ADD_SUBTASK': 'Thêm công việc con',
    };
    return map[action] || action;
  };

  const getIcon = (action: string) => {
    switch (action) {
      case 'COMPLETE':
      case 'APPROVE':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'RETURN':
        return <AlertCircle className="w-5 h-5 text-red-500" />;
      case 'ASSIGN':
      case 'COORDINATE':
        return <ArrowRightCircle className="w-5 h-5 text-blue-500" />;
      default:
        return <Circle className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="space-y-4 py-4">
      <Heading level="h3" className="font-semibold text-slate-700 uppercase">Lịch sử kiểm duyệt</Heading>
      <div className="relative border-l border-slate-200 ml-3 space-y-6">
        {logs.map((log: any, index: number) => (
          <div key={log.id || index} className="relative pl-6">
            <Text as="span" className="absolute -left-[11px] top-1 bg-white">
              {getIcon(log.action)}
            </Text>
            <div className="flex flex-col space-y-1">
              <div className="flex items-center justify-between">
                <Text as="span" className="font-medium text-slate-900">
                  {getActionName(log.action)}
                </Text>
                <Text as="span" className="text-slate-500">
                  {format(new Date(log.createdAt), 'HH:mm dd/MM/yyyy', { locale: vi })}
                </Text>
              </div>
              <div className="text-xs text-slate-600">
                Tại bước: <Text as="span" className="font-medium">{log.nodeLabel || 'Bắt đầu'}</Text>
              </div>
              {log.data?.rejectReason && (
                <div className="text-xs text-red-600 mt-1 bg-red-50 p-2 rounded">
                  Lý do: {log.data.rejectReason}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
