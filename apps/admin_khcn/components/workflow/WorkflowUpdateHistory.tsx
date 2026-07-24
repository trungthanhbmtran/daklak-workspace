import React from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";

interface WorkflowUpdateHistoryProps {
  isOpen: boolean;
  onClose: () => void;
  workflowId?: string;
  workflowName: string;
}

export const WorkflowUpdateHistory = ({ isOpen, onClose, workflowId, workflowName }: WorkflowUpdateHistoryProps) => {
  // Mock data for workflow update history since there's no specific API for it yet
  const logs = [
    {
      id: "1",
      action: "Đã cập nhật quy trình",
      createdAt: new Date().toISOString(),
    },
    {
      id: "2",
      action: "Khởi tạo quy trình mới",
      createdAt: new Date(Date.now() - 86400000).toISOString(),
    }
  ];

  if (!isOpen) return null;

  return (
    <aside className="absolute top-0 right-0 z-50 flex h-full w-[400px] sm:w-[540px] flex-col bg-background shadow-2xl border-l border-border transition-all duration-300 animate-in slide-in-from-right">
      <div className="flex flex-col gap-1.5 p-4 border-b border-border/60">
        <div className="flex items-center justify-between">
          <h2 className="font-semibold text-foreground">Lịch sử cập nhật quy trình</h2>
          <button onClick={onClose} className="rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
            <span className="sr-only">Close</span>
          </button>
        </div>
        <p className="text-sm text-muted-foreground">
          {workflowName} {workflowId ? `(${workflowId.substring(0, 8)})` : ""}
        </p>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        <div className="mt-6 space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
          {logs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Chưa có lịch sử cập nhật nào.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="font-semibold text-sm">
                      {log.action}
                    </div>
                    <time className="font-mono text-xs text-indigo-500">
                      {log.createdAt ? format(new Date(log.createdAt), "HH:mm dd/MM", { locale: vi }) : ""}
                    </time>
                  </div>
                  <div className="text-slate-500 text-xs mt-1">
                    Hệ thống ghi nhận
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </aside>
  );
};
