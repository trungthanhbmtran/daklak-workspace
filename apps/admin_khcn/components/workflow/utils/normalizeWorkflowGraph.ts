/* eslint-disable @typescript-eslint/no-explicit-any */
import { MarkerType, type Edge, type Node } from "@xyflow/react";
import { parseWorkflowDefinition } from "./parseWorkflowDefinition";

const GRID_X = 280;
const GRID_Y = 160;

/**
 * Chuẩn hoá graph đã lưu thành node/edge hợp lệ cho React Flow ở chế độ chỉ xem.
 * - Node thiếu `position` (bị rơi khi qua gRPC) được xếp lưới xác định, không random.
 * - Node thiếu `data` được gán `{ label: name }` để node component không bị lỗi.
 * - Edge hỗ trợ cả cặp `source/target` lẫn `sourceNodeId/targetNodeId`.
 */
export function normalizeWorkflowGraph(workflow: any): { nodes: Node[]; edges: Edge[] } {
  const definition = parseWorkflowDefinition(workflow);

  const nodes: Node[] = definition.nodes
    .filter((n: any) => n && n.id)
    .map((n: any, index: number) => {
      const hasPosition =
        n.position && Number.isFinite(n.position.x) && Number.isFinite(n.position.y);
      const fallbackX = Number.isFinite(n.x) ? n.x : (index % 4) * GRID_X;
      const fallbackY = Number.isFinite(n.y) ? n.y : Math.floor(index / 4) * GRID_Y;
      return {
        id: String(n.id),
        type: n.type,
        position: hasPosition ? n.position : { x: fallbackX, y: fallbackY },
        data: { label: n.name, ...(n.data || {}) },
        draggable: false,
        selectable: false,
        connectable: false,
      };
    });

  const nodeIds = new Set(nodes.map((n) => n.id));

  const edges: Edge[] = definition.edges
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
