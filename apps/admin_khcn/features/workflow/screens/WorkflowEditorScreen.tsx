"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Background, BackgroundVariant, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, ReactFlowProvider, addEdge, type Connection, type Edge, type Node, type NodeProps, useEdgesState, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Check, CircleHelp, GitBranch, Loader2, Save, Send, Settings2, UserRound, Workflow as WorkflowIcon } from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { usePublishWorkflow, useSaveWorkflow, useWorkflowDefinition, useWorkflowRoles } from "@/features/workflow/hooks";
import type { Workflow, WorkflowGraph, WorkflowNodeData } from "@/features/workflow/api";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";

type CanvasNode = Node<WorkflowNodeData>;
const START_NODES: CanvasNode[] = [{ id: "start-1", type: "start", position: { x: 80, y: 180 }, data: { label: "Bắt đầu" } }];
const NODE_OPTIONS = [
  { type: "userTask", label: "Bước phê duyệt", icon: UserRound },
  { type: "serviceTask", label: "Bước tự động", icon: Settings2 },
  { type: "exclusiveGateway", label: "Rẽ nhánh", icon: GitBranch },
  { type: "parallelGateway", label: "Song song", icon: GitBranch },
  { type: "gateway", label: "Điều phối", icon: GitBranch },
  { type: "end", label: "Kết thúc", icon: Check },
] as const;
const NODE_LABELS: Record<string, string> = { start: "Bắt đầu", end: "Kết thúc", userTask: "Bước phê duyệt", serviceTask: "Bước tự động", exclusiveGateway: "Rẽ nhánh", parallelGateway: "Song song", gateway: "Điều phối" };

function CanvasNodeCard({ data, type, selected }: NodeProps<CanvasNode>) {
  const tone = type === "start" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : type === "end" ? "border-slate-300 bg-slate-100 dark:bg-slate-800" : type?.includes("Gateway") || type === "gateway" ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : "border-primary/30 bg-card";
  return <div className={`min-w-40 rounded-xl border-2 px-4 py-3 shadow-sm ${tone} ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}>
    {type !== "start" && <Handle type="target" position={Position.Left} className="!size-2.5 !border-2 !border-background !bg-primary" />}
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{NODE_LABELS[type ?? ""] ?? type}</p><p className="mt-1 max-w-52 truncate text-sm font-semibold">{data.label || NODE_LABELS[type ?? ""] || "Bước mới"}</p>
    {type !== "end" && <Handle type="source" position={Position.Right} className="!size-2.5 !border-2 !border-background !bg-primary" />}
  </div>;
}
const nodeTypes = { start: CanvasNodeCard, userTask: CanvasNodeCard, serviceTask: CanvasNodeCard, exclusiveGateway: CanvasNodeCard, parallelGateway: CanvasNodeCard, gateway: CanvasNodeCard, end: CanvasNodeCard };

function asGraph(workflow?: Workflow): WorkflowGraph | undefined {
  const definition = workflow?.definition;
  if (definition && "nodes" in definition && Array.isArray(definition.nodes)) return definition as WorkflowGraph;
  if (definition && "graph" in definition && definition.graph) return definition.graph;
  if (workflow?.bpmnLogic && Array.isArray(workflow.bpmnLogic.nodes)) return workflow.bpmnLogic;
  return undefined;
}
function graphNodes(workflow?: Workflow): CanvasNode[] {
  const graph = asGraph(workflow);
  if (!graph?.nodes.length) return START_NODES;
  return graph.nodes.map((node, index) => {
    const assignment = node.assignments?.[0];
    return {
      ...node,
      type: node.type || "userTask",
      position: node.position || { x: 80 + (index % 3) * 230, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        ...(node.data || {}),
        label: node.data?.label || node.name || node.type || "Bước",
        assignmentStrategy: node.data?.assignmentStrategy || assignment?.type || "BY_ROLE",
        targetRole: node.data?.targetRole || (assignment?.type === "BY_ROLE" ? assignment.value : undefined),
      },
    };
  }) as CanvasNode[];
}
function graphEdges(workflow?: Workflow): Edge[] {
  const graph = asGraph(workflow);
  return (graph?.edges ?? []).map((edge, index) => ({ ...edge, id: edge.id || `edge-${index}`, source: edge.source || "", target: edge.target || "", type: "smoothstep", markerEnd: { type: MarkerType.ArrowClosed } })) as Edge[];
}
function createCode(value: string) {
  return value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "_").replace(/^_|_$/g, "").slice(0, 40);
}

function WorkflowEditor({ id, workflow, forceReadOnly = false }: { id?: string; workflow?: Workflow; forceReadOnly?: boolean }) {
  const router = useRouter();
  const roles = useWorkflowRoles();
  const save = useSaveWorkflow();
  const publish = usePublishWorkflow();
  const [workflowId, setWorkflowId] = useState(id);
  const [name, setName] = useState(workflow?.name || "");
  const [code, setCode] = useState(workflow?.code || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(graphNodes(workflow));
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(graphEdges(workflow));
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);
  const readOnly = forceReadOnly;
  const currentNode = useMemo(() => nodes.find((node) => node.id === selectedNode), [nodes, selectedNode]);
  const currentEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdge), [edges, selectedEdge]);
  const updateNode = (patch: Partial<WorkflowNodeData>) => setNodes((items) => items.map((node) => node.id === selectedNode ? { ...node, data: { ...node.data, ...patch } } : node));
  const updateEdge = (patch: Partial<Edge>) => setEdges((items) => items.map((edge) => edge.id === selectedEdge ? { ...edge, ...patch } : edge));
  function addNode(type: string, label: string) {
    const node: CanvasNode = { id: `${type}-${crypto.randomUUID()}`, type, position: { x: 100 + (nodes.length % 3) * 240, y: 130 + Math.floor(nodes.length / 3) * 150 }, data: { label } };
    setNodes((items) => [...items, node]); setSelectedNode(node.id); setSelectedEdge(null);
  }
  function graphForSave(): WorkflowGraph {
    return {
      nodes: nodes.map(({ selected: _selected, dragging: _dragging, measured: _measured, ...node }) => ({
        ...node,
        type: node.type || "userTask",
        ...(node.type === "userTask" ? { assignments: [{ id: `${node.id}:assignment`, type: String(node.data.assignmentStrategy || "BY_ROLE"), value: String(node.data.targetRole || "") }] } : {}),
      })),
      edges: edges.map(({ selected: _selected, label, ...edge }) => ({ ...edge, label: typeof label === "string" ? label : undefined, source: edge.source, target: edge.target })),
    };
  }
  async function saveDraft() {
    if (!name.trim()) { toast.error("Nhập tên quy trình trước khi lưu"); return; }
    const nextCode = code.trim() || createCode(name);
    if (!nextCode) { toast.error("Nhập mã quy trình"); return; }
    try {
      const result = await save.mutateAsync({ id: workflowId, data: { name: name.trim(), code: nextCode, description: description.trim() || undefined, definition: graphForSave() } });
      setWorkflowId(result.id); setCode(result.code); toast.success("Đã lưu bản nháp vào workflow API");
      if (!id) router.replace(WORKFLOW_ROUTES.edit(result.id));
    } catch { toast.error("Backend không thể lưu bản nháp. Kiểm tra dữ liệu bắt buộc và quyền truy cập."); }
  }
  async function publishWorkflow() {
    if (!workflowId) { toast.error("Lưu bản nháp trước khi phát hành"); return; }
    try { await publish.mutateAsync(workflowId); toast.success("Backend đã kiểm tra và phát hành phiên bản"); }
    catch { toast.error("Backend chưa thể phát hành. Kiểm tra cấu trúc, kết nối và thông báo API."); }
  }
  return <div className="flex min-h-[calc(100vh-9rem)] flex-col overflow-hidden rounded-xl border bg-background">
    <header className="flex flex-wrap items-center justify-between gap-3 border-b p-3"><div className="flex items-center gap-2"><Button variant="ghost" size="icon" onClick={() => router.push(WORKFLOW_ROUTES.list)} aria-label="Quay lại"><ArrowLeft /></Button><div><div className="flex items-center gap-2"><Input className="h-8 w-64 font-semibold" value={name} onChange={(event) => setName(event.target.value)} placeholder="Tên quy trình" disabled={readOnly} aria-label="Tên quy trình" />{workflow && <Badge variant={workflow.status === "PUBLISHED" ? "default" : "secondary"}>{workflow.status === "PUBLISHED" ? "Đã phát hành · lưu sẽ tạo nháp" : "Bản nháp"} · v{workflow.version ?? 1}</Badge>}</div><p className="ml-1 mt-1 text-xs text-muted-foreground">{code || "Mã sẽ được tạo từ tên quy trình"}</p></div></div><div className="flex items-center gap-2"><Button variant="outline" onClick={() => void saveDraft()} disabled={readOnly || save.isPending}><Save />{save.isPending ? "Đang lưu…" : "Lưu nháp"}</Button><Button onClick={() => void publishWorkflow()} disabled={readOnly || publish.isPending || !workflowId}><Send />{publish.isPending ? "Đang phát hành…" : "Phát hành"}</Button></div></header>
    <div className="grid min-h-0 flex-1 grid-cols-1 xl:grid-cols-[220px_minmax(0,1fr)_300px]">
      <aside className="border-b p-4 xl:border-b-0 xl:border-r"><h2 className="mb-3 text-sm font-semibold">Thành phần</h2><div className="grid grid-cols-2 gap-2 xl:grid-cols-1">{NODE_OPTIONS.map(({ type, label, icon: Icon }) => <Button key={type} variant="outline" size="sm" className="justify-start" disabled={readOnly} onClick={() => addNode(type, label)}><Icon />{label}</Button>)}</div><p className="mt-5 text-xs leading-relaxed text-muted-foreground">Kéo từ chấm bên phải của bước sang chấm bên trái bước kế tiếp để nối luồng.</p><div className="mt-5 space-y-2"><Label htmlFor="workflow-description">Mô tả</Label><Textarea id="workflow-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mục đích và phạm vi áp dụng" disabled={readOnly} /></div></aside>
      <div className="h-[60vh] min-h-[440px] xl:h-auto"><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={readOnly ? undefined : onNodesChange} onEdgesChange={readOnly ? undefined : onEdgesChange} onConnect={readOnly ? undefined : (connection: Connection) => setEdges((items) => addEdge({ ...connection, id: `edge-${crypto.randomUUID()}`, type: "smoothstep", animated: true, markerEnd: { type: MarkerType.ArrowClosed } }, items))} onNodeClick={(_event, node) => { setSelectedNode(node.id); setSelectedEdge(null); }} onEdgeClick={(_event, edge) => { setSelectedEdge(edge.id); setSelectedNode(null); }} onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); }} nodesConnectable={!readOnly} nodesDraggable={!readOnly} fitView><Background variant={BackgroundVariant.Dots} gap={20} size={1} /><Controls /><MiniMap pannable zoomable /></ReactFlow></div>
      <aside className="border-t p-4 xl:border-l xl:border-t-0"><h2 className="mb-1 text-sm font-semibold">Thuộc tính</h2><p className="mb-4 text-xs text-muted-foreground">{currentNode ? "Cấu hình bước đang chọn" : currentEdge ? "Cấu hình nhánh đang chọn" : "Chọn một bước hoặc nhánh trên sơ đồ"}</p>
        {currentNode && <div className="space-y-4"><div className="space-y-2"><Label>Tên bước</Label><Input value={String(currentNode.data.label || "")} onChange={(event) => updateNode({ label: event.target.value })} disabled={readOnly} /></div>{currentNode.type === "userTask" && <><div className="space-y-2"><Label>Chiến lược phân công</Label><Select value={String(currentNode.data.assignmentStrategy || "BY_ROLE")} onValueChange={(value) => updateNode({ assignmentStrategy: value })} disabled={readOnly}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BY_ROLE">Theo chức danh</SelectItem><SelectItem value="CREATOR">Người tạo hồ sơ</SelectItem><SelectItem value="PREVIOUS_ACTOR">Người xử lý bước trước</SelectItem></SelectContent></Select></div>{(currentNode.data.assignmentStrategy === "BY_ROLE" || !currentNode.data.assignmentStrategy) && <div className="space-y-2"><Label>Chức danh xử lý</Label><Select value={String(currentNode.data.targetRole || "")} onValueChange={(value) => updateNode({ targetRole: value })} disabled={readOnly || roles.isPending}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn chức danh từ API" /></SelectTrigger><SelectContent>{(roles.data ?? []).map((role) => <SelectItem key={role.code} value={role.code}>{role.name}</SelectItem>)}</SelectContent></Select>{roles.isError && <p className="text-xs text-destructive">Không tải được danh sách chức danh từ backend.</p>}</div>}</>}</div>}
        {currentEdge && <div className="space-y-3"><div className="space-y-2"><Label>Nhãn nhánh</Label><Input value={typeof currentEdge.label === "string" ? currentEdge.label : ""} onChange={(event) => updateEdge({ label: event.target.value })} disabled={readOnly} placeholder="Ví dụ: Hồ sơ hợp lệ" /></div><p className="flex gap-2 rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground"><CircleHelp className="size-4 shrink-0" />Điều kiện nghiệp vụ chỉ nên cấu hình sau khi backend công bố schema rule cho process type.</p></div>}
        {!currentEdge && !currentNode && <div className="rounded-lg border border-dashed p-4 text-xs text-muted-foreground"><WorkflowIcon className="mb-2 size-5" />Chọn node để chỉnh tên và giao việc. Backend kiểm tra tính hợp lệ khi phát hành.</div>}
      </aside>
    </div>
  </div>;
}

export function WorkflowEditorScreen({ id, readOnly = false }: { id?: string; readOnly?: boolean }) {
  return <ReactFlowProvider><WorkflowEditorLoader id={id} readOnly={readOnly} /></ReactFlowProvider>;
}

function WorkflowEditorLoader({ id, readOnly }: { id?: string; readOnly: boolean }) {
  const detail = useWorkflowDefinition(id);
  if (id && detail.isPending) return <div className="flex min-h-[70vh] items-center justify-center gap-2 text-sm text-muted-foreground"><Loader2 className="size-4 animate-spin" />Đang tải phiên bản từ backend…</div>;
  if (id && (detail.isError || !detail.data)) return <div role="alert" className="rounded-xl border p-8 text-center text-destructive">Không thể tải quy trình. Hãy kiểm tra quyền truy cập hoặc thử tải lại.</div>;
  return <WorkflowEditor key={id || "new"} id={id} workflow={detail.data} forceReadOnly={readOnly} />;
}
