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

  return (
    <Sheet open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Lịch sử cập nhật quy trình</SheetTitle>
          <SheetDescription>
            {workflowName} {workflowId ? `(${workflowId.substring(0, 8)})` : ""}
          </SheetDescription>
        </SheetHeader>

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
      </SheetContent>
    </Sheet>
  );
};
