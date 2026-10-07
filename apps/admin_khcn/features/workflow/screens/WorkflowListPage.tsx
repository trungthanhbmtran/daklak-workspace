import Link from "next/link";
import { useMemo, useState } from "react";
import { Plus, Search, Workflow as WorkflowIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PageHeader } from "@/components/layouts/page-header";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
import { useWorkflowDefinitions } from "@/features/workflow/hooks";
import { workflowApi, type Workflow } from "@/features/workflow/api";

function statusLabel(status?: string) { return status === "PUBLISHED" ? "Đã phát hành" : status === "DEPRECATED" ? "Ngừng sử dụng" : "Bản nháp"; }

export function WorkflowListPage() {
  const [search, setSearch] = useState("");
  const query = useWorkflowDefinitions({ search: search || undefined });
  const rows = useMemo(() => query.data?.data ?? [], [query.data]);
  async function remove(workflow: Workflow) {
    if (!window.confirm(`Xóa quy trình “${workflow.name}”?`)) return;
    try { await workflowApi.delete(workflow.id); toast.success("Đã xóa quy trình"); await query.refetch(); }
    catch { toast.error("Backend không thể xóa quy trình này"); }
  }
  return <div className="flex flex-col gap-5">
    <PageHeader title="Quy trình động" description="Thiết kế, kiểm tra và phát hành quy trình theo nghiệp vụ." actions={<Button asChild><Link href={WORKFLOW_ROUTES.create}><Plus />Tạo quy trình</Link></Button>} />
    <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border bg-card p-3"><div className="w-full max-w-sm"><Input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Tìm theo tên hoặc mã quy trình" aria-label="Tìm quy trình" iconStart={<Search />} /></div><Badge variant="secondary">{query.data?.meta?.total ?? rows.length} quy trình</Badge></div>
    {query.isPending ? <div className="rounded-xl border p-10 text-center text-muted-foreground">Đang tải dữ liệu từ workflow API…</div> : query.isError ? <div role="alert" className="rounded-xl border border-destructive/40 p-6 text-sm text-destructive">Không thể tải quy trình. Hãy kiểm tra kết nối API hoặc quyền tài khoản.</div> : rows.length === 0 ? <div className="rounded-xl border border-dashed p-12 text-center"><WorkflowIcon className="mx-auto mb-3 size-8 text-muted-foreground" /><p className="font-medium">Chưa có quy trình phù hợp</p><p className="mt-1 text-sm text-muted-foreground">Tạo quy trình mới để bắt đầu cấu hình luồng.</p></div> : <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">{rows.map((workflow) => <article key={workflow.id} className="flex min-h-44 flex-col justify-between rounded-xl border bg-card p-5 shadow-sm"><div className="space-y-3"><div className="flex items-start justify-between gap-2"><div><h2 className="font-semibold">{workflow.name}</h2><p className="mt-1 text-xs text-muted-foreground">{workflow.code} · v{workflow.version ?? 1}</p></div><Badge variant={workflow.status === "PUBLISHED" ? "default" : "secondary"}>{statusLabel(workflow.status)}</Badge></div><p className="line-clamp-2 text-sm text-muted-foreground">{workflow.description || "Chưa có mô tả"}</p></div><div className="mt-5 flex flex-wrap gap-2"><Button asChild size="sm"><Link href={WORKFLOW_ROUTES.edit(workflow.id)}>Mở thiết kế</Link></Button><Button size="sm" variant="outline" onClick={() => void remove(workflow)}>Xóa</Button></div></article>)}</div>}
  </div>;
}
