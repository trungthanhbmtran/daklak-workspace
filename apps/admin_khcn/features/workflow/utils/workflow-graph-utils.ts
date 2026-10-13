import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { Check, GitBranch, Settings2, UserRound } from "lucide-react";
import type { Workflow, WorkflowGraph, WorkflowNodeData, WorkflowPhase } from "@/features/workflow/api";

export type CanvasNode = Node<WorkflowNodeData>;

export const START_NODES: CanvasNode[] = [
  { id: "start-1", type: "start", position: { x: 80, y: 180 }, data: { label: "Bắt đầu" } },
];

export const NODE_OPTIONS = [
  { type: "user_task", label: "Bước phê duyệt", icon: UserRound, description: "Phê duyệt bởi cán bộ / lãnh đạo theo thẩm quyền" },
  { type: "service_task", label: "Bước tự động", icon: Settings2, description: "Xử lý ngầm qua rule engine / microservice worker" },
  { type: "exclusive_gateway", label: "Rẽ nhánh (XOR)", icon: GitBranch, description: "Rẽ một nhánh điều kiện duy nhất" },
  { type: "parallel_gateway", label: "Song song (AND)", icon: GitBranch, description: "Thực hiện đồng thời nhiều luồng công việc" },
  { type: "gateway", label: "Điều phối chung", icon: GitBranch, description: "Hợp nhất hoặc điều phối luồng" },
  { type: "end", label: "Kết thúc", icon: Check, description: "Hoàn tất và lưu trữ hồ sơ" },
] as const;

export const NODE_LABELS: Record<string, string> = {
  start: "Bắt đầu",
  end: "Kết thúc",
  user_task: "Bước phê duyệt",
  userTask: "Bước phê duyệt",
  service_task: "Bước tự động",
  serviceTask: "Bước tự động",
  exclusive_gateway: "Rẽ nhánh",
  exclusiveGateway: "Rẽ nhánh",
  parallel_gateway: "Song song",
  parallelGateway: "Song song",
  gateway: "Điều phối",
};

export const EDGE_ACTION_LABELS: Record<string, string> = {
  ASSIGN_START: "Khởi tạo & Giao việc",
  DISPATCH_TO_DEPT: "Phân luồng về phòng chuyên môn",
  ROUTED_TO_DEPT: "Tiếp nhận nhiệm vụ cấp phòng",
  ASSIGN_OFFICER: "Giao Chuyên viên 22 VTVL chủ trì",
  SUBMIT_FOR_REVIEW: "Nộp sản phẩm kèm minh chứng",
  CHECK_QUALITY: "Thẩm định chất lượng (3 mức lỗi)",
  RETURN: "Có lỗi · Trả lại sửa (-5% / -15% / -35%)",
  SUBMIT_TO_BAN: "Đạt chuẩn · Ký nháy trình Lãnh đạo Ban",
  EVALUATE_DECISION: "Xem xét & Phê duyệt Tờ trình",
  BAN_REQUEST_REVIEW: "Chỉ đạo rà soát lại",
  BAN_APPROVE: "Phê duyệt (Ký số CA) / Trình BTVTU",
  BAN_CANCEL: "Đình chỉ / Hủy nhiệm vụ",
  KPI_COMPLETED: "Tính điểm KPI 4 thành tố & Lưu trữ ATTT Cấp 3",
  INITIATE_PERIOD: "Kích hoạt kỳ đánh giá quý",
  SUBMIT_MAU_01: "Đăng ký danh mục (Mẫu 01)",
  SUBMIT_MAU_02: "Tự chấm điểm (Mẫu 02)",
  SUBMIT_MAU_04: "Kê khai nổi trội (Mẫu 04)",
  SUBMIT_MAU_03: "Họp phòng & Thẩm định (Mẫu 03)",
  CHECK_AUDIT: "Đối soát 08 nguồn CSDL & Rà soát kỷ luật",
  HAS_VIOLATION: "Có vi phạm (Kỷ luật / Lọt lộ bí mật)",
  NO_VIOLATION: "Không vi phạm (Đủ điều kiện xét)",
  FORWARD_DEMOTION: "Chuyển danh sách ấn định hạ bậc",
  CAPS_APPLIED: "Áp trần 20% & Trần người đứng đầu",
  COUNCIL_REVIEW: "Hội đồng Ban họp xét duyệt",
  REQUEST_REWORK: "Yêu cầu phòng rà soát lại",
  COUNCIL_APPROVED: "Hội đồng thông qua kết quả",
  PUBLISH_RESULTS: "Ban hành QĐ (Mẫu 05) & Công khai",
  CHECK: "Kiểm tra tính hợp lệ",
  INVALID: "Không hợp lệ · Từ chối",
  VALID: "Hợp lệ · Chuyển xác minh",
  VERIFIED: "Đã xác minh · Trình phê duyệt",
  APPROVE: "Phê duyệt",
  SUBMIT: "Trình duyệt hồ sơ / văn bản",
  REVIEW: "Thẩm định / Xem xét",
  PUBLISH: "Ban hành văn bản",
  REJECT: "Từ chối tiếp nhận",
  ASSIGN: "Phân công xử lý",
  ACCEPT: "Tiếp nhận xử lý",
  SUBMIT_REPORT: "Báo cáo kết quả",
  EVALUATE: "Đánh giá kết quả",
  REWORK: "Yêu cầu làm lại",
};

export function getNodeRoleInfo(nodeId: string, nodeType?: string, data?: WorkflowNodeData) {
  const isGateway = nodeType?.toLowerCase().includes("gateway") ?? false;
  const isService = nodeType?.toLowerCase().includes("service") ?? false;
  const isStart = nodeType === "start";
  const isEnd = nodeType === "end";

  if (isStart) return { label: "KHỞI TẠO LUỒNG", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/60" };
  if (isEnd) return { label: "KẾT THÚC LUỒNG", badgeClass: "bg-slate-500/10 text-slate-700 dark:text-slate-300 border-slate-300/60" };
  if (isGateway) return { label: "ĐIỀU PHỐI / RẼ NHÁNH", badgeClass: "bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-300/60" };
  if (isService) return { label: "HỆ THỐNG / RULE ENGINE", badgeClass: "bg-cyan-500/10 text-cyan-700 dark:text-cyan-300 border-cyan-300/60" };

  const roleCode = String(data?.targetRole || "");
  const desc = String(data?.description || "");
  const label = String(data?.label || "");
  const id = nodeId.toLowerCase();

  if (id.startsWith("btv_") || label.includes("BTV") || desc.includes("BTV") || label.includes("Thường vụ") || desc.includes("Thường vụ")) {
    return { label: "BTV TỈNH ỦY", badgeClass: "bg-purple-500/10 text-purple-700 dark:text-purple-300 border-purple-300/70" };
  }
  if (id.startsWith("ldb_") || roleCode === "LANH_DAO_BAN" || label.includes("Lãnh đạo Ban") || desc.includes("Lãnh đạo Ban") || label.includes("Trưởng ban")) {
    return { label: "LÃNH ĐẠO BAN", badgeClass: "bg-red-500/10 text-red-700 dark:text-red-300 border-red-300/70" };
  }
  if (id.startsWith("ldp_") || roleCode === "LANH_DAO_PHONG" || label.includes("Lãnh đạo Phòng") || desc.includes("Lãnh đạo Phòng") || label.includes("Trưởng phòng") || id.includes("phong_hop")) {
    return { label: "LÃNH ĐẠO PHÒNG", badgeClass: "bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-300/70" };
  }
  if (id.startsWith("cv_") || roleCode === "CHUYEN_VIEN" || label.includes("Chuyên viên") || desc.includes("Chuyên viên") || id.includes("officer") || id.includes("tucham") || id.includes("dangky") || id.includes("noitroi")) {
    return { label: "CHUYÊN VIÊN 22 VTVL", badgeClass: "bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border-emerald-300/70" };
  }
  if (label.includes("Hội đồng") || id.includes("hoidong") || desc.includes("Hội đồng")) {
    return { label: "HỘI ĐỒNG THẨM ĐỊNH", badgeClass: "bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 border-indigo-300/70" };
  }
  if (label.includes("MẪU") || label.includes("Mẫu")) {
    return { label: "MẪU BIỂU ĐÁNH GIÁ", badgeClass: "bg-teal-500/10 text-teal-700 dark:text-teal-300 border-teal-300/70" };
  }

  return { label: "BƯỚC PHÊ DUYỆT", badgeClass: "bg-muted text-muted-foreground border-border" };
}

export function extractFormBadge(label?: string, description?: string, formSchema?: unknown): string | null {
  const text = `${label || ""} ${description || ""} ${typeof formSchema === "string" ? formSchema : ""}`;
  const match = text.match(/MẪU\s*0[1-5]|Mẫu\s*0[1-5]|Mẫu\s*2C/i);
  return match ? match[0].toUpperCase() : null;
}

export function asGraph(workflow?: Workflow): WorkflowGraph | undefined {
  if (!workflow) return undefined;
  let definition: unknown = workflow.definition;
  if (typeof definition === "string") {
    try {
      definition = JSON.parse(definition);
    } catch {
      definition = undefined;
    }
  }

  if (definition && typeof definition === "object") {
    const defObj = definition as Record<string, unknown>;
    if (Array.isArray(defObj.nodes)) {
      return {
        nodes: defObj.nodes as WorkflowGraph["nodes"],
        edges: (Array.isArray(defObj.edges) ? defObj.edges : []) as WorkflowGraph["edges"],
        phases: (Array.isArray(defObj.phases) ? defObj.phases : []) as WorkflowPhase[],
      };
    }
    if (defObj.graph && typeof defObj.graph === "object" && Array.isArray((defObj.graph as WorkflowGraph).nodes)) {
      return defObj.graph as WorkflowGraph;
    }
  }

  let bpmnLogic: unknown = workflow.bpmnLogic;
  if (typeof bpmnLogic === "string") {
    try {
      bpmnLogic = JSON.parse(bpmnLogic);
    } catch {
      bpmnLogic = undefined;
    }
  }
  if (bpmnLogic && typeof bpmnLogic === "object" && Array.isArray((bpmnLogic as WorkflowGraph).nodes)) {
    return bpmnLogic as WorkflowGraph;
  }

  return undefined;
}

export function edgeEndpoint(primary?: string, legacy?: string) {
  return primary?.trim() || legacy?.trim() || "";
}

export function edgeHandleIds(workflow: Workflow | undefined, nodeId: string, side: "source" | "target"): string[] {
  const graph = asGraph(workflow);
  const handleIds = new Set<string>();
  for (const edge of graph?.edges ?? []) {
    const endpoint = side === "source"
      ? edgeEndpoint(edge.source, edge.sourceNodeId)
      : edgeEndpoint(edge.target, edge.targetNodeId);
    const handleId = side === "source" ? edge.sourceHandle : edge.targetHandle;
    if (endpoint !== nodeId) continue;
    if (handleId?.trim()) handleIds.add(handleId.trim());
  }
  const fixedHandleIds = new Set([`${side}-top`, `${side}-bottom`, side === "source" ? "source-right" : "target-left"]);
  const sortedHandles = [...handleIds].sort((left, right) => {
    const order = (value: string) => value === "true" ? 0 : value === "false" ? 1 : 2;
    return order(left) - order(right) || left.localeCompare(right);
  });
  return sortedHandles.filter((id) => !fixedHandleIds.has(id));
}

export function readPosition(value: unknown): { x: number; y: number } | undefined {
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

export function metadataPositions(metadata: unknown): Map<string, { x: number; y: number }> {
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

export function layeredPositions(nodes: WorkflowGraph["nodes"], edges: WorkflowGraph["edges"]): Map<string, { x: number; y: number }> {
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

export function autoLayoutPositions(nodes: WorkflowGraph["nodes"], edges: WorkflowGraph["edges"]): Map<string, { x: number; y: number }> {
  const children = new Map(nodes.map((node) => [node.id, [] as Array<{ id: string; priority: number; index: number }>]));
  const parents = new Map(nodes.map((node) => [node.id, new Set<string>()]));
  edges.forEach((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);
    if (!children.has(source) || !parents.has(target) || parents.get(target)?.has(source)) return;
    const handle = (edge.sourceHandle || "").toLowerCase();
    const priority = handle === "true" || handle === "yes" ? 0 : handle === "false" || handle === "no" ? 2 : 1;
    children.get(source)?.push({ id: target, priority, index });
    parents.get(target)?.add(source);
  });
  for (const items of children.values()) items.sort((left, right) => left.priority - right.priority || left.index - right.index);

  const roots = nodes
    .filter((node) => parents.get(node.id)?.size === 0)
    .sort((left, right) => Number(right.type === "start") - Number(left.type === "start"));
  const remainingParents = new Map(nodes.map((node) => [node.id, parents.get(node.id)?.size ?? 0]));
  const queue = roots.map((node) => node.id);
  for (let cursor = 0; cursor < queue.length; cursor += 1) {
    for (const child of children.get(queue[cursor]) ?? []) {
      const remaining = (remainingParents.get(child.id) ?? 0) - 1;
      remainingParents.set(child.id, remaining);
      if (remaining === 0) queue.push(child.id);
    }
  }

  const isTree = queue.length === nodes.length && nodes.every((node) => (parents.get(node.id)?.size ?? 0) <= 1);
  if (!isTree) return layeredPositions(nodes, edges);

  const positions = new Map<string, { x: number; y: number }>();
  let leafIndex = 0;
  const placeSubtree = (nodeId: string, depth: number): number => {
    const childIds = (children.get(nodeId) ?? []).map((child) => child.id);
    const childRows = childIds.map((childId) => placeSubtree(childId, depth + 1));
    const y = childRows.length
      ? (childRows[0] + childRows[childRows.length - 1]) / 2
      : 100 + leafIndex++ * 190;
    positions.set(nodeId, { x: 80 + depth * 280, y });
    return y;
  };
  for (const root of roots) placeSubtree(root.id, 0);
  return positions;
}

export function nextNodeId(type: string, nodes: CanvasNode[]) {
  let sequence = nodes.length + 1;
  let id = `${type}-${sequence}`;
  while (nodes.some((node) => node.id === id)) {
    sequence += 1;
    id = `${type}-${sequence}`;
  }
  return id;
}

export function graphNodes(workflow?: Workflow): CanvasNode[] {
  const graph = asGraph(workflow);
  if (!graph?.nodes?.length) return START_NODES;
  const graphMetadata = (graph as WorkflowGraph & { _uiMetadata?: unknown })._uiMetadata;
  const positionSources = [
    new Map(graph.nodes.flatMap((node) => { const position = readPosition(node.position); return position ? [[node.id, position] as const] : []; })),
    new Map(graph.nodes.flatMap((node) => { const position = readPosition(node.positionAbsolute); return position ? [[node.id, position] as const] : []; })),
    metadataPositions(workflow?.uiMetadata),
    metadataPositions(graphMetadata),
  ];
  let positions = positionSources.find((source) => source.size === graph.nodes.length);
  if (!positions) {
    const combined = new Map<string, { x: number; y: number }>();
    for (const source of positionSources) {
      for (const [nodeId, position] of source) {
        if (!combined.has(nodeId)) combined.set(nodeId, position);
      }
    }
    positions = combined.size === graph.nodes.length ? combined : autoLayoutPositions(graph.nodes, graph.edges ?? []);
  }
  return graph.nodes.map((node, index) => {
    const assignment = node.assignments?.[0];
    const nodeType = node.type || "user_task";
    return {
      ...node,
      type: nodeType,
      position: positions.get(node.id) ?? { x: 80 + (index % 3) * 260, y: 100 + Math.floor(index / 3) * 180 },
      data: {
        ...(node.data || {}),
        label: String(node.data?.label || node.name || node.type || "Bước"),
        description: node.data?.description || node.description,
        formSchema: node.data?.formSchema,
        targetStatus: node.data?.targetStatus,
        assignmentStrategy: node.data?.assignmentStrategy || assignment?.type || "BY_ROLE",
        targetRole: node.data?.targetRole || (assignment?.type === "BY_ROLE" ? assignment.value : undefined),
        inputHandles: edgeHandleIds(workflow, node.id, "target"),
        outputHandles: edgeHandleIds(workflow, node.id, "source"),
      },
    };
  }) as unknown as CanvasNode[];
}

export function resolveDefaultHandles(
  sourceNode?: CanvasNode,
  targetNode?: CanvasNode,
  explicitSource?: string | null,
  explicitTarget?: string | null,
): { sourceHandle: string; targetHandle: string } {
  let sourceHandle = explicitSource?.trim() || "";
  let targetHandle = explicitTarget?.trim() || "";

  if (!sourceHandle || !targetHandle) {
    if (sourceNode && targetNode) {
      const dx = targetNode.position.x - sourceNode.position.x;
      const dy = targetNode.position.y - sourceNode.position.y;

      // Target node is mostly directly below (dọc xuống)
      if (dy > 80 && Math.abs(dx) < 160) {
        if (!sourceHandle) sourceHandle = "source-bottom";
        if (!targetHandle) targetHandle = "target-top";
      }
      // Target node is mostly directly above (dọc lên)
      else if (dy < -80 && Math.abs(dx) < 160) {
        if (!sourceHandle) sourceHandle = "source-top";
        if (!targetHandle) targetHandle = "target-bottom";
      }
      // Target node is to the left (quay lại vòng lặp)
      else if (dx < -60) {
        if (!sourceHandle) sourceHandle = "source-bottom";
        if (!targetHandle) targetHandle = "target-bottom";
      }
    }
  }

  return {
    sourceHandle: sourceHandle || "source-right",
    targetHandle: targetHandle || "target-left",
  };
}

export function graphEdges(workflow?: Workflow, canvasNodes?: CanvasNode[]): Edge[] {
  const graph = asGraph(workflow);
  const nodeMap = new Map((canvasNodes || []).map((n) => [n.id, n]));

  return (graph?.edges ?? []).map((edge, index) => {
    const source = edgeEndpoint(edge.source, edge.sourceNodeId);
    const target = edgeEndpoint(edge.target, edge.targetNodeId);

    const sourceNode = nodeMap.get(source);
    const targetNode = nodeMap.get(target);

    const { sourceHandle, targetHandle } = resolveDefaultHandles(
      sourceNode,
      targetNode,
      edge.sourceHandle,
      edge.targetHandle
    );

    const action = edge.action || (typeof edge.data?.action === "string" ? edge.data.action : "");
    const actionLabel = action ? (EDGE_ACTION_LABELS[action] || action) : "";
    const branchLabel = sourceHandle === "true" ? "Đúng" : sourceHandle === "false" ? "Sai" : "";
    const condition = edge.condition ?? edge.data?.condition ?? edge.data?.expression;
    const rawLabel = edge.label?.trim() || (typeof edge.data?.label === "string" ? edge.data.label.trim() : "");
    const displayLabel = rawLabel || [actionLabel, branchLabel].filter(Boolean).join(" · ") || branchLabel || actionLabel || undefined;
    const generatedLabel = !rawLabel && Boolean(displayLabel);

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
      labelBgPadding: [6, 3],
      labelBgBorderRadius: 6,
    };
  }) as Edge[];
}

export function createCode(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase()
    .replace(/[^A-Z0-9]+/g, "_")
    .replace(/^_|_$/g, "")
    .slice(0, 40);
}
