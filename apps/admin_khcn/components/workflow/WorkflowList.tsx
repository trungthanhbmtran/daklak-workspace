"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  Plus,
  MoreHorizontal,
  Play,
  Edit2,
  Trash2,
  Activity,
  Calendar,
  Layers,
  ChevronRight,
  Settings2,
  CheckCircle2,
  Link2
} from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { toast } from "sonner";
import { workflowApi, Workflow } from "@/features/workflow/api";
import { ConfirmDeleteModal } from "@/shared/ConfirmDeleteModal";
import { Button } from "@/components/ui/button";
import { Search } from "@/components/ui/search";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Badge } from "@/components/ui/badge";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";

interface WorkflowListProps {
  onEdit: (id: string) => void;
  onCreate: () => void;
}
import { useSearchParams } from "next/navigation";

const WorkflowList = ({ onEdit, onCreate }: WorkflowListProps) => {
  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [itemToDelete, setItemToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [selectedWorkflow, setSelectedWorkflow] = useState<Workflow | null>(null);
  const [testRunWorkflow, setTestRunWorkflow] = useState<Workflow | null>(null);
  const [testContext, setTestContext] = useState("{\n  \n}");
  const [isTestRunning, setIsTestRunning] = useState(false);
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get('search') || "";
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(9);
  const [totalItems, setTotalItems] = useState(0);

  const [mappingWorkflow, setMappingWorkflow] = useState<Workflow | null>(null);
  const [selectedModule, setSelectedModule] = useState<string>("");
  const [workflowModules, setWorkflowModules] = useState<{ id: string; code: string; name: string }[]>([]);

  const getModuleName = (code?: string) => {
    if (!code) return null;
    const match = workflowModules.find(m => m.code === code);
    return match ? match.name : code;
  };

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.list({
        skip: (page - 1) * pageSize,
        take: pageSize,
        search: searchTerm || undefined
      });
      setWorkflows(Array.isArray(res?.data) ? res.data : []);
      setTotalItems(res?.meta?.total || (res?.data?.length || 0));
    } catch (error) {
      console.error("Failed to load workflows:", error);
      toast.error("Không thể tải danh sách quy trình");
    } finally {
      setIsLoading(false);
    }
  };

  // Reset page when search changes
  useEffect(() => {
    setPage(1);
  }, [searchTerm]);

  useEffect(() => {
    loadWorkflows();
  }, [page, pageSize, searchTerm]);

  // Load modules từ DB khi mount
  useEffect(() => {
    workflowApi.getModules().then(modules => {
      if (Array.isArray(modules)) {
        setWorkflowModules(modules);
        if (modules.length > 0 && !selectedModule) {
          setSelectedModule(modules[0].code);
        }
      }
    }).catch(() => {});
  }, []);

  const handleDelete = (id: string) => {
    setItemToDelete(id);
    setIsDeleteDialogOpen(true);
  };

  const executeDelete = async () => {
    if (!itemToDelete) return;
    try {
      setIsDeleting(true);
      await workflowApi.delete(itemToDelete);
      toast.success("Đã xóa quy trình");
      loadWorkflows();
    } catch (error) {
      toast.error("Lỗi khi xóa quy trình");
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
    } catch (e) {
      toast.error("Lỗi khi áp dụng quy trình");
    }
  };

  const handleStartTestRun = async () => {
    if (!testRunWorkflow) return;
    let parsedContext = {};
    try {
      if (testContext.trim()) {
        parsedContext = JSON.parse(testContext);
      }
    } catch (e) {
      toast.error("Dữ liệu đầu vào (JSON) không hợp lệ");
      return;
    }

    setIsTestRunning(true);
    try {
      await workflowApi.start(testRunWorkflow.id, parsedContext);
      toast.success("Khởi chạy quy trình thành công!");
      setTestRunWorkflow(null);
      setSelectedWorkflow(null); // Optional: close the details sheet if open
    } catch (error) {
      console.error("Test run error:", error);
      toast.error("Lỗi khi khởi chạy quy trình");
    } finally {
      setIsTestRunning(false);
    }
  };

  const totalPages = Math.ceil(totalItems / pageSize);

  return (
    <div className="w-full h-full flex flex-col p-4 md:p-6 lg:p-8 space-y-6 md:space-y-8 bg-background">
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shrink-0">
        <div>
          <h1 className="text-2xl md:text-3xl lg:text-4xl font-extrabold tracking-tight text-foreground">Quản lý Quy trình</h1>
          <p className="text-muted-foreground text-sm md:text-base lg:text-lg mt-1 md:mt-2">
            Thiết kế và giám sát các quy trình nghiệp vụ tự động trong hệ thống.
          </p>
        </div>
        <Button onClick={onCreate} className="rounded-xl shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98] w-full md:w-auto">
          <Plus className="mr-2 h-4 w-4" /> Tạo quy trình mới
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shrink-0">
        <Search placeholder="Tìm kiếm quy trình..." className="w-full sm:max-w-sm bg-background" />
        <div className="flex items-center gap-2 flex-wrap w-full sm:w-auto">
          <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
            <SelectTrigger className="w-[110px] h-9 bg-background border-border shrink-0">
              <SelectValue placeholder="Hiển thị" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="9">9 dòng</SelectItem>
              <SelectItem value="18">18 dòng</SelectItem>
              <SelectItem value="50">50 dòng</SelectItem>
              <SelectItem value="100">100 dòng</SelectItem>
            </SelectContent>
          </Select>
          <Badge variant="outline" className="rounded-lg py-1.5 px-3 bg-primary/10 text-primary border-primary/20 shrink-0">
            {totalItems} Tổng số
          </Badge>
          <Badge variant="outline" className="rounded-lg py-1.5 px-3 bg-secondary text-secondary-foreground border-border shrink-0">
            Trang {page}/{Math.max(1, totalPages)}
          </Badge>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="h-[200px] rounded-2xl bg-muted/40 animate-pulse border border-border/40" />
          ))
        ) : workflows.length === 0 ? (
          <div className="col-span-full py-20 text-center space-y-3">
            <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-4">
              <Layers className="h-8 w-8 text-muted-foreground/40" />
            </div>
            <h3 className="text-lg font-semibold">Chưa có quy trình nào</h3>
            <p className="text-muted-foreground">Bắt đầu bằng cách tạo quy trình đầu tiên của bạn.</p>
          </div>
        ) : (
          workflows.map((workflow: any) => (
            <div
              key={workflow.id}
              className="group relative bg-card border border-border/60 rounded-2xl p-5 shadow-sm hover:shadow-xl hover:border-primary/20 transition-all duration-300"
            >
              <div className="flex items-start justify-between mb-4">
                <div className="p-2.5 rounded-xl bg-primary/10 text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300">
                  <Activity className="h-5 w-5" />
                </div>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="ghost" size="icon" className="rounded-lg opacity-0 group-hover:opacity-100 transition-opacity">
                      <MoreHorizontal className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="rounded-xl border-border/60">
                    <DropdownMenuItem onClick={() => onEdit(workflow.id)} className="rounded-lg">
                      <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg" onClick={() => { setTestContext("{\n  \n}"); setTestRunWorkflow(workflow); }}>
                      <Play className="mr-2 h-4 w-4" /> Chạy thử
                    </DropdownMenuItem>
                    <DropdownMenuItem className="rounded-lg text-emerald-600 focus:text-emerald-600" onClick={() => setMappingWorkflow(workflow)}>
                      <Link2 className="mr-2 h-4 w-4" /> Áp dụng nghiệp vụ
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      onClick={() => handleDelete(workflow.id)}
                      className="text-red-600 focus:text-red-600 rounded-lg"
                    >
                      <Trash2 className="mr-2 h-4 w-4" /> Xóa
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>

              <div className="space-y-2 min-w-0">
                <div className="flex items-start gap-2">
                  <h3 className="font-bold text-base md:text-lg leading-tight wrap-break-words whitespace-normal flex-1 min-w-0">{workflow.name}</h3>
                  {workflow.active ? (
                    <Badge className="shrink-0 bg-primary/10 text-primary border-none text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">
                      Active
                    </Badge>
                  ) : (
                    <Badge variant="secondary" className="shrink-0 text-[10px] h-5 px-1.5 font-bold uppercase tracking-wider">
                      Draft
                    </Badge>
                  )}
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2 min-h-[40px] wrap-break-words">
                  {workflow.description || "Chưa có mô tả cho quy trình này."}
                </p>
                {workflow.code && !workflow.code.includes('_OLD_') ? (
                  <div className="flex items-center text-[11px] text-emerald-700 bg-emerald-500/10 px-2 py-1.5 rounded-lg border border-emerald-500/20 font-medium mt-3 w-fit">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    <span>Đang áp dụng cho: <strong>{getModuleName(workflow.code)}</strong></span>
                  </div>
                ) : (
                  <div className="flex items-center text-[11px] text-muted-foreground bg-muted/30 px-2 py-1.5 rounded-lg border border-border/50 italic mt-3 w-fit">
                    <Layers className="w-3.5 h-3.5 mr-1.5 shrink-0" />
                    Chưa phân bổ nghiệp vụ
                  </div>
                )}
              </div>

              <div className="mt-6 pt-5 border-t border-border/40 flex items-center justify-between">
                <div className="flex flex-col gap-1">
                  <div className="flex items-center text-[10px] text-muted-foreground font-medium uppercase tracking-tighter">
                    <Calendar className="mr-1 h-3 w-3" />
                    {workflow.createdAt ? format(new Date(workflow.createdAt), "dd MMM yyyy", { locale: vi }) : "N/A"}
                  </div>
                  <div className="text-[10px] font-mono text-muted-foreground/60 uppercase">
                    v{workflow.version}.0
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="rounded-xl hover:bg-primary/5 hover:text-primary group/btn shrink-0"
                  onClick={() => setSelectedWorkflow(workflow)}
                >
                  Chi tiết <ChevronRight className="ml-1 h-4 w-4 transition-transform group-hover/btn:translate-x-0.5" />
                </Button>
              </div>
            </div>
          ))
        )}
      </div>

      {totalPages > 1 && (
        <div className="py-4 border-t border-border/40">
          <Pagination>
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
                />
              </PaginationItem>

              {/* Hiển thị một số trang (đơn giản) */}
              {Array.from({ length: Math.min(5, totalPages) }).map((_, i) => {
                // Logic hiển thị trang thông minh: luôn hiện xung quanh page hiện tại
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

      <ConfirmDeleteModal
        isOpen={isDeleteDialogOpen}
        onClose={() => setIsDeleteDialogOpen(false)}
        onConfirm={executeDelete}
        title="Xóa quy trình"
        description="Bạn có chắc chắn muốn xóa quy trình này? Hành động này không thể hoàn tác."
        isDeleting={isDeleting}
      />

      <Sheet open={!!selectedWorkflow} onOpenChange={(open) => !open && setSelectedWorkflow(null)}>
        <SheetContent className="sm:max-w-md md:max-w-lg lg:max-w-xl overflow-y-auto border-border/60 shadow-2xl p-0 flex flex-col">
          {selectedWorkflow && (
            <>
              <div className="p-6 border-b border-border/60 bg-muted/20">
                <SheetHeader className="text-left space-y-3">
                  <div className="flex items-center justify-between">
                    <Badge variant="outline" className="rounded-lg py-1 px-3 bg-primary/5 text-primary border-primary/10 uppercase tracking-wider text-[10px] font-bold">
                      Quy trình động (BPMN)
                    </Badge>
                    {selectedWorkflow.active ? (
                      <Badge className="bg-emerald-500/10 text-emerald-600 border-none text-[10px] h-6 px-2 font-bold uppercase tracking-wider">
                        Active
                      </Badge>
                    ) : (
                      <Badge variant="secondary" className="text-[10px] h-6 px-2 font-bold uppercase tracking-wider">
                        Draft
                      </Badge>
                    )}
                  </div>
                  <SheetTitle className="text-2xl font-bold leading-tight wrap-break-words">{selectedWorkflow.name}</SheetTitle>
                  <SheetDescription className="text-sm">
                    Phiên bản: <span className="font-mono font-medium text-foreground">v{selectedWorkflow.version}.0</span>
                  </SheetDescription>
                </SheetHeader>
              </div>

              <div className="p-6 flex-1 space-y-6">
                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Mô tả quy trình</h4>
                  <div className="p-4 bg-muted/30 rounded-xl border border-border/40 text-sm text-muted-foreground whitespace-pre-wrap wrap-break-words leading-relaxed min-h-[100px]">
                    {selectedWorkflow.description || "Chưa có mô tả chi tiết cho quy trình này."}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="p-4 rounded-xl border border-border/40 bg-card space-y-1">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Ngày tạo</div>
                    <div className="text-sm font-medium">
                      {selectedWorkflow.createdAt ? format(new Date(selectedWorkflow.createdAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "N/A"}
                    </div>
                  </div>
                  <div className="p-4 rounded-xl border border-border/40 bg-card space-y-1">
                    <div className="text-[10px] text-muted-foreground font-semibold uppercase tracking-wider">Cập nhật lần cuối</div>
                    <div className="text-sm font-medium">
                      {selectedWorkflow.updatedAt ? format(new Date(selectedWorkflow.updatedAt), "dd/MM/yyyy HH:mm", { locale: vi }) : "N/A"}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-foreground uppercase tracking-wider">Thống kê cơ bản</h4>
                  <div className="p-4 rounded-xl border border-border/40 bg-card flex flex-col gap-3">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tổng số lượt chạy (Instances):</span>
                      <span className="font-semibold">—</span>
                    </div>
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-muted-foreground">Tỷ lệ hoàn thành:</span>
                      <span className="font-semibold text-emerald-600">—</span>
                    </div>
                    <p className="text-[10px] text-muted-foreground italic mt-2">* Tính năng thống kê đang được cập nhật</p>
                  </div>
                </div>
              </div>

              <div className="p-6 border-t border-border/60 bg-background flex flex-col sm:flex-row gap-3">
                <Button
                  className="flex-1 rounded-xl"
                  onClick={() => {
                    onEdit(selectedWorkflow.id);
                    setSelectedWorkflow(null);
                  }}
                >
                  <Edit2 className="mr-2 h-4 w-4" /> Chỉnh sửa luồng (BPMN Editor)
                </Button>
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setTestContext("{\n  \n}"); setTestRunWorkflow(selectedWorkflow); }}>
                  <Play className="mr-2 h-4 w-4" /> Chạy thử quy trình
                </Button>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>

      <Dialog open={!!testRunWorkflow} onOpenChange={(open) => !open && setTestRunWorkflow(null)}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Chạy thử quy trình</DialogTitle>
            <DialogDescription>
              Khởi chạy thử nghiệm quy trình <strong>{testRunWorkflow?.name}</strong>. Bạn có thể truyền biến đầu vào (initial context) dưới dạng JSON.
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
                className="font-mono h-32"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setTestRunWorkflow(null)} disabled={isTestRunning}>
              Hủy
            </Button>
            <Button onClick={handleStartTestRun} disabled={isTestRunning}>
              {isTestRunning ? <Activity className="mr-2 h-4 w-4 animate-spin" /> : <Play className="mr-2 h-4 w-4" />} Bắt đầu chạy
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Module Mapping Dialog */}
      <Dialog open={!!mappingWorkflow} onOpenChange={(open) => !open && setMappingWorkflow(null)}>
        <DialogContent className="sm:max-w-[425px] rounded-2xl">
          <DialogHeader>
            <DialogTitle>Áp dụng Nghiệp vụ</DialogTitle>
            <DialogDescription>
              Chọn luồng nghiệp vụ chính để áp dụng quy trình <strong>{mappingWorkflow?.name}</strong>. Lưu ý: mỗi luồng nghiệp vụ chỉ được áp dụng MỘT quy trình tại một thời điểm.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Luồng nghiệp vụ</Label>
              <Select value={selectedModule} onValueChange={setSelectedModule}>
                <SelectTrigger className="w-full h-11 rounded-xl">
                  <SelectValue placeholder="Chọn nghiệp vụ..." />
                </SelectTrigger>
                <SelectContent className="rounded-xl">
                  {workflowModules.length === 0 ? (
                    <SelectItem value="__empty__" disabled>
                      Chưa có workflow Published nào
                    </SelectItem>
                  ) : (
                    workflowModules.map(m => (
                      <SelectItem key={m.code} value={m.code}>
                        <span className="font-medium">{m.name}</span>
                        <span className="ml-2 text-xs text-muted-foreground font-mono">{m.code}</span>
                      </SelectItem>
                    ))
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setMappingWorkflow(null)} className="rounded-xl">Hủy</Button>
            <Button onClick={handleApplyModule} className="rounded-xl">Lưu thay đổi</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default WorkflowList;
