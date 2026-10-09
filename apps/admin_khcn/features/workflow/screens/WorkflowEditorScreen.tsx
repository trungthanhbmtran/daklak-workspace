"use client";
import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Background, BackgroundVariant, Controls, Handle, MarkerType, MiniMap, Position, ReactFlow, ReactFlowProvider, addEdge, useReactFlow, type Connection, type Edge, type Node, type NodeProps, useEdgesState, useNodesState } from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import { ArrowLeft, Check, CircleHelp, GitBranch, Loader2, Save, Send, Settings2, Trash2, UserRound, Workflow as WorkflowIcon } from "lucide-react";
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
  { type: "user_task", label: "Bước phê duyệt", icon: UserRound },
  { type: "service_task", label: "Bước tự động", icon: Settings2 },
  { type: "exclusive_gateway", label: "Rẽ nhánh", icon: GitBranch },
  { type: "parallel_gateway", label: "Song song", icon: GitBranch },
  { type: "gateway", label: "Điều phối", icon: GitBranch },
  { type: "end", label: "Kết thúc", icon: Check },
] as const;
const NODE_LABELS: Record<string, string> = { start: "Bắt đầu", end: "Kết thúc", user_task: "Bước phê duyệt", service_task: "Bước tự động", exclusive_gateway: "Rẽ nhánh", parallel_gateway: "Song song", gateway: "Điều phối" };

function CanvasNodeCard({ data, type, selected }: NodeProps<CanvasNode>) {
  const isGateway = type?.toLowerCase().includes("gateway") ?? false;
  const inputHandles = data.inputHandles ?? [];
  const outputHandles = data.outputHandles ?? [];
  const tone = type === "start" ? "border-emerald-300 bg-emerald-50 dark:bg-emerald-950/30" : type === "end" ? "border-slate-300 bg-slate-100 dark:bg-slate-800" : isGateway ? "border-amber-300 bg-amber-50 dark:bg-amber-950/30" : "border-primary/30 bg-card";
  return <div className={`min-w-40 rounded-xl border-2 px-4 py-3 shadow-sm ${tone} ${selected ? "ring-2 ring-primary ring-offset-2" : ""}`}>
    {type !== "start" && (inputHandles.length > 0 ? inputHandles.map((handleId, index) => <Handle key={handleId ?? "default-target"} id={handleId ?? undefined} type="target" position={Position.Left} style={{ top: `${((index + 1) / (inputHandles.length + 1)) * 100}%` }} className="!size-3 !border-2 !border-background !bg-primary" />) : <Handle type="target" position={Position.Left} className="!size-3 !border-2 !border-background !bg-primary" />)}
    <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">{NODE_LABELS[type ?? ""] ?? type}</p><p className="mt-1 max-w-52 truncate text-sm font-semibold">{data.label || NODE_LABELS[type ?? ""] || "Bước mới"}</p>
    {type !== "end" && (outputHandles.length > 0 ? outputHandles.map((handleId, index) => <Handle key={handleId ?? "default-source"} id={handleId ?? undefined} type="source" position={Position.Right} style={{ top: `${((index + 1) / (outputHandles.length + 1)) * 100}%` }} className="!size-3 !border-2 !border-background !bg-primary" />) : <Handle type="source" position={Position.Right} className="!size-3 !border-2 !border-background !bg-primary" />)}
  </div>;
}
const nodeTypes = { start: CanvasNodeCard, user_task: CanvasNodeCard, service_task: CanvasNodeCard, exclusive_gateway: CanvasNodeCard, parallel_gateway: CanvasNodeCard, gateway: CanvasNodeCard, end: CanvasNodeCard };

function asGraph(workflow?: Workflow): WorkflowGraph | undefined {
  const definition = workflow?.definition;
  if (definition && "nodes" in definition && Array.isArray(definition.nodes)) return definition as WorkflowGraph;
  if (definition && "graph" in definition && definition.graph) return definition.graph;
  if (workflow?.bpmnLogic && Array.isArray(workflow.bpmnLogic.nodes)) return workflow.bpmnLogic;
  return undefined;
}
function edgeEndpoint(primary?: string, legacy?: string) {
  return primary?.trim() || legacy?.trim() || "";
}
function edgeHandleIds(workflow: Workflow | undefined, nodeId: string, side: "source" | "target"): Array<string | null> {
  const graph = asGraph(workflow);
  const handleIds = new Set<string>();
  let hasDefaultHandle = false;
  for (const edge of graph?.edges ?? []) {
    const endpoint = side === "source"
      ? edgeEndpoint(edge.source, edge.sourceNodeId)
      : edgeEndpoint(edge.target, edge.targetNodeId);
    const handleId = side === "source" ? edge.sourceHandle : edge.targetHandle;
    if (endpoint !== nodeId) continue;
    if (handleId?.trim()) handleIds.add(handleId.trim());
    else hasDefaultHandle = true;
  }
  const sortedHandles = [...handleIds].sort((left, right) => {
    const order = (value: string) => value === "true" ? 0 : value === "false" ? 1 : 2;
    return order(left) - order(right) || left.localeCompare(right);
  });
  return hasDefaultHandle ? [null, ...sortedHandles] : sortedHandles;
}
function readPosition(value: unknown): { x: number; y: number } | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
  const position = value as Record<string, unknown>;
  const readCoordinate = (coordinate: unknown) => {
    if (typeof coordinate === "number") return coordinate;
    if (typeof coordinate === "string" && coordinate.trim()) return Number(coordinate);
    return Number.NaN;
  };
  const x = readCoordinate(position.x);
  const y = readCoordinate(position.y);
  return Number.isFinite(x) && Number.isFinite(y) ? { x, y } : undefined;
}
function metadataPositions(metadata: unknown): Map<string, { x: number; y: number }> {
  if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) return new Map();
  const value = metadata as Record<string, unknown>;
  const graph = value.graph && typeof value.graph === "object" ? value.graph as Record<string, unknown> : undefined;
  const nodes = Array.isArray(value.nodes) ? value.nodes : Array.isArray(graph?.nodes) ? graph.nodes : [];
  return new Map(nodes.flatMap((item) => {
    if (!item || typeof item !== "object") return [];
    const node = item as Record<string, unknown>;
    const id = typeof node.id === "string" ? node.id : "";
    const position = readPosition(node.position) ?? readPosition(node.positionAbsolute);
    return id && position ? [[id, position] as const] : [];
  }));
}
function hasUsablePositionSet(positions: Map<string, { x: number; y: number }>, nodeCount: number) {
  if (positions.size !== nodeCount) return false;
  if (nodeCount <= 1) return true;
  return new Set([...positions.values()].map(({ x, y }) => `${x}:${y}`)).size === nodeCount;
}
function treePositions(nodes: WorkflowGraph["nodes"], edges: WorkflowGraph["edges"]): Map<string, { x: number; y: number }> {
  const outgoing = new Map(nodes.map((node) => [node.id, [] as Array<{ id: string; priority: number; index: number }>]));
  const incomingCount = new Map(nodes.map((node) => [node.id, 0]));
  edges.forEach((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);
    if (!outgoing.has(source) || !incomingCount.has(target)) return;
    const handle = (edge.sourceHandle || "").toLowerCase();
    const priority = handle === "true" || handle === "yes" ? 0 : handle === "false" || handle === "no" ? 2 : 1;
    outgoing.get(source)?.push({ id: target, priority, index });
    incomingCount.set(target, (incomingCount.get(target) ?? 0) + 1);
  });
  for (const children of outgoing.values()) children.sort((left, right) => left.priority - right.priority || left.index - right.index);

  const ranks = new Map<string, number>();
  const discoveryOrder = new Map<string, number>();
  let nextOrder = 0;
  const placeReachableNodes = (rootId: string, rootRank: number) => {
    if (ranks.has(rootId)) return;
    ranks.set(rootId, rootRank);
    discoveryOrder.set(rootId, nextOrder++);
    const queue = [rootId];
    for (let cursor = 0; cursor < queue.length; cursor += 1) {
      const source = queue[cursor];
      for (const child of outgoing.get(source) ?? []) {
        if (ranks.has(child.id)) continue;
        ranks.set(child.id, (ranks.get(source) ?? rootRank) + 1);
        discoveryOrder.set(child.id, nextOrder++);
        queue.push(child.id);
      }
    }
  };
  const roots = nodes
    .filter((node) => incomingCount.get(node.id) === 0)
    .sort((left, right) => Number(right.type === "start") - Number(left.type === "start"));
  for (const root of roots) placeReachableNodes(root.id, 0);
  if (ranks.size === 0 && nodes[0]) placeReachableNodes(nodes[0].id, 0);
  let nextComponentRank = Math.max(0, ...ranks.values()) + 1;
  for (const node of nodes) {
    if (ranks.has(node.id)) continue;
    placeReachableNodes(node.id, nextComponentRank);
    nextComponentRank = Math.max(nextComponentRank, ...ranks.values()) + 1;
  }

  const layers = new Map<number, string[]>();
  for (const node of nodes) {
    const rank = ranks.get(node.id) ?? 0;
    layers.set(rank, [...(layers.get(rank) ?? []), node.id]);
  }
  for (const ids of layers.values()) ids.sort((left, right) => (discoveryOrder.get(left) ?? 0) - (discoveryOrder.get(right) ?? 0));

  const positions = new Map<string, { x: number; y: number }>();
  for (const [rank, ids] of layers) {
    ids.forEach((id, index) => positions.set(id, {
      x: 80 + rank * 280,
      y: 120 + (index - (ids.length - 1) / 2) * 190,
    }));
  }
  return positions;
}
function nextNodeId(type: string, nodes: CanvasNode[]) {
  let sequence = nodes.length + 1;
  let id = `${type}-${sequence}`;
  while (nodes.some((node) => node.id === id)) {
    sequence += 1;
    id = `${type}-${sequence}`;
  }
  return id;
}
function graphNodes(workflow?: Workflow): CanvasNode[] {
  const graph = asGraph(workflow);
  if (!graph?.nodes.length) return START_NODES;
  const graphMetadata = (graph as WorkflowGraph & { _uiMetadata?: unknown })._uiMetadata;
  const positionSources = [
    new Map(graph.nodes.flatMap((node) => { const position = readPosition(node.position); return position ? [[node.id, position] as const] : []; })),
    new Map(graph.nodes.flatMap((node) => { const position = readPosition(node.positionAbsolute); return position ? [[node.id, position] as const] : []; })),
    metadataPositions(workflow?.uiMetadata),
    metadataPositions(graphMetadata),
  ];
  let positions = positionSources.find((source) => hasUsablePositionSet(source, graph.nodes.length));
  if (!positions) {
    const combined = new Map<string, { x: number; y: number }>();
    for (const source of positionSources) for (const [nodeId, position] of source) if (!combined.has(nodeId)) combined.set(nodeId, position);
    positions = hasUsablePositionSet(combined, graph.nodes.length) ? combined : treePositions(graph.nodes, graph.edges ?? []);
  }
  return graph.nodes.map((node, index) => {
    const assignment = node.assignments?.[0];
    return {
      ...node,
      type: node.type || "user_task",
      position: positions.get(node.id) ?? { x: 80 + (index % 3) * 230, y: 100 + Math.floor(index / 3) * 150 },
      data: {
        ...(node.data || {}),
        label: node.data?.label || node.name || node.type || "Bước",
        assignmentStrategy: node.data?.assignmentStrategy || assignment?.type || "BY_ROLE",
        targetRole: node.data?.targetRole || (assignment?.type === "BY_ROLE" ? assignment.value : undefined),
        inputHandles: edgeHandleIds(workflow, node.id, "target"),
        outputHandles: edgeHandleIds(workflow, node.id, "source"),
      },
    };
  }) as CanvasNode[];
}
function graphEdges(workflow?: Workflow): Edge[] {
  const graph = asGraph(workflow);
  return (graph?.edges ?? []).map((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);
    const sourceHandle = edge.sourceHandle?.trim() || null;
    const targetHandle = edge.targetHandle?.trim() || null;
    const action = edge.action || (typeof edge.data?.action === "string" ? edge.data.action : "");
    const branchLabel = sourceHandle === "true" ? "Đúng" : sourceHandle === "false" ? "Sai" : "";
    const condition = edge.condition ?? edge.data?.condition ?? edge.data?.expression;
    const displayLabel = edge.label?.trim() || [action, branchLabel].filter(Boolean).join(" · ") || branchLabel || action || undefined;
    const generatedLabel = !edge.label?.trim() && Boolean(displayLabel);
    return {
      ...edge,
      id: edge.id || `edge-${index}`,
      source,
      target,
      sourceHandle,
      targetHandle,
      type: "smoothstep",
      label: displayLabel,
      data: {
        ...(edge.data ?? {}),
        ...(condition === undefined ? {} : { condition }),
        ...(generatedLabel ? { workflowGeneratedLabel: displayLabel } : {}),
      },
      style: { ...(edge.style ?? {}), stroke: "var(--primary)", strokeWidth: 2.25 },
      markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" },
      labelStyle: { fill: "var(--foreground)", fontSize: 11, fontWeight: 600 },
      labelBgStyle: { fill: "var(--background)", fillOpacity: 0.95 },
      labelBgPadding: [5, 3],
      labelBgBorderRadius: 4,
    };
  }) as Edge[];
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
  const { screenToFlowPosition } = useReactFlow();
  const readOnly = forceReadOnly;
  const currentNode = useMemo(() => nodes.find((node) => node.id === selectedNode), [nodes, selectedNode]);
  const currentEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdge), [edges, selectedEdge]);
  const updateNode = (patch: Partial<WorkflowNodeData>) => setNodes((items) => items.map((node) => node.id === selectedNode ? { ...node, data: { ...node.data, ...patch } } : node));
  const updateEdge = (patch: Partial<Edge>) => setEdges((items) => items.map((edge) => edge.id === selectedEdge ? { ...edge, ...patch } : edge));
  function addNode(type: string, label: string) {
    const node: CanvasNode = { id: nextNodeId(type, nodes), type, position: { x: 100 + (nodes.length % 3) * 240, y: 130 + Math.floor(nodes.length / 3) * 150 }, data: { label } };
    setNodes((items) => [...items, node]); setSelectedNode(node.id); setSelectedEdge(null);
  }
  function graphForSave(): WorkflowGraph {
    return {
      nodes: nodes.map(({ selected: _selected, dragging: _dragging, measured: _measured, ...node }) => ({
        ...node,
        type: node.type || "user_task",
        ...(node.type === "user_task" ? { assignments: [{ id: `${node.id}:assignment`, type: String(node.data.assignmentStrategy || "BY_ROLE"), value: String(node.data.targetRole || "") }] } : {}),
      })),
      edges: edges.map(({ selected: _selected, label, ...edge }) => {
        const data = { ...(edge.data ?? {}) };
        const generatedLabel = data.workflowGeneratedLabel === label;
        delete data.workflowGeneratedLabel;
        return {
          ...edge,
          data,
          label: generatedLabel ? undefined : typeof label === "string" ? label : undefined,
          source: edge.source,
          target: edge.target,
          ...(data.condition === undefined ? {} : { condition: data.condition }),
        };
      }),
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
      <aside className="border-b p-4 xl:border-b-0 xl:border-r"><h2 className="mb-3 text-sm font-semibold">Thành phần</h2><div className="grid grid-cols-2 gap-2 xl:grid-cols-1">{NODE_OPTIONS.map(({ type, label, icon: Icon }) => <Button key={type} variant="outline" size="sm" className="justify-start cursor-grab active:cursor-grabbing" draggable={!readOnly} onDragStart={(event) => { event.dataTransfer.setData('application/reactflow', type); event.dataTransfer.setData('application/reactflow-label', label); event.dataTransfer.effectAllowed = 'move'; }} disabled={readOnly} onClick={() => addNode(type, label)}><Icon />{label}</Button>)}</div><p className="mt-5 text-xs leading-relaxed text-muted-foreground">Kéo thả (hoặc click) thành phần vào sơ đồ. Kéo từ chấm bên phải của bước sang chấm bên trái bước kế tiếp để nối luồng.</p><div className="mt-5 space-y-2"><Label htmlFor="workflow-description">Mô tả</Label><Textarea id="workflow-description" value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Mục đích và phạm vi áp dụng" disabled={readOnly} /></div></aside>
      <div className="h-[60vh] min-h-[440px] xl:h-auto" onDrop={readOnly ? undefined : (event) => { event.preventDefault(); const type = event.dataTransfer.getData('application/reactflow'); const label = event.dataTransfer.getData('application/reactflow-label'); if (!type) return; const position = screenToFlowPosition({ x: event.clientX, y: event.clientY }); const newNode: CanvasNode = { id: nextNodeId(type, nodes), type, position, data: { label } }; setNodes((nds) => nds.concat(newNode)); setSelectedNode(newNode.id); setSelectedEdge(null); }} onDragOver={readOnly ? undefined : (event) => { event.preventDefault(); event.dataTransfer.dropEffect = 'move'; }}><ReactFlow nodes={nodes} edges={edges} nodeTypes={nodeTypes} onNodesChange={readOnly ? undefined : onNodesChange} onEdgesChange={readOnly ? undefined : onEdgesChange} onConnect={readOnly ? undefined : (connection: Connection) => setEdges((items) => addEdge({ ...connection, id: `edge-${Math.random().toString(36).substring(2, 10)}`, type: "smoothstep", animated: true, style: { stroke: "var(--primary)", strokeWidth: 2.25 }, markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" } }, items))} onNodeClick={(_event, node) => { setSelectedNode(node.id); setSelectedEdge(null); }} onEdgeClick={(_event, edge) => { setSelectedEdge(edge.id); setSelectedNode(null); }} onPaneClick={() => { setSelectedNode(null); setSelectedEdge(null); }} nodesConnectable={!readOnly} nodesDraggable={!readOnly} fitView fitViewOptions={{ padding: 0.2, minZoom: 0.1, maxZoom: 1.1 }}><Background variant={BackgroundVariant.Dots} gap={20} size={1} /><Controls /><MiniMap pannable zoomable /></ReactFlow></div>
      <aside className="border-t p-4 xl:border-l xl:border-t-0"><h2 className="mb-1 text-sm font-semibold">Thuộc tính</h2><p className="mb-4 text-xs text-muted-foreground">{currentNode ? "Cấu hình bước đang chọn" : currentEdge ? "Cấu hình nhánh đang chọn" : "Chọn một bước hoặc nhánh trên sơ đồ"}</p>
        {currentNode && <div className="space-y-4"><div className="space-y-2"><Label>Tên bước</Label><Input value={String(currentNode.data.label || "")} onChange={(event) => updateNode({ label: event.target.value })} disabled={readOnly} /></div>{currentNode.type === "user_task" && <><div className="space-y-2"><Label>Chiến lược phân công</Label><Select value={String(currentNode.data.assignmentStrategy || "BY_ROLE")} onValueChange={(value) => updateNode({ assignmentStrategy: value })} disabled={readOnly}><SelectTrigger className="w-full"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="BY_ROLE">Theo chức danh</SelectItem><SelectItem value="CREATOR">Người tạo hồ sơ</SelectItem><SelectItem value="PREVIOUS_ACTOR">Người xử lý bước trước</SelectItem></SelectContent></Select></div>{(currentNode.data.assignmentStrategy === "BY_ROLE" || !currentNode.data.assignmentStrategy) && <div className="space-y-2"><Label>Chức danh xử lý</Label><Select value={String(currentNode.data.targetRole || "")} onValueChange={(value) => updateNode({ targetRole: value })} disabled={readOnly || roles.isPending}><SelectTrigger className="w-full"><SelectValue placeholder="Chọn chức danh từ API" /></SelectTrigger><SelectContent>{(roles.data ?? []).map((role) => <SelectItem key={role.code} value={role.code}>{role.name}</SelectItem>)}</SelectContent></Select>{roles.isError && <p className="text-xs text-destructive">Không tải được danh sách chức danh từ backend.</p>}</div>}</>}{currentNode.type === "service_task" && <div className="space-y-2"><Label>Mã Action tự động</Label><Input value={String(currentNode.data.actionCode || "")} onChange={(event) => updateNode({ actionCode: event.target.value })} disabled={readOnly} placeholder="Ví dụ: SEND_EMAIL" /><p className="text-[10px] text-muted-foreground">Mã hành động mà hệ thống (hoặc Worker) sẽ thực thi.</p></div>}{!readOnly && <Button variant="destructive" className="w-full" onClick={() => { setNodes((nds) => nds.filter((n) => n.id !== currentNode.id)); setEdges((eds) => eds.filter((e) => e.source !== currentNode.id && e.target !== currentNode.id)); setSelectedNode(null); }}><Trash2 className="mr-2 size-4" /> Xóa bước này</Button>}</div>}
        {currentEdge && <div className="space-y-3"><div className="space-y-2"><Label>Nhãn nhánh</Label><Input value={currentEdge.data?.workflowGeneratedLabel === currentEdge.label ? "" : typeof currentEdge.label === "string" ? currentEdge.label : ""} onChange={(event) => updateEdge({ label: event.target.value })} disabled={readOnly} placeholder="Ví dụ: Hồ sơ hợp lệ" /></div><div className="space-y-2"><Label>Biểu thức điều kiện (Condition)</Label><Input value={String(currentEdge.data?.condition || "")} onChange={(event) => updateEdge({ data: { ...(currentEdge.data || {}), condition: event.target.value } })} disabled={readOnly} placeholder="Ví dụ: status == 'APPROVED'" /></div><p className="flex gap-2 rounded-md bg-muted p-3 text-xs leading-relaxed text-muted-foreground"><CircleHelp className="size-4 shrink-0" />Điều kiện nghiệp vụ và biến số thực tế cần tuân theo data schema của loại quy trình (Process Type).</p>{!readOnly && <Button variant="destructive" className="w-full" onClick={() => { setEdges((eds) => eds.filter((e) => e.id !== currentEdge.id)); setSelectedEdge(null); }}><Trash2 className="mr-2 size-4" /> Xóa nhánh này</Button>}</div>}
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
