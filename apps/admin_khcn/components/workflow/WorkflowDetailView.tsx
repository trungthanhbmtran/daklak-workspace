/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Edit2, Link2, Play, RotateCw } from "lucide-react";
import { workflowApi, type Workflow } from "@/features/workflow/api";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
import { PageHeader } from "@/components/layouts/page-header";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { WorkflowViewer } from "./WorkflowViewer";
import { normalizeWorkflowGraph } from "./utils/normalizeWorkflowGraph";
import { WorkflowStatusPill, formatWorkflowDate } from "./list/WorkflowCard";
import {
  WorkflowApplyModuleDialog,
  WorkflowTestRunDialog,
  useWorkflowModuleOptions,
} from "./list/WorkflowDialogs";

const NODE_TYPE_LABELS: Record<string, string> = {
  start: "Bắt đầu",
  end: "Kết thúc",
  user_task: "Xử lý bởi người dùng",
  service_task: "Tác vụ hệ thống",
  script_task: "Script",
  condition: "Điều kiện",
  exclusive_gateway: "Rẽ nhánh (XOR)",
  parallel_gateway: "Song song (AND)",
  api_gateway: "API Gateway",
  external_system: "Hệ thống ngoài",
  nginx_proxy: "Proxy",
};

function MetaItem({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "break-all font-mono text-sm" : "text-sm font-medium"}>{value}</dd>
    </div>
  );
}

/** Trang chi tiết: /services/integration/workflows/[id]. Tự tải dữ liệu theo id từ URL. */
export default function WorkflowDetailView({ id }: { id: string }) {
  const [testRunTarget, setTestRunTarget] = useState<Workflow | null>(null);
  const [applyTarget, setApplyTarget] = useState<Workflow | null>(null);
  const { modules, getModuleName } = useWorkflowModuleOptions();

  const detail = useQuery({
    queryKey: ["workflow", "detail", id],
    queryFn: () => workflowApi.getOne(id),
    staleTime: 30_000,
    retry: 1,
  });
  const data = detail.data as Workflow | undefined;

  const graphStats = useMemo(() => {
    if (!data) return null;
    const { nodes, edges } = normalizeWorkflowGraph(data);
    const byType = new Map<string, number>();
    nodes.forEach((n) => byType.set(n.type || "unknown", (byType.get(n.type || "unknown") || 0) + 1));
    return { nodeCount: nodes.length, edgeCount: edges.length, byType: [...byType.entries()] };
  }, [data]);

  if (detail.isLoading) {
    return (
      <div className="flex flex-col gap-5">
        <Skeleton className="h-12 w-2/3" />
        <div className="grid gap-5 lg:grid-cols-[1fr_320px]">
          <Skeleton className="h-[560px] w-full rounded-xl" />
          <Skeleton className="h-[320px] w-full rounded-xl" />
        </div>
      </div>
    );
  }

  if (detail.isError || !data) {
    return (
      <div className="flex flex-col gap-5">
        <PageHeader title="Chi tiết quy trình" backHref={WORKFLOW_ROUTES.list} />
        <div
          role="alert"
          className="flex flex-col items-center justify-center gap-3 rounded-xl border bg-card py-20 text-sm text-muted-foreground"
        >
          <AlertCircle className="size-6 text-destructive" />
          <span>{(detail.error as any)?.response?.data?.message || "Không tải được quy trình"}</span>
          <Button variant="outline" size="sm" onClick={() => detail.refetch()}>
            <RotateCw className="size-4" /> Thử lại
          </Button>
        </div>
      </div>
    );
  }

  const appliedModuleName = getModuleName(data.code);

  return (
    <div className="flex flex-col gap-5">
      <PageHeader
        title={data.name}
        description={data.description || "Chưa có mô tả cho quy trình này."}
        backHref={WORKFLOW_ROUTES.list}
        backLabel="Về danh sách quy trình"
        meta={
          <>
            <WorkflowStatusPill workflow={data} />
            <span className="font-mono text-xs text-muted-foreground">v{data.version}</span>
          </>
        }
        actions={
          <>
            <Button variant="outline" size="sm" onClick={() => setTestRunTarget(data)} id="workflow-detail-test-run">
              <Play className="size-4" /> Chạy thử
            </Button>
            <Button variant="outline" size="sm" onClick={() => setApplyTarget(data)} id="workflow-detail-apply">
              <Link2 className="size-4" /> Áp dụng nghiệp vụ
            </Button>
            <Button asChild size="sm" id="workflow-detail-edit">
              <Link href={WORKFLOW_ROUTES.edit(data.id)}>
                <Edit2 className="size-4" /> Chỉnh sửa sơ đồ
              </Link>
            </Button>
          </>
        }
      />

      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="gap-0 overflow-hidden py-0">
          <CardHeader className="flex flex-row items-center justify-between border-b px-4 py-3">
            <CardTitle className="text-sm">Sơ đồ quy trình</CardTitle>
            {graphStats && (
              <span className="text-xs text-muted-foreground">
                {graphStats.nodeCount} bước · {graphStats.edgeCount} liên kết
              </span>
            )}
          </CardHeader>
          <CardContent className="bg-muted/20 p-0">
            <WorkflowViewer workflow={data} showMiniMap className="h-[calc(100svh-260px)] min-h-[480px]" />
          </CardContent>
        </Card>

        <div className="flex flex-col gap-5">
          <Card className="gap-3">
            <CardHeader>
              <CardTitle className="text-sm">Thông tin chung</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="grid grid-cols-2 gap-4 lg:grid-cols-1">
                <MetaItem label="Mã quy trình" value={data.code || "—"} mono />
                <MetaItem label="Nghiệp vụ áp dụng" value={appliedModuleName || "Chưa phân bổ"} />
                <MetaItem label="Ngày tạo" value={formatWorkflowDate(data.createdAt, "dd/MM/yyyy HH:mm")} />
                <MetaItem label="Cập nhật" value={formatWorkflowDate(data.updatedAt, "dd/MM/yyyy HH:mm")} />
              </dl>
            </CardContent>
          </Card>

          {graphStats && graphStats.byType.length > 0 && (
            <Card className="gap-3">
              <CardHeader>
                <CardTitle className="text-sm">Thành phần</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {graphStats.byType.map(([type, count]) => (
                    <li key={type} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                      <span className="text-muted-foreground">{NODE_TYPE_LABELS[type] || type}</span>
                      <span className="font-semibold tabular-nums">{count}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>

      <WorkflowTestRunDialog workflow={testRunTarget} onClose={() => setTestRunTarget(null)} />
      <WorkflowApplyModuleDialog
        workflow={applyTarget}
        modules={modules}
        onClose={() => setApplyTarget(null)}
        onApplied={() => detail.refetch()}
      />
    </div>
  );
}
