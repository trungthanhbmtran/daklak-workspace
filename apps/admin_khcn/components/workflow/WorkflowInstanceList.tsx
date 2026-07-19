"use client";

import React, { useEffect, useState, useCallback } from "react";
import {
  Clock,
  RefreshCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

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
        <Table className="min-w-[800px]">
          <TableHeader className="bg-muted/40 sticky top-0 z-10 shadow-sm outline outline-1 outline-border/40">
            <TableRow>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase">Mã Instance</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase">Quy trình</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase">Trạng thái</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase">Bắt đầu lúc</TableHead>
              <TableHead className="px-4 py-3 font-semibold text-xs uppercase text-right">Thao tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody className="divide-y divide-border/40">
            {isLoading ? (
              Array.from({ length: 5 }).map((_, i) => (
                <TableRow key={i} className="animate-pulse">
                  <TableCell colSpan={5} className="px-4 py-4"><div className="h-4 bg-muted rounded w-full" /></TableCell>
                </TableRow>
              ))
            ) : instances.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="px-4 py-12 text-center text-muted-foreground italic">
                  Chưa có dữ liệu thực thi nào được ghi nhận.
                </TableCell>
              </TableRow>
            ) : (
              <>
                {instances.map((instance) => {
                  return (
                    <TableRow key={instance.id} className="hover:bg-muted/20 transition-colors group">
                      <TableCell className="px-4 py-4 font-mono text-xs text-muted-foreground whitespace-normal wrap-break-words">
                        {instance.id.substring(0, 13)}...
                      </TableCell>
                      <TableCell className="px-4 py-4 font-medium whitespace-normal wrap-break-words">
                        {instance.workflowName || "Quy trình không xác định"}
                      </TableCell>
                      <TableCell className="px-4 py-4">
                        <WorkflowStatusBadge status={instance.status} />
                      </TableCell>
                      <TableCell className="px-4 py-4 text-xs text-muted-foreground">
                        {instance.createdAt ? format(new Date(instance.createdAt), "HH:mm dd/MM/yyyy", { locale: vi }) : "N/A"}
                      </TableCell>
                      <TableCell className="px-4 py-4 text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => handleViewHistory(instance)}
                          title="Xem lịch sử"
                        >
                          <Clock className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  );
                })}
                {isFetchingNextPage && (
                  <TableRow className="animate-pulse">
                    <TableCell colSpan={5} className="px-4 py-4 text-center text-muted-foreground text-xs font-medium">
                      Đang tải thêm...
                    </TableCell>
                  </TableRow>
                )}
              </>
            )}
          </TableBody>
        </Table>
      </div>



      <WorkflowExecutionHistory
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
      />
    </div>
  );
};

export default WorkflowInstanceList;
