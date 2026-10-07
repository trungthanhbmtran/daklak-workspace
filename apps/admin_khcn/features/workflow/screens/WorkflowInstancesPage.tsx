"use client";

import { useMemo, useState } from "react";
import { Activity, Search } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useWorkflowInstances } from "@/features/workflow/hooks";

export function WorkflowInstancesPage() {
  const [search, setSearch] = useState("");
  const query = useWorkflowInstances({ search: search || undefined });
  const rows = useMemo(() => query.data?.data ?? [], [query.data]);
  return <div className="flex flex-col gap-5"><PageHeader title="Phiên đang chạy" description="Trạng thái instance và correlation lấy trực tiếp từ workflow-service." />
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3"><div className="w-full max-w-sm"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm mã hồ sơ hoặc correlation ID" iconStart={<Search />} aria-label="Tìm phiên workflow" /></div><Badge variant="secondary">{query.data?.meta?.total ?? rows.length} phiên</Badge></div>
    {query.isPending ? <p className="rounded-xl border p-10 text-center text-muted-foreground">Đang tải phiên từ API…</p> : query.isError ? <p role="alert" className="rounded-xl border p-8 text-center text-sm text-destructive">Không thể tải phiên workflow từ backend.</p> : rows.length === 0 ? <div className="rounded-xl border border-dashed p-12 text-center"><Activity className="mx-auto mb-3 size-8 text-muted-foreground" /><p className="font-medium">Không có phiên workflow</p></div> : <div className="overflow-hidden rounded-xl border bg-card"><div className="divide-y">{rows.map((instance) => <article key={instance.id} className="flex flex-wrap items-center justify-between gap-4 p-4"><div className="min-w-0"><p className="font-medium">{instance.workflowName || "Quy trình"} <span className="font-normal text-muted-foreground">· {instance.processType || "Không có process type"}</span></p><p className="mt-1 truncate text-sm text-muted-foreground">Hồ sơ: {instance.businessId || "—"} · Instance: {instance.id}</p><p className="mt-1 text-xs text-muted-foreground">Correlation: {instance.correlationId || "—"}</p></div><div className="flex items-center gap-3"><Badge variant={instance.status === "COMPLETED" ? "default" : "secondary"}>{instance.status}</Badge><time className="text-xs text-muted-foreground">{instance.createdAt ? new Date(instance.createdAt).toLocaleString("vi-VN") : ""}</time></div></article>)}</div></div>}
  </div>;
}
