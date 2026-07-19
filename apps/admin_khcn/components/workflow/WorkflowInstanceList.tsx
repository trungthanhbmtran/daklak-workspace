"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Clock,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { ResponsiveTable } from "@/components/shared/responsive-table";

// Xóa Pagination
import { workflowApi, WorkflowInstance } from "@/features/workflow/api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { WorkflowExecutionHistory } from "./WorkflowExecutionHistory";
import { WorkflowStatusBadge } from "./shared/WorkflowStatusBadge";

const WorkflowInstanceList = () => {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isFetchingNextPage, setIsFetchingNextPage] = useState(false);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [page, setPage] = useState(1);
  const pageSize = 15;
  const [totalItems, setTotalItems] = useState(0);

  const handleViewHistory = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
  };

  const loadInstances = useCallback(async (targetPage: number) => {
    try {
      const isLoadMore = targetPage > 1;
      if (isLoadMore) setIsFetchingNextPage(true);
      else setIsLoading(true);

      const res = await workflowApi.listInstances({
        skip: (targetPage - 1) * pageSize,
        take: pageSize,
        search: searchTerm || undefined
      });
      
      if (isLoadMore) {
        setInstances(prev => [...prev, ...(res.data || [])]);
      } else {
        setInstances(res.data || []);
      }
      setTotalItems(res?.meta?.total || (res?.data?.length || 0));
    } catch (error) {
      console.error("Failed to load instances:", error);
    } finally {
      setIsLoading(false);
      setIsFetchingNextPage(false);
    }
  }, [searchTerm]);

  useEffect(() => {
    setPage(1);
    loadInstances(1);
  }, [searchTerm, loadInstances]);

  useEffect(() => {
    if (page > 1) {
      loadInstances(page);
    }
  }, [page, loadInstances]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight">Giám sát Thực thi</h2>
          <p className="text-muted-foreground text-xs mt-1"> Theo dõi trạng thái các quy trình đang chạy trong hệ thống. </p>
        </div>
        <Button variant="outline" size="sm" onClick={() => { setPage(1); loadInstances(1); }} disabled={isLoading || isFetchingNextPage} className="rounded-lg">
          <RefreshCcw className={`h-4 w-4 mr-2 ${isLoading ? "animate-spin" : ""}`} /> Làm mới
        </Button>
      </div>

      <Search placeholder="Tìm theo ID hoặc tên quy trình..." className="max-w-sm" />

      <div 
        className="border border-border/60 rounded-xl bg-card w-full max-h-[60vh] overflow-auto relative"
        onScroll={(e) => {
          const target = e.currentTarget;
          if (target.scrollHeight - target.scrollTop - target.clientHeight < 50) {
            if (!isLoading && !isFetchingNextPage && instances.length < totalItems) {
              setPage(prev => prev + 1);
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
              cell: (instance) => <WorkflowStatusBadge status={instance.status} />,
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
                    className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
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
