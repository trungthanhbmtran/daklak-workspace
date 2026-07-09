"use client";

import React, { useEffect, useState } from "react";
import {
  Activity,
  Clock,
  CheckCircle2,
  AlertCircle,
  Play,
  RefreshCcw
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
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { workflowApi, WorkflowInstance } from "@/features/workflow/api";
import { toast } from "sonner";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { useSearchParams } from "next/navigation";
import { WorkflowExecutionHistory } from "./WorkflowExecutionHistory";
import { WorkflowStatusBadge } from "./shared/WorkflowStatusBadge";

const WorkflowInstanceList = () => {
  const [instances, setInstances] = useState<WorkflowInstance[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedInstance, setSelectedInstance] = useState<WorkflowInstance | null>(null);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [page, setPage] = useState(1);
  const pageSize = 10;
  const [totalItems, setTotalItems] = useState(0);

  const handleViewHistory = (instance: WorkflowInstance) => {
    setSelectedInstance(instance);
  };

  const loadInstances = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.listInstances({
        skip: (page - 1) * pageSize,
        take: pageSize,
        search: searchTerm || undefined
      });
      setInstances(res.data || []);
      setTotalItems(res?.meta?.total || (res?.data?.length || 0));
    } catch (error) {
      console.error("Failed to load instances:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadInstances();
  }, [page, searchTerm]);

  const totalPages = Math.ceil(totalItems / pageSize);

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
                return (
                  <tr key={instance.id} className="hover:bg-muted/20 transition-colors group">
                    <td className="px-4 py-4 font-mono text-xs text-muted-foreground whitespace-normal wrap-break-words">
                      {instance.id.substring(0, 13)}...
                    </td>
                    <td className="px-4 py-4 font-medium whitespace-normal wrap-break-words">
                      {instance.workflowName || "Quy trình không xác định"}
                    </td>
                    <td className="px-4 py-4">
                      <WorkflowStatusBadge status={instance.status} />
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

      {totalPages > 1 && (
        <div className="py-4 flex justify-center">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                let pageNum = i + 1;
                if (totalPages > 5 && page > 3) {
                  pageNum = page - 2 + i;
                  if (pageNum > totalPages) pageNum = totalPages - (4 - i);
                }
                return (
                  <PaginationItem key={pageNum}>
                    <PaginationLink
                      isActive={page === pageNum}
                      onClick={() => setPage(pageNum)}
                      className="cursor-pointer"
                    >
                      {pageNum}
                    </PaginationLink>
                  </PaginationItem>
                );
              })}

              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </div>
      )}

      <WorkflowExecutionHistory 
        instance={selectedInstance}
        onClose={() => setSelectedInstance(null)}
      />
    </div>
  );
};

export default WorkflowInstanceList;
