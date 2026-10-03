/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { AlertCircle, Edit2, Play, RotateCw } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { workflowApi, type Workflow } from "@/features/workflow/api";
import { WorkflowViewer } from "../WorkflowViewer";
import { normalizeWorkflowGraph } from "../utils/normalizeWorkflowGraph";
import { WorkflowStatusPill, formatWorkflowDate } from "./WorkflowCard";

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

interface WorkflowDetailSheetProps {
  workflow: Workflow | null;
  appliedModuleName?: string | null;
  onClose: () => void;
  onEdit: (id: string) => void;
  onTestRun: (w: Workflow) => void;
}

function MetaItem({ label, value, mono }: { label: string; value: React.ReactNode; mono?: boolean }) {
  return (
    <div className="space-y-1">
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className={mono ? "truncate font-mono text-sm" : "text-sm font-medium"}>{value}</dd>
    </div>
  );
}

export function WorkflowDetailSheet({
  workflow,
  appliedModuleName,
  onClose,
  onEdit,
  onTestRun,
}: WorkflowDetailSheetProps) {
  const id = workflow?.id;
  const detail = useQuery({
    queryKey: ["workflow", "detail", id],
    queryFn: () => workflowApi.getOne(id as string),
    enabled: !!id,
    staleTime: 30_000,
    retry: 1,
  });

  const data: Workflow | null = (detail.data as Workflow) || workflow;

  const graphStats = useMemo(() => {
    if (!detail.data) return null;
    const { nodes, edges } = normalizeWorkflowGraph(detail.data);
    const byType = new Map<string, number>();
    nodes.forEach((n) => byType.set(n.type || "unknown", (byType.get(n.type || "unknown") || 0) + 1));
    return { nodeCount: nodes.length, edgeCount: edges.length, byType: [...byType.entries()] };
  }, [detail.data]);

  return (
    <Sheet open={!!workflow} onOpenChange={(open) => !open && onClose()}>
      <SheetContent className="flex w-full flex-col gap-0 p-0 sm:max-w-3xl">
        {data && (
          <>
            <SheetHeader className="space-y-2 border-b p-6 text-left">
              <div className="flex flex-wrap items-center gap-2">
                <WorkflowStatusPill workflow={data} />
                <span className="font-mono text-xs text-muted-foreground">v{data.version}</span>
              </div>
              <SheetTitle className="text-xl leading-snug">{data.name}</SheetTitle>
              <SheetDescription className="line-clamp-3">
                {data.description || "Chưa có mô tả cho quy trình này."}
              </SheetDescription>
            </SheetHeader>

            <div className="flex-1 space-y-6 overflow-y-auto p-6">
              <dl className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                <MetaItem label="Mã quy trình" value={data.code || "—"} mono />
                <MetaItem label="Nghiệp vụ áp dụng" value={appliedModuleName || "Chưa phân bổ"} />
                <MetaItem label="Ngày tạo" value={formatWorkflowDate(data.createdAt, "dd/MM/yyyy HH:mm")} />
                <MetaItem label="Cập nhật" value={formatWorkflowDate(data.updatedAt, "dd/MM/yyyy HH:mm")} />
              </dl>

              <Separator />

              <section className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-semibold">Sơ đồ quy trình</h4>
                  {graphStats && (
                    <span className="text-xs text-muted-foreground">
                      {graphStats.nodeCount} bước · {graphStats.edgeCount} liên kết
                    </span>
                  )}
                </div>
                <div className="overflow-hidden rounded-lg border bg-muted/20">
                  {detail.isLoading ? (
                    <Skeleton className="h-[420px] w-full rounded-none" />
                  ) : detail.isError ? (
                    <div role="alert" className="flex h-[420px] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
                      <AlertCircle className="size-6 text-destructive" />
                      <span>
                        {(detail.error as any)?.response?.data?.message || "Không tải được sơ đồ quy trình"}
                      </span>
                      <Button variant="outline" size="sm" onClick={() => detail.refetch()}>
                        <RotateCw className="size-4" /> Thử lại
                      </Button>
                    </div>
                  ) : (
                    <WorkflowViewer workflow={detail.data} showMiniMap />
                  )}
                </div>
              </section>

              {graphStats && graphStats.byType.length > 0 && (
                <section className="space-y-3">
                  <h4 className="text-sm font-semibold">Thành phần</h4>
                  <ul className="grid grid-cols-1 gap-2 sm:grid-cols-2">
                    {graphStats.byType.map(([type, count]) => (
                      <li key={type} className="flex items-center justify-between rounded-md border px-3 py-2 text-sm">
                        <span className="text-muted-foreground">{NODE_TYPE_LABELS[type] || type}</span>
                        <span className="font-semibold tabular-nums">{count}</span>
                      </li>
                    ))}
                  </ul>
                </section>
              )}
            </div>

            <SheetFooter className="flex-row gap-2 border-t p-4 sm:justify-end">
              <Button variant="outline" className="flex-1 sm:flex-none" onClick={() => onTestRun(data)}>
                <Play className="size-4" /> Chạy thử
              </Button>
              <Button
                className="flex-1 sm:flex-none"
                onClick={() => {
                  onEdit(data.id);
                  onClose();
                }}
              >
                <Edit2 className="size-4" /> Chỉnh sửa sơ đồ
              </Button>
            </SheetFooter>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
