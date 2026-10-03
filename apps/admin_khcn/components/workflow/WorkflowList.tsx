"use client";

import { useEffect, useState, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { workflowApi, type Workflow } from "@/features/workflow/api";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

import { WorkflowCard } from "./list/WorkflowCard";
import { WorkflowDetailSheet } from "./list/WorkflowDetailSheet";

interface WorkflowListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}

export default function WorkflowList({ onEdit, onCreate }: WorkflowListProps) {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Pagination & Search
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  // Modals state
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Apply Module state
  const [mappingWorkflow, setMappingWorkflow] = useState<Workflow | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [workflowModules, setWorkflowModules] = useState<{ id: string; code: string; name: string }[]>([]);

  // Test Run state
  const [testRunWorkflow, setTestRunWorkflow] = useState<Workflow | null>(null);
  const [testContext, setTestContext] = useState("{\n  \n}");
  const [isTestRunning, setIsTestRunning] = useState(false);

  const getModuleName = (code?: string) => {
    if (!code) return null;
    const match = workflowModules.find((m) => m.code === code);
    return match ? match.name : code;
  };

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.list({
        skip: (page - 1) * pageSize,
        take: pageSize,
        search: searchTerm || undefined,
      });
      if (res?.data) {
        setWorkflows(res.data);
        setTotalItems(res.meta?.total || res.data.length || 0);
      }
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Không thể tải danh sách quy trình");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadWorkflows();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, pageSize, searchTerm]);

  useEffect(() => {
    workflowApi.getModules().then((modules) => {
      if (Array.isArray(modules)) {
        setWorkflowModules(modules);
        if (modules.length > 0 && !selectedModule) {
          setSelectedModule(modules[0].code);
        }
      }
    }).catch(() => {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    setIsDeleting(true);
    try {
      await workflowApi.delete(itemToDelete);
      toast.success("Đã xóa quy trình");
      loadWorkflows();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa quy trình");
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setItemToDelete(null);
    }
  };

  const handleApplyModule = async () => {
    if (!mappingWorkflow) return;
    try {
      await workflowApi.applyModule(mappingWorkflow.id, selectedModule);
      toast.success("Đã áp dụng và kích hoạt quy trình thành công!");
      setMappingWorkflow(null);
      loadWorkflows();
    } catch (e: any) {
      toast.error(e?.response?.data?.message || "Lỗi khi áp dụng quy trình");
    }
  };

  const handleStartTestRun = async () => {
    if (!testRunWorkflow) return;
    let parsedContext = {};
    try {
      if (testContext.trim()) parsedContext = JSON.parse(testContext);
    } catch (e: any) {
      toast.error("Dữ liệu đầu vào (JSON) không hợp lệ");
      return;
    }

    setIsTestRunning(true);
    try {
      await workflowApi.start(testRunWorkflow.id, parsedContext);
      toast.success("Khởi chạy quy trình thành công!");
      setTestRunWorkflow(null);
      setSelectedWorkflow(null);
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi khởi chạy quy trình");
    } finally {
      setIsTestRunning(false);
    }
  };

  const paginationRange = useMemo(() => {
    const range = [];
    for (let i = 1; i <= Math.min(5, totalPages); i++) {
      let pageNum = i;
      if (totalPages > 5 && page > 3) {
        pageNum = page - 3 + i;
        if (pageNum > totalPages) pageNum = totalPages - (5 - i);
      }
      range.push(pageNum);
    }
    return range;
  }, [page, totalPages]);

  return (
    <div className="flex h-full w-full flex-col gap-6 bg-background p-4 md:p-6 lg:p-8">
      <header className="flex shrink-0 flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="text-2xl font-extrabold tracking-tight md:text-3xl lg:text-4xl">
            Quản lý Quy trình
          </h1>
          <p className="text-sm text-muted-foreground md:text-base">
            Thiết kế và giám sát các quy trình nghiệp vụ tự động trong hệ thống.
          </p>
        </div>
        <Button onClick={onCreate} className="w-full shadow-md sm:w-auto">
          <Plus className="mr-2 size-4" />
          Tạo quy trình mới
        </Button>
      </header>

      <section className="flex shrink-0 flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Search placeholder="Tìm kiếm quy trình..." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="h-9 w-[110px]">
              <SelectValue placeholder="Hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">9 dòng</SelectItem>
              <SelectItem value="18">18 dòng</SelectItem>
              <SelectItem value="50">50 dòng</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="secondary" className="h-9 rounded-md">
            {totalItems} Tổng số
          </Badge>
          <Badge variant="outline" className="h-9 rounded-md border-border bg-background">
            Trang {page}/{totalPages}
          </Badge>
        </div>
      </section>

      <main className="flex-1 min-h-0">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {isLoading ? (
            Array.from({ length: pageSize }).map((_, i) => (
              <Skeleton key={i} className="h-44 w-full rounded-xl" />
            ))
          ) : workflows.length === 0 ? (
            <div className="col-span-full flex flex-col items-center justify-center py-24 text-center">
              <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-muted">
                <Layers className="size-8 text-muted-foreground/40" />
              </div>
              <h3 className="text-lg font-semibold">Chưa có quy trình nào</h3>
              <p className="text-muted-foreground">Bắt đầu bằng cách tạo quy trình đầu tiên của bạn.</p>
            </div>
          ) : (
            workflows.map((w) => (
              <WorkflowCard
                key={w.id}
                workflow={w}
                appliedModuleName={
                  w.code && !w.code.includes("_OLD_") ? getModuleName(w.code) : null
                }
                onOpen={setSelectedWorkflow}
                onEdit={onEdit}
                onTestRun={(workflow) => {
                  setTestContext("{\n  \n}");
                  setTestRunWorkflow(workflow);
                }}
                onApply={setMappingWorkflow}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      </main>

      {totalPages > 1 && (
        <footer className="shrink-0 border-t pt-4">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
              {paginationRange.map((pageNum) => (
                <PaginationItem key={pageNum}>
                  <PaginationLink
                    isActive={page === pageNum}
                    onClick={() => setPage(pageNum)}
                    className="cursor-pointer"
                  >
                    {pageNum}
                  </PaginationLink>
                </PaginationItem>
              ))}
              <PaginationItem>
                <PaginationNext
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  className={page === totalPages ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </footer>
      )}

      {/* Delete Confirmation */}
      {isDeleteDialogOpen && (
        <ConfirmDeleteModal
          isOpen={isDeleteDialogOpen}
          onClose={() => setIsDeleteDialogOpen(false)}
          onConfirm={executeDelete}
          title="Xóa quy trình"
          description="Bạn có chắc chắn muốn xóa quy trình này? Hành động này không thể hoàn tác."
          isDeleting={isDeleting}
        />
      )}

      {/* Workflow Detail Slide-out */}
      <WorkflowDetailSheet
        workflow={selectedWorkflow}
        appliedModuleName={
          selectedWorkflow?.code && !selectedWorkflow.code.includes("_OLD_")
            ? getModuleName(selectedWorkflow.code)
            : null
        }
        onClose={() => setSelectedWorkflow(null)}
        onEdit={onEdit}
        onTestRun={(w) => {
          setTestContext("{\n  \n}");
          setTestRunWorkflow(w);
        }}
      />

      {/* Test Run Dialog */}
      <Dialog open={!!testRunWorkflow} onOpenChange={(open) => !open && setTestRunWorkflow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chạy thử quy trình</DialogTitle>
            <DialogDescription>
              Khởi chạy thử nghiệm quy trình <strong>{testRunWorkflow?.name}</strong>. Bạn có thể
              truyền biến đầu vào dưới dạng JSON.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="context-data">Dữ liệu đầu vào (JSON)</Label>
              <Textarea
                id="context-data"
                placeholder='{"key": "value"}'
                value={testContext}
                onChange={(e) => setTestContext(e.target.value)}
                className="h-32 font-mono text-sm"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestRunWorkflow(null)} disabled={isTestRunning}>
              Hủy
            </Button>
            <Button onClick={handleStartTestRun} disabled={isTestRunning}>
              {isTestRunning ? "Đang xử lý..." : "Bắt đầu chạy"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Apply Module Dialog */}
      <Dialog open={!!mappingWorkflow} onOpenChange={(open) => !open && setMappingWorkflow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Áp dụng Nghiệp vụ</DialogTitle>
            <DialogDescription>
              Chọn luồng nghiệp vụ chính để áp dụng quy trình <strong>{mappingWorkflow?.name}</strong>.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Luồng nghiệp vụ</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Chọn nghiệp vụ..." />
                </SelectTrigger>
                <SelectContent>
                  {workflowModules.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Chưa có nghiệp vụ nào
                    </SelectItem>
                  ) : (
                    workflowModules.map((m) => (
                      <SelectItem key={m.code} value={m.code}>
                        {m.name} <span className="ml-2 text-xs text-muted-foreground">{m.code}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMappingWorkflow(null)}>
              Hủy
            </Button>
            <Button onClick={handleApplyModule}>Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
