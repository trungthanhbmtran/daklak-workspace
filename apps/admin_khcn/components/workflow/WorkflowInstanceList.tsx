"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCcw,
  ChevronRight,
  Eye
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { workflowApi, WorkflowInstance } from "@/features/workflow/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSearchParams } from "next/navigation";

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: any }> = {
  RUNNING: { label: "Đang chạy", color: "bg-blue-100 text-blue-700 border-blue-200", icon: Play },
  COMPLETED: { label: "Hoàn thành", color: "bg-emerald-100 text-emerald-700 border-emerald-200", icon: CheckCircle2 },
  FAILED: { label: "Lỗi", color: "bg-rose-100 text-rose-700 border-rose-200", icon: AlertCircle },
  WAITING: { label: "Đang chờ", color: "bg-amber-100 text-amber-700 border-amber-200", icon: Clock },
};

const WorkflowInstanceList = () => {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const [logs, setLogs] = useState<any[]>([]);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";

  const handleViewHistory = async (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
    setIsLoadingLogs(true);
    try {
      const res = await workflowApi.getLogs(instance.id);
      setLogs(Array.isArray(res) ? res : (res as any)?.logs || []);
    } catch (error) {
      toast.error("Không thể tải lịch sử quy trình");
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.listInstances({
        skip: 0,
        take: 50,
      });
      setInstances(res.data || []);
    } catch (error) {
      console.error("Failed to load instances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadInstances();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Giám sát Thực thi</h2>
          <p className="text-muted-foreground text-xs mt-1"> Theo dõi trạng thái các quy trình đang chạy trong hệ thống. </p>
        </div>
        <Button variant="outline" size="sm" onClick={loadInstances} disabled={isLoading} className="rounded-lg">
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Làm mới
        </Button>
      </div>

      <Search placeholder="Tìm theo ID hoặc tên quy trình..." className="max-w-sm" />

      <div className="border border-border/60 rounded-xl overflow-x-auto bg-card w-full">
        <table className="w-full table-fixed text-sm text-left">
          <thead className="text-xs text-muted-foreground uppercase bg-muted/40 border-b">
            <tr>
              <th className="px-4 py-3 font-semibold w-[20%]">Mã Instance</th>
              <th className="px-4 py-3 font-semibold w-[35%]">Quy trình</th>
              <th className="px-4 py-3 font-semibold w-[20%]">Trạng thái</th>
              <th className="px-4 py-3 font-semibold w-[15%]">Bắt đầu lúc</th>
              <th className="px-4 py-3 font-semibold text-right w-[10%]">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border/40">
            {isLoading ? (
              Array.from({ length: 3 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  <td colSpan={5} className="px-4 py-4"><div className="h-4 bg-muted rounded w-full" /></td>
                </tr>
              ))
            ) : instances.length === 0 ? (
              <tr>
                <td colSpan={5} className="px-4 py-12 text-center text-muted-foreground italic">
                  Chưa có dữ liệu thực thi nào được ghi nhận.
                </td>
              </tr>
            ) : (
              instances.map((instance) => {
                const status = STATUS_CONFIG[instance.status] || { label: instance.status, color: "bg-muted text-muted-foreground", icon: Activity };
                const StatusIcon = status.icon;

                return (
                  <tr key={instance.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground whitespace-normal wrap-break-words">
                      {instance.id.substring(0, 13)}...
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-normal wrap-break-words">
                      {instance.workflowName || "Quy trình không xác định"}
                    </td>
                    <td className="px-4 py-4">
                      <Badge className={`rounded-md px-1.5 py-0.5 text-[10px] font-bold flex items-center gap-1 w-fit ${status.color}`}>
                        <StatusIcon className="h-3 w-3" />
                        {status.label}
                      </Badge>
                    </td>
                    <td className="px-4 py-4 text-xs text-muted-foreground">
                      {instance.createdAt ? format(new Date(instance.createdAt), "HH:mm dd/MM/yyyy", { locale: vi }) : "N/A"}
                    </td>
                    <td className="px-4 py-4 text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                        onClick={() => handleViewHistory(instance)}
                        title="Xem lịch sử"
                      >
                        <Clock className="h-4 w-4" />
                      </Button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <Sheet open={!!selectedInstance} onOpenChange={(open) => !open && setSelectedInstance(null)}>
        <SheetContent className="w-[400px] sm:w-[540px] overflow-y-auto">
          <SheetHeader>
            <SheetTitle>Lịch sử thực thi</SheetTitle>
            <SheetDescription>
              {selectedInstance?.workflowName} ({selectedInstance?.id?.substring(0, 8)})
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
              logs.map((log, index) => (
                <div key={log.id} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full border border-white bg-slate-100 group-[.is-active]:bg-primary text-slate-500 group-[.is-active]:text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2">
                    <Activity className="h-4 w-4" />
                  </div>
                  <div className="w-[calc(100%-4rem)] md:w-[calc(50%-2.5rem)] p-4 rounded border border-slate-200 bg-white shadow-sm">
                    <div className="flex items-center justify-between space-x-2 mb-1">
                      <div className="font-bold text-slate-900 text-sm">{log.action || log.nodeLabel || "Hành động"}</div>
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
    </div>
  );
};

export default WorkflowInstanceList;
