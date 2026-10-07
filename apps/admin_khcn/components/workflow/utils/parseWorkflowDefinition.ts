/**
 * Bóc tách nodes và edges từ nhiều định dạng dữ liệu workflow khác nhau
 * trả về từ backend (bpmnLogic, uiMetadata, definition, graph...).
 *
 * Chiến lược ưu tiên:
 * 1. Nếu bpmnLogic có nodes (kể cả có position), dùng trực tiếp và merge thêm từ uiMetadata nếu có.
 * 2. Nếu không, fallback về definition.nodes / data.nodes.
 */
export function parseWorkflowDefinition(data: any): { nodes: any[], edges: any[] } {
  if (!data) {
    return { nodes: [], edges: [] };
  }

  // Bảng ánh xạ type backend sang React Flow frontend
  const typeMap: Record<string, string> = {
    userTask: 'user_task',
    serviceTask: 'service_task',
    scriptTask: 'script_task',
    exclusiveGateway: 'exclusive_gateway',
    parallelGateway: 'parallel_gateway',
  };

  const normalizeType = (t: string | undefined) => (t ? (typeMap[t] || t) : t);

  // Lấy bpmnLogic và uiMetadata từ data (đã được gateway parse từ JSON string về object)
  let bpmnLogic = data.bpmnLogic;
  let uiMetadata = data.uiMetadata;

  // Parse nếu vẫn còn là string
  if (typeof bpmnLogic === 'string') {
    try { bpmnLogic = JSON.parse(bpmnLogic); } catch { bpmnLogic = null; }
  }
  if (typeof uiMetadata === 'string') {
    try { uiMetadata = JSON.parse(uiMetadata); } catch { uiMetadata = null; }
  }

  // Kiểm tra bpmnLogic có nodes thực sự không
  const bpmnNodes: any[] = Array.isArray(bpmnLogic?.nodes) ? bpmnLogic.nodes : [];
  const bpmnEdges: any[] = Array.isArray(bpmnLogic?.edges) ? bpmnLogic.edges : [];

  if (bpmnNodes.length > 0) {
    // uiMetadata có thể có position bổ sung — dùng để merge nếu bpmnLogic thiếu position
    const uiNodes: any[] = Array.isArray(uiMetadata?.nodes) ? uiMetadata.nodes : [];
    const uiEdges: any[] = Array.isArray(uiMetadata?.edges) ? uiMetadata.edges : [];

    const mergedNodes = bpmnNodes.map((bNode: any, index: number) => {
      // Ưu tiên merge position từ uiMetadata nếu bNode chưa có
      const uiNode = uiNodes.find((u: any) => u.id === bNode.id) || {};

      // Xác định position: bNode.position > uiNode.position > fallback lưới
      const hasPosition =
        bNode.position &&
        typeof bNode.position.x === 'number' &&
        typeof bNode.position.y === 'number';
      const uiHasPosition =
        uiNode.position &&
        typeof uiNode.position.x === 'number' &&
        typeof uiNode.position.y === 'number';
      const position = hasPosition
        ? bNode.position
        : uiHasPosition
          ? uiNode.position
          : { x: (index % 4) * 280, y: Math.floor(index / 4) * 160 };

      return {
        ...bNode,
        ...uiNode,
        id: String(bNode.id),
        type: normalizeType(bNode.type || uiNode.type),
        position,
        data: {
          ...(uiNode.data || {}),
          ...(bNode.data || {}),
          // Đảm bảo label luôn có — lấy theo thứ tự ưu tiên
          label: bNode.data?.label || uiNode.data?.label || bNode.name || `Node ${index + 1}`,
        },
      };
    });

    const mergedEdges = bpmnEdges.map((bEdge: any, index: number) => {
      const uiEdge = uiEdges.find((u: any) => u.id === bEdge.id) || {};
      const source = String(bEdge.source || bEdge.sourceNodeId || uiEdge.source || '');
      const target = String(bEdge.target || bEdge.targetNodeId || uiEdge.target || '');
      return {
        ...bEdge,
        ...uiEdge,
        id: String(bEdge.id || `edge-${source}-${target}-${index}`),
        source,
        target,
        data: { ...(bEdge.data || {}), ...(uiEdge.data || {}) },
      };
    });

    return { nodes: mergedNodes, edges: mergedEdges };
  }

  // Fallback 1: definition.nodes
  let definition = data.definition;
  if (!definition && data.workflowDefinition) definition = data.workflowDefinition;
  if (!definition && data.graph) definition = data.graph;

  if (typeof definition === 'string') {
    try { definition = JSON.parse(definition); } catch { definition = null; }
  }
  // Unwrap nested definition
  if (definition?.definition) definition = definition.definition;
  // Unwrap _uiMetadata nếu có
  if (definition?._uiMetadata && !definition?.nodes) definition = definition._uiMetadata;

  if (definition && (definition.nodes || definition.edges)) {
    const defNodes = Array.isArray(definition.nodes) ? definition.nodes : [];
    const defEdges = Array.isArray(definition.edges) ? definition.edges : [];
    return {
      nodes: defNodes.map((n: any) => ({ ...n, type: normalizeType(n.type) })),
      edges: defEdges,
    };
  }

  // Fallback 2: data trực tiếp có nodes/edges
  if (data.nodes || data.edges) {
    const rawNodes = Array.isArray(data.nodes) ? data.nodes : [];
    const rawEdges = Array.isArray(data.edges) ? data.edges : [];
    return {
      nodes: rawNodes.map((n: any) => ({ ...n, type: normalizeType(n.type) })),
      edges: rawEdges,
    };
  }

  return { nodes: [], edges: [] };
}
