"use client";

import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Layers3, Plus, Power } from "lucide-react";
import { PageHeader } from "@/components/layouts/page-header";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useCreateWorkflowBinding, useDeactivateWorkflowBinding, useWorkflowBindings, useWorkflowDefinitions, useWorkflowProcessTypes } from "@/features/workflow/hooks";
import type { WorkflowBinding } from "@/features/workflow/api";

export function WorkflowBindingsPage() {
  const [processTypeCode, setProcessTypeCode] = useState("");
  const [definitionId, setDefinitionId] = useState("");
  const [trigger, setTrigger] = useState("");
  const [reason, setReason] = useState("");
  const bindings = useWorkflowBindings();
  const definitions = useWorkflowDefinitions();
  const processTypes = useWorkflowProcessTypes();
  const create = useCreateWorkflowBinding();
  const deactivate = useDeactivateWorkflowBinding();
  const published = useMemo(() => (definitions.data?.data ?? []).filter((item) => item.status === "PUBLISHED"), [definitions.data]);
  const triggerOptions = processTypes.data?.find((item) => item.code === processTypeCode)?.validTriggers ?? [];
  function selectProcessType(value: string) { setProcessTypeCode(value); setTrigger(""); }
  async function addBinding(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!processTypeCode || !definitionId || !trigger) { toast.error("Chọn loại nghiệp vụ, quy trình và sự kiện"); return; }
    try { await create.mutateAsync({ processTypeCode, definitionId, trigger, reason: reason || undefined }); toast.success("Đã tạo binding trên workflow API"); setReason(""); }
    catch { toast.error("Backend từ chối tạo binding. Kiểm tra loại nghiệp vụ, trigger hoặc phạm vi đơn vị."); }
  }
  async function turnOff(binding: WorkflowBinding) {
    try { await deactivate.mutateAsync({ id: binding.id, reason: "Ngừng từ trang quản trị Workflow" }); toast.success("Đã vô hiệu hóa binding"); }
    catch { toast.error("Không thể vô hiệu hóa binding"); }
  }
  return <div className="flex flex-col gap-5">
    <PageHeader title="Gắn quy trình vào nghiệp vụ" description="Backend resolve binding theo process type, trigger, đơn vị và tiêu chí đã cấu hình." />
    <form onSubmit={(event) => void addBinding(event)} className="grid gap-4 rounded-xl border bg-card p-5 md:grid-cols-2 xl:grid-cols-4">
      <div className="space-y-2"><Label>Loại nghiệp vụ</Label><Select value={processTypeCode} onValueChange={selectProcessType}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn process type" /></SelectTrigger><SelectContent>{(processTypes.data ?? []).map((item) => <SelectItem key={item.code} value={item.code}>{item.name} ({item.code})</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Quy trình đã phát hành</Label><Select value={definitionId} onValueChange={setDefinitionId}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn quy trình" /></SelectTrigger><SelectContent>{published.map((item) => <SelectItem key={item.id} value={item.id}>{item.name} · v{item.version ?? 1}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Sự kiện kích hoạt</Label><Select value={trigger} onValueChange={setTrigger} disabled={!triggerOptions.length}><SelectTrigger className="w-full"><SelectValue placeholder={triggerOptions.length ? "Chọn trigger" : "Không có trigger trong catalog"} /></SelectTrigger><SelectContent>{triggerOptions.map((value) => <SelectItem key={value} value={value}>{value}</SelectItem>)}</SelectContent></Select></div>
      <div className="space-y-2"><Label>Lý do (tùy chọn)</Label><Input value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Ghi chú audit" /></div>
      <div className="md:col-span-2 xl:col-span-4"><Button type="submit" disabled={create.isPending}><Plus />{create.isPending ? "Đang lưu…" : "Tạo binding"}</Button></div>
    </form>
    <div className="overflow-hidden rounded-xl border bg-card"><div className="flex items-center justify-between border-b p-4"><div><h2 className="font-semibold">Binding hiện có</h2><p className="text-sm text-muted-foreground">Dữ liệu tải từ workflow-service qua API Gateway.</p></div><Badge variant="secondary">{bindings.data?.meta?.total ?? bindings.data?.data.length ?? 0} binding</Badge></div>
      {bindings.isPending ? <p className="p-8 text-center text-sm text-muted-foreground">Đang tải binding…</p> : bindings.isError ? <p role="alert" className="p-8 text-center text-sm text-destructive">Không tải được binding từ API.</p> : !bindings.data?.data.length ? <div className="p-10 text-center text-sm text-muted-foreground"><Layers3 className="mx-auto mb-2 size-7" />Chưa có binding.</div> : <div className="divide-y">{bindings.data.data.map((binding) => <div key={binding.id} className="flex flex-wrap items-center justify-between gap-3 p-4"><div><p className="font-medium">{processTypes.data?.find((item) => item.code === binding.processTypeCode)?.name ?? binding.processTypeCode ?? "Nghiệp vụ"} <span className="text-muted-foreground">· {binding.trigger}</span></p><p className="mt-1 text-sm text-muted-foreground">{definitions.data?.data.find((item) => item.id === binding.definitionId)?.name ?? binding.definitionId} · Ưu tiên {binding.priority ?? 100}</p></div><div className="flex items-center gap-2"><Badge variant={binding.status === "ACTIVE" ? "default" : "secondary"}>{binding.status}</Badge>{binding.status === "ACTIVE" && <Button variant="outline" size="sm" onClick={() => void turnOff(binding)} disabled={deactivate.isPending}><Power />Ngừng</Button>}</div></div>)}</div>}
    </div>
  </div>;
}
