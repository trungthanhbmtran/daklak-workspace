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
import { WorkflowViewer } from "./WorkflowViewer";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

interface WorkflowExecutionHistoryProps {
  instance: WorkflowInstance | null;
  onClose: () => void;
}

export const WorkflowExecutionHistory = ({ instance, onClose }: WorkflowExecutionHistoryProps) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [workflow, setWorkflow] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (instance) {
      const loadData = async () => {
        setIsLoading(true);
        try {
          const [logsRes, wfRes] = await Promise.all([
            workflowApi.getLogs(instance.id).catch(() => []),
            workflowApi.getOne(instance.workflowId).catch(() => null)
          ]);
          
          setLogs(Array.isArray(logsRes) ? logsRes : (logsRes as any)?.logs || []);
          setWorkflow(wfRes);
        } catch (error) {
          toast.error("Không thể tải chi tiết thực thi quy trình");
        } finally {
          setIsLoading(false);
        }
      };
      loadData();
    } else {
      setLogs([]);
      setWorkflow(null);
    }
  }, [instance]);

  return (
    <Sheet open={!!instance} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="w-full sm:max-w-2xl md:max-w-4xl overflow-y-auto">
        <SheetHeader className="mb-6">
          <SheetTitle>Chi tiết thực thi</SheetTitle>
          <SheetDescription>
            {instance?.workflowName} ({instance?.id?.substring(0, 8)})
          </SheetDescription>
        </SheetHeader>

        <Tabs defaultValue="diagram" className="w-full">
          <TabsList className="w-full grid grid-cols-2">
            <TabsTrigger value="diagram">Sơ đồ luồng</TabsTrigger>
            <TabsTrigger value="history">Lịch sử thực thi</TabsTrigger>
          </TabsList>
          
          <TabsContent value="diagram" className="mt-4">
            {isLoading ? (
              <div className="flex justify-center p-8">
                <RefreshCcw className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : workflow ? (
              <div className="border border-border/60 rounded-xl overflow-hidden bg-muted/20">
                <WorkflowViewer workflow={workflow} className="h-[500px]" showMiniMap />
              </div>
            ) : (
              <div className="flex justify-center p-8 text-sm text-muted-foreground">
                Không tìm thấy sơ đồ quy trình
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="history" className="mt-4">
            <div className="space-y-4 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-linear-to-b before:from-transparent before:via-border before:to-transparent">
              {isLoading ? (
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
          </TabsContent>
        </Tabs>
      </SheetContent>
    </Sheet>
  );
};

