"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Building2, Globe, Landmark, Plus, Search, Workflow as WorkflowIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layouts/page-header";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
import { useWorkflowDefinitions } from "@/features/workflow/hooks";
import { workflowApi, type Workflow } from "@/features/workflow/api";
import { organizationApi } from "@/features/system-admin/organization/api";
import type { OrganizationUnitNode } from "@/features/system-admin/organization/types";
import { flattenUnitHierarchy, getCategoryBadge, type FlatUnitItem } from "@/features/workflow/components/OrganizationUnitSelector";

function statusLabel(status?: string) {
  return status === "PUBLISHED" ? "Đã phát hành" : status === "DEPRECATED" ? "Ngừng sử dụng" : "Bản nháp";
}

export function WorkflowListPage() {
  const [search, setSearch] = useState("");
  const query = useWorkflowDefinitions({ search: search || undefined });
  const rows = useMemo(() => query.data?.data ?? [], [query.data]);

  const organizationTree = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
  });

  const unitMap = useMemo(() => {
    const rawData = organizationTree.data as unknown;
    const tree: OrganizationUnitNode[] = Array.isArray(rawData)
      ? (rawData as OrganizationUnitNode[])
      : rawData && typeof rawData === "object" && Array.isArray((rawData as { data?: unknown }).data)
        ? ((rawData as { data: OrganizationUnitNode[] }).data)
        : [];
    const flat = flattenUnitHierarchy(tree);
    const map = new Map<string, FlatUnitItem>();
    for (const item of flat) {
      map.set(item.code, item);
    }
    return map;
  }, [organizationTree.data]);

  async function remove(workflow: Workflow) {
    if (!window.confirm(`Xóa quy trình “${workflow.name}”?`)) return;
    try {
      await workflowApi.delete(workflow.id);
      toast.success("Đã xóa quy trình");
      await query.refetch();
    } catch {
      toast.error("Backend không thể xóa quy trình này");
    }
  }

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title="Quy trình động"
        description="Thiết kế, kiểm tra và phát hành quy trình theo nghiệp vụ."
        actions={
          <Button asChild>
            <Link href={WORKFLOW_ROUTES.create}>
              <Plus />Tạo quy trình
            </Link>
          </Button>
        }
      />

      <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3">
        <div className="w-full max-w-sm">
          <Input
            value={search}
            onChange={(event) => setSearch(event.target.value)}
            placeholder="Tìm theo tên hoặc mã quy trình"
            aria-label="Tìm quy trình"
            iconStart={<Search />}
          />
        </div>
        <Badge variant="secondary">
          {query.data?.meta?.total ?? rows.length} quy trình
        </Badge>
      </div>

      {query.isPending ? (
        <div className="rounded-xl border p-10 text-center text-muted-foreground">
          Đang tải dữ liệu từ workflow API…
        </div>
      ) : query.isError ? (
        <div role="alert" className="rounded-xl border border-destructive/40 p-6 text-sm text-destructive">
          Không thể tải quy trình. Hãy kiểm tra kết nối API hoặc quyền tài khoản.
        </div>
      ) : rows.length === 0 ? (
        <div className="rounded-xl border border-dashed p-12 text-center">
          <WorkflowIcon className="mx-auto mb-3 size-8 text-muted-foreground" />
          <p className="font-medium">Chưa có quy trình phù hợp</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Tạo quy trình mới để bắt đầu cấu hình luồng.
          </p>
        </div>
      ) : (
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {rows.map((workflow) => {
            const unit = workflow.ownerUnitCode ? unitMap.get(workflow.ownerUnitCode) : undefined;
            const catBadge = unit ? getCategoryBadge(unit.categoryCode) : undefined;

            return (
              <article
                key={workflow.id}
                className="flex min-h-44 flex-col justify-between rounded-xl border bg-card p-5 shadow-sm"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <h2 className="truncate font-semibold text-foreground">
                        {workflow.name}
                      </h2>
                      <p className="mt-1 wrap-break-word text-xs text-muted-foreground">
                        {workflow.code} · v{workflow.version ?? 1}
                      </p>
                    </div>
                    <Badge variant={workflow.status === "PUBLISHED" ? "default" : "secondary"}>
                      {statusLabel(workflow.status)}
                    </Badge>
                  </div>

                  <p className="line-clamp-2 text-sm text-muted-foreground">
                    {workflow.description || "Chưa có mô tả"}
                  </p>

                  <div className="rounded-lg border bg-muted/30 p-2 min-w-0">
                    <div className="flex items-center gap-2 min-w-0">
                      {unit ? (
                        unit.categoryCode === "DANG" ? (
                          <Landmark className="size-3.5 shrink-0 text-red-500" />
                        ) : (
                          <Building2 className="size-3.5 shrink-0 text-blue-500" />
                        )
                      ) : (
                        <Globe className="size-3.5 shrink-0 text-muted-foreground" />
                      )}
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-1.5 min-w-0 flex-wrap">
                          <span className="truncate text-xs font-medium text-foreground">
                            {unit ? unit.name : (workflow.ownerUnitCode || "Quy trình dùng chung")}
                          </span>
                          {unit && catBadge && (
                            <span className={`inline-flex items-center rounded-xs border px-1 py-0 text-[9px] font-medium ${catBadge.bg}`}>
                              {catBadge.label}
                            </span>
                          )}
                        </div>
                        {workflow.ownerUnitCode && (
                          <span className="text-[10px] font-mono text-muted-foreground">
                            Mã: {workflow.ownerUnitCode}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                <div className="mt-5 flex flex-wrap gap-2">
                  <Button asChild size="sm">
                    <Link href={WORKFLOW_ROUTES.edit(workflow.id)}>
                      Mở thiết kế
                    </Link>
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => void remove(workflow)}
                  >
                    Xóa
                  </Button>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </div>
  );
}

