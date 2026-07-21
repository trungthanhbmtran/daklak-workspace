/* eslint-disable @typescript-eslint/no-explicit-any */
import React, { useEffect, useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Activity, RefreshCcw } from "lucide-react";
import { workflowApi, WorkflowInstance } from "@/features/workflow/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { WorkflowStatusBadge } from "./shared/WorkflowStatusBadge";

interface WorkflowExecutionHistoryProps {
  instance: WorkflowInstance | null;
  onClose: () => void;
}

export const WorkflowExecutionHistory = ({ instance, onClose }: WorkflowExecutionHistoryProps) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  useEffect(() => {
    if (instance) {
      const loadLogs = async () => {
        setIsLoadingLogs(true);
        try {
          const res = await workflowApi.getLogs(instance.id);
          setLogs(Array.isArray(res) ? res : (res as any)?.logs || []);
         
        } catch (error) {
          toast.error((error as any)?.response?.data?.message || "Không thể tải lịch sử quy trình");
        } finally {
          setIsLoadingLogs(false);
        }
      };
      loadLogs();
    } else {
      setLogs([]);
    }
  }, [instance]);

  return (
    <Sheet open={!!instance} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
        <SheetHeader>
          <SheetTitle>Lịch sử thực thi</SheetTitle>
          <SheetDescription>
            {instance?.workflowName} ({instance?.id?.substring(0, 8)})
          </SheetDescription>
        </SheetHeader>

        <div className="mt-6 space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
          {isLoadingLogs ? (
            <div className="flex justify-center p-8">
              <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : logs.length === 0 ? (
            <p className="text-center text-sm text-muted-foreground py-8">Chưa có lịch sử nào.</p>
          ) : (
            logs.map((log) => (
              <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                  <Activity className="h-4 w-4" />
                </div>
                <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                  <div className="flex items-center justify-between space-x-2 mb-1">
                    <div className="flex items-center gap-2">
                      <WorkflowStatusBadge status={log.action || log.nodeLabel || "Hành động"} />
                    </div>
                    <time className="font-mono text-xs text-indigo-500">
                      {log.createdAt ? format(new Date(log.createdAt), "HH:mm dd/MM", { locale: vi }) : ""}
                    </time>
                  </div>
                  <div className="text-slate-500 text-xs">
                    {log.nodeLabel ? `Bước: ${log.nodeLabel}` : "Hệ thống ghi nhận"}
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
