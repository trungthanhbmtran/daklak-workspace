"use client";

import { useMemo, useState, useCallback, useEffect } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import {
  Background,
  BackgroundVariant,
  Controls,
  MarkerType,
  MiniMap,
  Panel,
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useReactFlow,
  type Connection,
  type Edge,
  useEdgesState,
  useNodesState,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import {
  ArrowDownWideNarrow,
  ArrowLeft,
  Layers,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
  Save,
  Send,
  Workflow as WorkflowIcon,
  Maximize2,
  RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { usePublishWorkflow, useSaveWorkflow, useWorkflowDefinition, useWorkflowRoles } from "@/features/workflow/hooks";
import type { Workflow, WorkflowGraph, WorkflowNodeData, WorkflowPhase } from "@/features/workflow/api";
import { WORKFLOW_ROUTES } from "@/features/workflow/routes";
import { organizationApi } from "@/features/system-admin/organization/api";
import type { OrganizationUnitNode } from "@/features/system-admin/organization/types";
import { unwrapData } from "@/lib/api-helper";
import { WorkflowNodeCard } from "../components/WorkflowNodeCard";
import { WorkflowCanvasOverlay } from "../components/WorkflowCanvasOverlay";
import { WorkflowSidebarLeft } from "../components/WorkflowSidebarLeft";
import { WorkflowInspectorRight } from "../components/WorkflowInspectorRight";
import {
  autoLayoutPositions,
  graphNodes,
  graphEdges,
  nextNodeId,
  createCode,
  asGraph,
  resolveDefaultHandles,
  type CanvasNode,
} from "../utils/workflow-graph-utils";

const nodeTypes = {
  start: WorkflowNodeCard,
  end: WorkflowNodeCard,
  user_task: WorkflowNodeCard,
  userTask: WorkflowNodeCard,
  service_task: WorkflowNodeCard,
  serviceTask: WorkflowNodeCard,
  exclusive_gateway: WorkflowNodeCard,
  exclusiveGateway: WorkflowNodeCard,
  parallel_gateway: WorkflowNodeCard,
  parallelGateway: WorkflowNodeCard,
  gateway: WorkflowNodeCard,
};

function WorkflowEditor({
  id,
  workflow,
  forceReadOnly = false,
}: {
  id?: string;
  workflow?: Workflow;
  forceReadOnly?: boolean;
}) {
  const router = useRouter();
  const roles = useWorkflowRoles();
  const save = useSaveWorkflow();
  const publish = usePublishWorkflow();

  const [workflowId, setWorkflowId] = useState(id);
  const [name, setName] = useState(workflow?.name || "");
  const [code, setCode] = useState(workflow?.code || "");
  const [description, setDescription] = useState(workflow?.description || "");
  const [ownerUnitCode, setOwnerUnitCode] = useState(workflow?.ownerUnitCode || "");
  const [phases, setPhases] = useState<WorkflowPhase[]>(() => asGraph(workflow)?.phases ?? []);
  const [newPhaseName, setNewPhaseName] = useState("");
  const [selectedPhaseId, setSelectedPhaseId] = useState<string | null>(null);

  // Panel toggles for fluid, full-screen canvas workflow
  const [isLeftSidebarOpen, setIsLeftSidebarOpen] = useState(true);
  const [isRightInspectorOpen, setIsRightInspectorOpen] = useState(true);

  // Organization units query
  const organizationTree = useQuery({
    queryKey: ["organizations", "tree"],
    queryFn: () => organizationApi.getTree(),
    select: (res) => unwrapData<OrganizationUnitNode[]>(res, []),
  });
  const unitTree = organizationTree.data ?? [];

  const initialNodes = useMemo(() => graphNodes(workflow), [workflow]);
  const initialEdges = useMemo(() => graphEdges(workflow, initialNodes), [workflow, initialNodes]);

  const [nodes, setNodes, onNodesChange] = useNodesState<CanvasNode>(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>(initialEdges);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<string | null>(null);

  const { screenToFlowPosition, fitView: fitWorkflowView } = useReactFlow();
  const readOnly = forceReadOnly;

  const currentNode = useMemo(() => nodes.find((node) => node.id === selectedNode), [nodes, selectedNode]);
  const currentEdge = useMemo(() => edges.find((edge) => edge.id === selectedEdge), [edges, selectedEdge]);

  // Node & Edge mutations
  const updateNode = useCallback((patch: Partial<WorkflowNodeData>) => {
    setNodes((items) =>
      items.map((node) => (node.id === selectedNode ? { ...node, data: { ...node.data, ...patch } } : node))
    );
  }, [selectedNode, setNodes]);

  const updateEdge = useCallback((patch: Partial<Edge>) => {
    setEdges((items) =>
      items.map((edge) => (edge.id === selectedEdge ? { ...edge, ...patch } : edge))
    );
  }, [selectedEdge, setEdges]);

  const deleteNode = useCallback((nodeId: string) => {
    setNodes((nds) => nds.filter((n) => n.id !== nodeId));
    setEdges((eds) => eds.filter((e) => e.source !== nodeId && e.target !== nodeId));
    setSelectedNode(null);
    toast.success("Đã xóa bước");
  }, [setNodes, setEdges]);

  const deleteEdge = useCallback((edgeId: string) => {
    setEdges((eds) => eds.filter((e) => e.id !== edgeId));
    setSelectedEdge(null);
    toast.success("Đã xóa nhánh");
  }, [setEdges]);

  // Select handlers with auto-opening inspector
  const handleSelectNode = useCallback((nodeId: string) => {
    setSelectedNode(nodeId);
    setSelectedEdge(null);
    setIsRightInspectorOpen(true);
  }, []);

  const handleSelectEdge = useCallback((edgeId: string) => {
    setSelectedEdge(edgeId);
    setSelectedNode(null);
    setIsRightInspectorOpen(true);
  }, []);

  const handleDeselect = useCallback(() => {
    setSelectedNode(null);
    setSelectedEdge(null);
  }, []);

  // Keyboard shortcut listener (Delete/Backspace to delete selected element, Escape to deselect)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const activeTag = document.activeElement?.tagName?.toLowerCase();
      if (activeTag === "input" || activeTag === "textarea" || activeTag === "select") return;

      if (e.key === "Delete" || e.key === "Backspace") {
        if (selectedNode && !readOnly) {
          e.preventDefault();
          deleteNode(selectedNode);
        } else if (selectedEdge && !readOnly) {
          e.preventDefault();
          deleteEdge(selectedEdge);
        }
      } else if (e.key === "Escape") {
        handleDeselect();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedNode, selectedEdge, readOnly, deleteNode, deleteEdge, handleDeselect]);

  function addNode(type: string, label: string) {
    const node: CanvasNode = {
      id: nextNodeId(type, nodes),
      type,
      position: { x: 100 + (nodes.length % 3) * 260, y: 140 + Math.floor(nodes.length / 3) * 160 },
      data: { label },
    };
    setNodes((items) => [...items, node]);
    handleSelectNode(node.id);
    toast.success(`Đã thêm bước: ${label}`);
  }

  function arrangeWorkflow() {
    const positions = autoLayoutPositions(
      nodes as unknown as WorkflowGraph["nodes"],
      edges as unknown as WorkflowGraph["edges"]
    );
    setNodes((items) => items.map((node) => ({ ...node, position: positions.get(node.id) ?? node.position })));
    requestAnimationFrame(() => void fitWorkflowView({ padding: 0.18, duration: 400, minZoom: 0.3, maxZoom: 1.1 }));
    toast.success("Đã tự động sắp xếp các bước theo luồng xử lý chuẩn");
  }

  function addWorkflowPhase() {
    const phaseName = newPhaseName.trim();
    if (!phaseName) return;
    const pId = `phase-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`;
    setPhases((items) => [...items, { id: pId, name: phaseName, order: items.length + 1 }]);
    setNewPhaseName("");
    setSelectedPhaseId(pId);
    toast.success(`Đã thêm giai đoạn: ${phaseName}`);
  }

  function updateWorkflowPhase(phaseId: string, patch: Partial<WorkflowPhase>) {
    setPhases((items) => items.map((phase) => (phase.id === phaseId ? { ...phase, ...patch } : phase)));
  }

  function removeWorkflowPhase(phaseId: string) {
    setPhases((items) => items.filter((phase) => phase.id !== phaseId).map((phase, index) => ({ ...phase, order: index + 1 })));
    setNodes((items) =>
      items.map((node) => (node.data.phaseId === phaseId ? { ...node, data: { ...node.data, phaseId: undefined } } : node))
    );
    if (selectedPhaseId === phaseId) setSelectedPhaseId(null);
    toast.info("Đã xóa giai đoạn");
  }

  function focusWorkflowPhase(phaseId: string) {
    const phaseNodes = nodes.filter((node) => node.data.phaseId === phaseId);
    if (!phaseNodes.length) {
      setSelectedPhaseId(phaseId);
      toast.info("Chưa có bước nào trong giai đoạn này. Chọn giai đoạn ở thuộc tính của bước.");
      return;
    }
    setSelectedPhaseId(phaseId);
    void fitWorkflowView({ nodes: phaseNodes, padding: 0.28, duration: 450, minZoom: 0.35, maxZoom: 1.1 });
  }

  function graphForSave(): WorkflowGraph {
    return {
      nodes: nodes.map(({ selected: _selected, dragging: _dragging, measured: _measured, ...node }) => ({
        ...node,
        type: node.type || "user_task",
        ...(node.type === "user_task"
          ? {
              assignments: [
                {
                  id: `${node.id}:assignment`,
                  type: String(node.data?.assignmentStrategy || "BY_ROLE"),
                  value: String(node.data?.targetRole || ""),
                },
              ],
            }
          : {}),
      })),
      edges: edges.map(({ selected: _selected, label, ...edge }) => {
        const data = { ...(edge.data ?? {}) };
        const generatedLabel = data.workflowGeneratedLabel === label;
        delete data.workflowGeneratedLabel;
        const normalizedLabel = typeof label === "string" && label.trim() ? label.trim() : undefined;
        return {
          ...edge,
          data: {
            ...data,
            ...(normalizedLabel ? { label: normalizedLabel } : {}),
          },
          label: normalizedLabel,
          source: edge.source,
          target: edge.target,
          ...(data.condition === undefined ? {} : { condition: data.condition }),
        };
      }),
      phases: phases.map((phase, index) => ({ ...phase, order: index + 1 })),
    };
  }

  async function saveDraft() {
    if (!name.trim()) {
      toast.error("Vui lòng nhập tên quy trình trước khi lưu");
      return;
    }
    const nextCode = code.trim() || createCode(name);
    if (!nextCode) {
      toast.error("Vui lòng nhập mã quy trình");
      return;
    }
    try {
      const result = await save.mutateAsync({
        id: workflowId,
        data: {
          name: name.trim(),
          code: nextCode,
          description: description.trim() || undefined,
          ownerUnitCode: ownerUnitCode || undefined,
          definition: graphForSave(),
        },
      });
      setWorkflowId(result.id);
      setCode(result.code);
      toast.success("Đã lưu bản nháp quy trình thành công");
      if (!id) router.replace(WORKFLOW_ROUTES.edit(result.id));
    } catch {
      toast.error("Không thể lưu bản nháp. Vui lòng kiểm tra dữ liệu và quyền truy cập.");
    }
  }

  async function publishWorkflow() {
    if (!workflowId) {
      toast.error("Vui lòng lưu bản nháp trước khi phát hành");
      return;
    }
    if (!ownerUnitCode) {
      toast.warning("Vui lòng chọn Đơn vị sở hữu quy trình ở mục Thông tin trước khi phát hành");
      setIsLeftSidebarOpen(true);
      return;
    }
    try {
      await publish.mutateAsync(workflowId);
      toast.success("Quy trình đã được kiểm tra tính hợp lệ và phát hành thành công");
    } catch {
      toast.error("Không thể phát hành. Hãy kiểm tra cấu trúc sơ đồ, các bước rẽ nhánh và quyền hạn.");
    }
  }

  return (
    <div className="w-full min-h-[calc(100vh-6.5rem)] flex flex-col min-w-0 bg-background rounded-xl border border-border shadow-2xs">
      {/* ===================== HEADER BAR ===================== */}
      <header className="flex flex-wrap items-center justify-between gap-3 border-b px-4 py-3 bg-card/80 backdrop-blur-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(WORKFLOW_ROUTES.list)}
            aria-label="Quay lại danh sách quy trình"
            className="size-8 shrink-0 text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="size-4" />
          </Button>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <Input
                className="h-8 w-full sm:w-64 md:w-80 font-bold text-sm tracking-tight border-transparent hover:border-border focus:border-primary px-2 transition-all min-w-0 flex-1 sm:flex-initial"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Tên quy trình nghiệp vụ..."
                disabled={readOnly}
                aria-label="Tên quy trình"
              />
              {workflow && (
                <Badge
                  variant={workflow.status === "PUBLISHED" ? "default" : "secondary"}
                  className="px-2 py-0.5 text-[11px] shrink-0"
                >
                  {workflow.status === "PUBLISHED" ? "Đã phát hành" : "Bản nháp"} · v{workflow.version ?? 1}
                </Badge>
              )}
            </div>
            <p className="ml-2 text-[11px] font-mono text-muted-foreground truncate">
              {code || "Mã sẽ tự sinh theo tên quy trình"}
            </p>
          </div>
        </div>

        {/* CỤM NÚT THAO TÁC HEADER */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-wrap">
          {/* TOGGLE LEFT SIDEBAR */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsLeftSidebarOpen((prev) => !prev)}
            className="h-8 px-2 sm:px-2.5 text-xs text-muted-foreground gap-1.5 flex"
            title={isLeftSidebarOpen ? "Ẩn cột thiết lập" : "Hiện cột thiết lập"}
          >
            {isLeftSidebarOpen ? <PanelLeftClose className="size-3.5" /> : <PanelLeftOpen className="size-3.5" />}
            <span className="hidden xl:inline">{isLeftSidebarOpen ? "Đóng thiết lập" : "Mở thiết lập"}</span>
          </Button>

          {/* SẮP XẾP SƠ ĐỒ */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={arrangeWorkflow}
            disabled={nodes.length < 2}
            className="h-8 px-2 sm:px-2.5 text-xs gap-1.5"
            title="Tự động căn chỉnh các bước theo thứ tự luồng"
          >
            <ArrowDownWideNarrow className="size-3.5 text-primary" />
            <span className="hidden sm:inline">Sắp xếp luồng</span>
          </Button>

          {/* TOGGLE RIGHT INSPECTOR */}
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={() => setIsRightInspectorOpen((prev) => !prev)}
            className="h-8 px-2 sm:px-2.5 text-xs text-muted-foreground gap-1.5 flex"
            title={isRightInspectorOpen ? "Ẩn cột thuộc tính" : "Hiện cột thuộc tính"}
          >
            {isRightInspectorOpen ? <PanelRightClose className="size-3.5" /> : <PanelRightOpen className="size-3.5" />}
            <span className="hidden xl:inline">{isRightInspectorOpen ? "Đóng thuộc tính" : "Mở thuộc tính"}</span>
          </Button>

          {/* LƯU NHÁP */}
          <Button
            variant="outline"
            size="sm"
            onClick={() => void saveDraft()}
            disabled={readOnly || save.isPending}
            className="h-8 px-3 text-xs gap-1.5"
          >
            {save.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Save className="size-3.5" />}
            {save.isPending ? "Đang lưu…" : "Lưu nháp"}
          </Button>

          {/* PHÁT HÀNH */}
          <Button
            size="sm"
            onClick={() => void publishWorkflow()}
            disabled={readOnly || publish.isPending || !workflowId}
            className="h-8 px-3 text-xs gap-1.5 bg-primary text-primary-foreground shadow-xs"
          >
            {publish.isPending ? <Loader2 className="size-3.5 animate-spin" /> : <Send className="size-3.5" />}
            {publish.isPending ? "Đang phát hành…" : "Phát hành"}
          </Button>
        </div>
      </header>

      {/* ===================== WORKSPACE 3-ZONE LAYOUT ===================== */}
      <div className="flex-1 min-w-0 flex flex-col lg:flex-row relative min-h-[580px] overflow-hidden rounded-b-xl">
        {/* CỘT TRÁI: THÀNH PHẦN, GIAI ĐOẠN & THIẾT LẬP */}
        <WorkflowSidebarLeft
          readOnly={readOnly}
          isOpen={isLeftSidebarOpen}
          onToggle={() => setIsLeftSidebarOpen(false)}
          name={name}
          setName={setName}
          code={code}
          setCode={setCode}
          description={description}
          setDescription={setDescription}
          ownerUnitCode={ownerUnitCode}
          setOwnerUnitCode={setOwnerUnitCode}
          unitTree={unitTree}
          isTreeLoading={organizationTree.isPending}
          isTreeError={organizationTree.isError}
          phases={phases}
          selectedPhaseId={selectedPhaseId}
          newPhaseName={newPhaseName}
          setNewPhaseName={setNewPhaseName}
          onAddPhase={addWorkflowPhase}
          onUpdatePhase={updateWorkflowPhase}
          onRemovePhase={removeWorkflowPhase}
          onFocusPhase={focusWorkflowPhase}
          onAddNode={addNode}
          nodes={nodes}
        />

        {/* KHÔNG GIAN CANVAS TRUNG TÂM */}
        <div
          className="relative flex-1 min-w-0 h-[65vh] lg:h-auto min-h-[520px] bg-muted/10"
          onDrop={
            readOnly
              ? undefined
              : (event) => {
                  event.preventDefault();
                  const type = event.dataTransfer.getData("application/reactflow");
                  const label = event.dataTransfer.getData("application/reactflow-label");
                  if (!type) return;
                  const position = screenToFlowPosition({ x: event.clientX, y: event.clientY });
                  const newNode: CanvasNode = {
                    id: nextNodeId(type, nodes),
                    type,
                    position,
                    data: { label },
                  };
                  setNodes((nds) => nds.concat(newNode));
                  handleSelectNode(newNode.id);
                }
          }
          onDragOver={
            readOnly
              ? undefined
              : (event) => {
                  event.preventDefault();
                  event.dataTransfer.dropEffect = "move";
                }
          }
        >
          {/* NÚT MỞ NHANH SIDEBAR KHI BỊ ẨN */}
          {!isLeftSidebarOpen && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsLeftSidebarOpen(true)}
              className="absolute left-3 top-3 z-20 size-8 rounded-lg bg-background/90 shadow-md backdrop-blur-xs"
              title="Mở cột thiết lập"
            >
              <PanelLeftOpen className="size-4" />
            </Button>
          )}

          {!isRightInspectorOpen && (
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={() => setIsRightInspectorOpen(true)}
              className="absolute right-3 top-3 z-20 size-8 rounded-lg bg-background/90 shadow-md backdrop-blur-xs"
              title="Mở cột thuộc tính"
            >
              <PanelRightOpen className="size-4" />
            </Button>
          )}

          <ReactFlow
            nodes={nodes}
            edges={edges}
            nodeTypes={nodeTypes}
            onNodesChange={readOnly ? undefined : onNodesChange}
            onEdgesChange={readOnly ? undefined : onEdgesChange}
            onConnect={
              readOnly
                ? undefined
                : (connection: Connection) => {
                    const sourceNode = nodes.find((n) => n.id === connection.source);
                    const targetNode = nodes.find((n) => n.id === connection.target);
                    const { sourceHandle, targetHandle } = resolveDefaultHandles(
                      sourceNode,
                      targetNode,
                      connection.sourceHandle,
                      connection.targetHandle
                    );

                    setEdges((items) =>
                      addEdge(
                        {
                          ...connection,
                          sourceHandle,
                          targetHandle,
                          id: `edge-${Math.random().toString(36).substring(2, 10)}`,
                          type: "smoothstep",
                          animated: true,
                          style: { stroke: "var(--primary)", strokeWidth: 2.25 },
                          markerEnd: { type: MarkerType.ArrowClosed, color: "var(--primary)" },
                        },
                        items
                      )
                    );
                  }
            }
            onNodeClick={(_event, node) => handleSelectNode(node.id)}
            onEdgeClick={(_event, edge) => handleSelectEdge(edge.id)}
            onPaneClick={handleDeselect}
            nodesConnectable={!readOnly}
            nodesDraggable={!readOnly}
            fitView
            fitViewOptions={{ padding: 0.18, minZoom: 0.35, maxZoom: 1.15 }}
          >
            {/* OVERLAY RANH GIỚI GIAI ĐOẠN ĐỘNG (ZERO DUPLICATION) */}
            <WorkflowCanvasOverlay
              workflowCode={workflow?.code || code}
              workflowName={name || workflow?.name}
              phases={phases}
              nodes={nodes}
            />

            {/* PANEL CHỈ DẪN VÀ ĐIỀU HƯỚNG GIAI ĐOẠN TRÊN ĐẦU CANVAS */}
            {phases.length > 0 && (
              <Panel position="top-left" className="m-3 ml-12 lg:ml-3 flex max-w-[min(900px,calc(100vw-48px))] flex-wrap items-center gap-1.5 rounded-lg border bg-card/90 p-1.5 shadow-sm backdrop-blur-xs text-[11px] z-10">
                <span className="flex items-center gap-1 font-semibold text-foreground px-1">
                  <Layers className="size-3.5 text-primary" /> Các giai đoạn:
                </span>
                {phases.map((phase, index) => {
                  const count = nodes.filter((node) => node.data.phaseId === phase.id).length;
                  const active = selectedPhaseId === phase.id;
                  return (
                    <Button
                      key={phase.id}
                      type="button"
                      size="sm"
                      variant={active ? "default" : "outline"}
                      className="h-7 px-2 text-xs gap-1.5"
                      title={phase.description || phase.name}
                      onClick={() => focusWorkflowPhase(phase.id)}
                    >
                      <span>{index + 1}. {phase.name}</span>
                      <Badge variant={active ? "secondary" : "outline"} className="px-1 py-0 text-[10px]">
                        {count} bước
                      </Badge>
                    </Button>
                  );
                })}
              </Panel>
            )}

            <Background variant={BackgroundVariant.Dots} gap={20} size={1} />
            <Controls className="bg-background/90 shadow-md border rounded-lg overflow-hidden" />
            <MiniMap
              pannable
              zoomable
              className="bg-card/90 border rounded-lg overflow-hidden shadow-md"
              nodeStrokeColor="var(--primary)"
              nodeColor="#94a3b8"
            />
          </ReactFlow>
        </div>

        {/* CỘT PHẢI: BẢNG THUỘC TÍNH CHI TIẾT (INSPECTOR) */}
        <WorkflowInspectorRight
          readOnly={readOnly}
          isOpen={isRightInspectorOpen}
          onToggle={() => setIsRightInspectorOpen(false)}
          currentNode={currentNode}
          currentEdge={currentEdge}
          phases={phases}
          roles={roles}
          onUpdateNode={updateNode}
          onUpdateEdge={updateEdge}
          onDeleteNode={deleteNode}
          onDeleteEdge={deleteEdge}
          onCloseSelection={handleDeselect}
        />
      </div>
    </div>
  );
}

export function WorkflowEditorScreen({ id, readOnly = false }: { id?: string; readOnly?: boolean }) {
  return (
    <ReactFlowProvider>
      <WorkflowEditorLoader id={id} readOnly={readOnly} />
    </ReactFlowProvider>
  );
}

function WorkflowEditorLoader({ id, readOnly }: { id?: string; readOnly: boolean }) {
  const detail = useWorkflowDefinition(id);

  if (id && detail.isPending) {
    return (
      <div className="flex min-h-[70vh] flex-col items-center justify-center gap-3 text-sm text-muted-foreground">
        <Loader2 className="size-6 animate-spin text-primary" />
        <p>Đang tải cấu trúc quy trình từ backend workflow-service…</p>
      </div>
    );
  }

  if (id && (detail.isError || !detail.data)) {
    return (
      <div role="alert" className="rounded-xl border border-destructive/30 bg-destructive/5 p-8 text-center text-destructive space-y-3">
        <p className="font-semibold text-base">Không thể tải cấu trúc quy trình nghiệp vụ</p>
        <p className="text-xs text-muted-foreground max-w-md mx-auto">
          Đường truyền hoặc quyền truy cập có thể chưa hợp lệ. Vui lòng kiểm tra kết nối với hệ thống hoặc tải lại trang.
        </p>
        <Button
          variant="outline"
          size="sm"
          onClick={() => detail.refetch()}
          className="gap-1.5 text-xs mt-2"
        >
          <RefreshCw className="size-3.5" /> Thử tải lại
        </Button>
      </div>
    );
  }

  return <WorkflowEditor key={id || "new"} id={id} workflow={detail.data ?? undefined} forceReadOnly={readOnly} />;
}
