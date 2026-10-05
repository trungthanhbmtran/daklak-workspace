"use client";

import React, { useState } from "react";
import {
  Clock,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { ResponsiveTable } from "@/components/shared/responsive-table";

import { WorkflowInstance } from "@/features/workflow/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { WorkflowExecutionHistory } from "./WorkflowExecutionHistory";
import { WorkflowStatusBadge } from "./shared/WorkflowStatusBadge";
import { useWorkflowInstances } from "@/features/workflow/hooks";

const WorkflowInstanceList = () => {
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  
  const { data, fetchNextPage, hasNextPage, isFetching, isFetchingNextPage, refetch, isLoading } = useWorkflowInstances({
    search: searchTerm || undefined
  });

  const instances = React.useMemo(() => {
    return data?.pages.flatMap(page => page.data || []) || [];
  }, [data]);

  const handleViewHistory = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <Search placeholder="Tìm theo ID hoặc tên quy trình..." className="max-w-sm" />
        <Button variant="outline" size="sm" onClick={() => refetch()} disabled={isFetching} className="rounded-lg">
          <RefreshCcw className={`h-4 w-4 mr-2 ${isFetching && !isFetchingNextPage ? "animate-spin" : ""}`} /> Làm mới
        </Button>
      </div>

      <div 
        className="border border-border/60 rounded-xl bg-card w-full max-h-[60vh] overflow-auto relative"
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
            if (!isFetching && hasNextPage) {
              fetchNextPage();
            }
          }
        }}
      >
        <ResponsiveTable
          loading={isLoading}
          data={instances}
          keyExtractor={(instance) => instance.id}
          emptyMessage="Chưa có dữ liệu thực thi nào được ghi nhận."
          columns={[
            {
              header: "Mã Instance",
              cell: (instance) => (
                <div className="font-mono text-xs text-muted-foreground whitespace-normal wrap-break-words">
                  {instance.id.substring(0, 13)}...
                </div>
              ),
            },
            {
              header: "Quy trình",
              cell: (instance) => (
                <div className="font-medium whitespace-normal wrap-break-words">
                  {instance.workflowName || "Quy trình không xác định"}
                </div>
              ),
            },
            {
              header: "Trạng thái",
              cell: (instance) => {
                const isFailed = instance.lastCommandStatus === 'FAILED';
                const isPending = instance.lastCommandStatus === 'PENDING';
                return (
                  <div className="flex flex-col gap-1">
                    <WorkflowStatusBadge status={instance.status} />
                    {isPending && <span className="text-[10px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded-full inline-flex w-fit">Đang đồng bộ...</span>}
                    {isFailed && <span className="text-[10px] text-destructive bg-destructive/10 px-1.5 py-0.5 rounded-full inline-flex w-fit" title={instance.lastCommandError}>Lỗi xử lý</span>}
                  </div>
                );
              },
            },
            {
              header: "Bắt đầu lúc",
              cell: (instance) => (
                <div className="text-xs text-muted-foreground">
                  {instance.createdAt ? format(new Date(instance.createdAt), "HH:mm dd/MM/yyyy", { locale: vi }) : "N/A"}
                </div>
              ),
            },
            {
              header: "Thao tác",
              className: "text-right",
              cell: (instance) => (
                <div className="flex justify-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 w-8 p-0 rounded-lg "
                    onClick={() => handleViewHistory(instance)}
                    title="Xem lịch sử"
                  >
                    <Clock className="h-4 w-4" />
                  </Button>
                </div>
              ),
            },
          ]}
        />
        {isFetchingNextPage && (
          <div className="p-4 text-center text-muted-foreground text-xs font-medium animate-pulse">
            Đang tải thêm...
          </div>
        )}
      </div>



      <WorkflowExecutionHistory
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
      />
    </div>
  );
};

export default WorkflowInstanceList;
