/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { Layers, Plus } from "lucide-react";
import { toast } from "sonner";
import { workflowApi, type Workflow } from "@/features/workflow/api";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
import { PageHeader } from "@/components/layouts/page-header";
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

import { WorkflowCard } from "./list/WorkflowCard";
import {
  WorkflowApplyModuleDialog,
  WorkflowTestRunDialog,
  useWorkflowModuleOptions,
} from "./list/WorkflowDialogs";
import { useUser } from "@/hooks/useUser";

/** Trang danh sách quy trình: /services/integration/workflows. Chi tiết/sửa là các route riêng. */
export default function WorkflowList() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const searchTerm = searchParams.get("search") || "";

  const [workflows, setWorkflows] = useState<Workflow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(12);
  const [totalItems, setTotalItems] = useState(0);
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));

  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [applyTarget, setApplyTarget] = useState<Workflow | null>(null);
  const [testRunTarget, setTestRunTarget] = useState<Workflow | null>(null);

  const { modules, getModuleName } = useWorkflowModuleOptions();
  const { user } = useUser();
  const isSuperAdmin = user?.isAdmin === true;
  const isOrgAdmin = user?.roles?.includes('ORG_ADMIN') || false; 
  const hasEditPerm = user?.permissions?.includes('WORKFLOW:EDIT') || user?.permissions?.includes('WORKFLOW:*');
  const canEdit = isSuperAdmin || isOrgAdmin || hasEditPerm;

  const loadWorkflows = async () => {
    setIsLoading(true);
    try {
      const res = await workflowApi.list({
        skip: (page - 1) * pageSize,
        take: pageSize,
        search: searchTerm || undefined,
      });
      setWorkflows(res?.data ?? []);
      setTotalItems(res?.meta?.total ?? res?.data?.length ?? 0);
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

  const executeDelete = async () => {
    if (!deleteId) return;
    setIsDeleting(true);
    try {
      await workflowApi.delete(deleteId);
      toast.success("Đã xóa quy trình");
      loadWorkflows();
    } catch (error: any) {
      toast.error(error?.response?.data?.message || "Lỗi khi xóa quy trình");
    } finally {
      setIsDeleting(false);
      setDeleteId(null);
    }
  };

  const paginationRange = useMemo(() => {
    const count = Math.min(5, totalPages);
    const start = Math.min(Math.max(1, page - 2), totalPages - count + 1);
    return Array.from({ length: count }, (_, i) => start + i);
  }, [page, totalPages]);

  return (
    <div className="flex w-full flex-col gap-5">
      <PageHeader
        title="Định nghĩa quy trình"
        description="Thiết kế, phát hành và gắn quy trình BPMN cho các luồng nghiệp vụ."
        backHref={WORKFLOW_ROUTES.hub}
        backLabel="Về Trung tâm tích hợp"
        actions={
          <div className="flex items-center gap-2">
            <Button asChild variant="outline" id="workflow-binding-button">
              <Link href={`${WORKFLOW_ROUTES.hub}/workflows/bindings`}>
                <Layers className="size-4 mr-2" /> Auto-Binding
              </Link>
            </Button>
            {canEdit && (
              <Button asChild id="workflow-create-button">
                <Link href={WORKFLOW_ROUTES.create}>
                  <Plus className="size-4 mr-2" /> Tạo quy trình
                </Link>
              </Button>
            )}
          </div>
        }
      />

      <section className="flex flex-col gap-3 rounded-xl border bg-card p-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="w-full sm:max-w-xs">
          <Search placeholder="Tìm kiếm quy trình..." />
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Badge variant="secondary">{totalItems} quy trình</Badge>
          <Select
            value={pageSize.toString()}
            onValueChange={(v) => {
              setPageSize(Number(v));
              setPage(1);
            }}
          >
            <SelectTrigger className="h-8 w-[120px]" aria-label="Số dòng mỗi trang">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12">12 / trang</SelectItem>
              <SelectItem value="24">24 / trang</SelectItem>
              <SelectItem value="48">48 / trang</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </section>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
        {isLoading ? (
          Array.from({ length: Math.min(pageSize, 8) }).map((_, i) => (
            <Skeleton key={i} className="h-44 w-full rounded-xl" />
          ))
        ) : workflows.length === 0 ? (
          <div className="col-span-full flex flex-col items-center justify-center rounded-xl border border-dashed bg-card py-20 text-center">
            <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted">
              <Layers className="size-7 text-muted-foreground/50" />
            </div>
            <h2 className="text-base font-semibold">
              {searchTerm ? "Không tìm thấy quy trình phù hợp" : "Chưa có quy trình nào"}
            </h2>
            <p className="mt-1 text-sm text-muted-foreground">
              {searchTerm ? "Thử từ khóa khác." : "Bắt đầu bằng cách tạo quy trình đầu tiên."}
            </p>
          </div>
        ) : (
          workflows.map((w) => (
            <WorkflowCard
              key={w.id}
              workflow={w}
              canEdit={canEdit}
              appliedModuleName={getModuleName(w.code)}
              onOpen={(wf) => router.push(WORKFLOW_ROUTES.edit(wf.id))}
              onEdit={(id) => router.push(WORKFLOW_ROUTES.edit(id))}
              onTestRun={setTestRunTarget}
              onApply={setApplyTarget}
              onDelete={setDeleteId}
            />
          ))
        )}
      </div>

      {totalPages > 1 && (
        <Pagination className="pt-2">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                className={page === 1 ? "pointer-events-none opacity-50" : "cursor-pointer"}
              />
            </PaginationItem>
            {paginationRange.map((n) => (
              <PaginationItem key={n}>
                <PaginationLink isActive={page === n} onClick={() => setPage(n)} className="cursor-pointer">
                  {n}
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
      )}

      {deleteId && (
        <ConfirmDeleteModal
          isOpen
          onClose={() => setDeleteId(null)}
          onConfirm={executeDelete}
          title="Xóa quy trình"
          description="Bạn có chắc chắn muốn xóa quy trình này? Hành động này không thể hoàn tác."
          isDeleting={isDeleting}
        />
      )}

      <WorkflowTestRunDialog workflow={testRunTarget} onClose={() => setTestRunTarget(null)} />
      <WorkflowApplyModuleDialog
        workflow={applyTarget}
        modules={modules}
        onClose={() => setApplyTarget(null)}
        onApplied={loadWorkflows}
      />
    </div>
  );
}
