/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { parseWorkflowDefinition } from "./parseWorkflowDefinition";

/**
 * Chuẩn hoá graph đã lưu thành node/edge hợp lệ cho React Flow ở chế độ chỉ xem.
 * Dùng parseWorkflowDefinition làm source of truth để tái sử dụng logic parse/normalize.
 */
export function normalizeWorkflowGraph(workflow: any): { nodes: Node[]; edges: Edge[] } {
  const { nodes: parsedNodes, edges: parsedEdges } = parseWorkflowDefinition(workflow);

  const nodes: Node[] = parsedNodes
    .filter((n: any) => n && n.id)
    .map((n: any) => ({
      id: String(n.id),
      type: n.type,
      position: n.position,
      data: n.data || { label: n.name || n.id },
      draggable: false,
      selectable: false,
      connectable: false,
    }));

  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges: Edge[] = parsedEdges
    .map((e: any, index: number) => {
      const source = String(e.source || e.sourceNodeId || "");
      const target = String(e.target || e.targetNodeId || "");
      return {
        id: e.id || `edge-${source}-${target}-${index}`,
        source,
        target,
        sourceHandle: e.sourceHandle || undefined,
        targetHandle: e.targetHandle || undefined,
        type: e.type || "custom",
        label: e.label || e.data?.label,
        data: e.data || {},
        animated: true,
        markerEnd: { type: MarkerType.ArrowClosed, width: 18, height: 18, color: "#3b82f6" },
        style: { strokeWidth: 2, stroke: "#3b82f6" },
      } as Edge;
    })
    // Bỏ edge trỏ tới node không tồn tại để tránh cảnh báo/lỗi render
    .filter((e: Edge) => nodeIds.has(e.source) && nodeIds.has(e.target));

  return { nodes, edges };
}
