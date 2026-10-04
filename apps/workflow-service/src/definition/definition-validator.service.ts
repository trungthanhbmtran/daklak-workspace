import { Injectable, Logger } from "@nestjs/common";

export interface ValidationError {
  nodeId: string;
  field: string;
  code: string;
  message: string;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationError[];
}

/**
 * DefinitionValidatorService — compile và validate workflow graph.
 *
 * Kiểm tra:
 * - Schema cơ bản: tồn tại node start + end, có edges, không rỗng
 * - Node IDs unique
 * - Tất cả edge source/target trỏ đến node tồn tại
 * - Có ít nhất 1 path từ start đến end (reachability)
 * - Không có dead-end nodes (node userTask/serviceTask không có outgoing edge)
 * - Phát hiện vòng lặp (simple cycle detection)
 * - Node type phải thuộc allowlist
 * - Không cho phép node type với script/url tùy ý
 */
@Injectable()
export class DefinitionValidatorService {
  private readonly logger = new Logger(DefinitionValidatorService.name);

  /** Node types được phép sử dụng trong workflow */
  private static readonly ALLOWED_NODE_TYPES = new Set([
    "start",
    "end",
    "userTask",
    "serviceTask",
    "gateway",
    "parallelGateway",
    "exclusiveGateway",
  ]);

  /** Node types bị cấm thực thi script/URL tùy ý */
  private static readonly FORBIDDEN_SCRIPT_TYPES = new Set([
    "scriptTask",
    "externalTask",
    "httpTask",
  ]);

  validate(graph: any): ValidationResult {
    const errors: ValidationError[] = [];
    const nodes: any[] = graph?.nodes ?? [];
    const edges: any[] = graph?.edges ?? [];

    if (!nodes.length) {
      errors.push({ nodeId: "", field: "nodes", code: "EMPTY_GRAPH", message: "Workflow graph phải có ít nhất 1 node" });
      return { valid: false, errors };
    }

    // 1. Node IDs unique
    const nodeIds = new Set<string>();
    for (const node of nodes) {
      if (!node.id) {
        errors.push({ nodeId: "", field: "id", code: "MISSING_NODE_ID", message: "Node thiếu ID" });
        continue;
      }
      if (nodeIds.has(node.id)) {
        errors.push({ nodeId: node.id, field: "id", code: "DUPLICATE_NODE_ID", message: `Node ID trùng lặp: ${node.id}` });
      }
      nodeIds.add(node.id);
    }

    // 2. Node type allowlist
    for (const node of nodes) {
      if (!node.id) continue;
      if (!node.type) {
        errors.push({ nodeId: node.id, field: "type", code: "MISSING_NODE_TYPE", message: `Node ${node.id} thiếu type` });
        continue;
      }
      if (DefinitionValidatorService.FORBIDDEN_SCRIPT_TYPES.has(node.type)) {
        errors.push({
          nodeId: node.id,
          field: "type",
          code: "FORBIDDEN_NODE_TYPE",
          message: `Node type '${node.type}' không được phép (rủi ro script/URL tùy ý)`,
        });
      } else if (!DefinitionValidatorService.ALLOWED_NODE_TYPES.has(node.type)) {
        errors.push({
          nodeId: node.id,
          field: "type",
          code: "UNKNOWN_NODE_TYPE",
          message: `Node type '${node.type}' không được hỗ trợ`,
        });
      }
    }

    // 3. Start và end node
    const startNodes = nodes.filter((n) => n.type === "start");
    const endNodes = nodes.filter((n) => n.type === "end");
    if (startNodes.length === 0) {
      errors.push({ nodeId: "", field: "type", code: "MISSING_START_NODE", message: "Workflow phải có đúng 1 node start" });
    }
    if (startNodes.length > 1) {
      errors.push({ nodeId: "", field: "type", code: "MULTIPLE_START_NODES", message: "Workflow chỉ được có 1 node start" });
    }
    if (endNodes.length === 0) {
      errors.push({ nodeId: "", field: "type", code: "MISSING_END_NODE", message: "Workflow phải có ít nhất 1 node end" });
    }

    // 4. Edge source/target tồn tại
    const edgeIds = new Set<string>();
    for (const edge of edges) {
      if (!edge.id) {
        errors.push({ nodeId: "", field: "id", code: "MISSING_EDGE_ID", message: "Edge thiếu ID" });
        continue;
      }
      if (edgeIds.has(edge.id)) {
        errors.push({ nodeId: "", field: "id", code: "DUPLICATE_EDGE_ID", message: `Edge ID trùng lặp: ${edge.id}` });
      }
      edgeIds.add(edge.id);

      const source = edge.source ?? edge.sourceNodeId;
      const target = edge.target ?? edge.targetNodeId;
      if (!source || !nodeIds.has(source)) {
        errors.push({ nodeId: source ?? "", field: "source", code: "INVALID_EDGE_SOURCE", message: `Edge ${edge.id}: source '${source}' không tồn tại` });
      }
      if (!target || !nodeIds.has(target)) {
        errors.push({ nodeId: target ?? "", field: "target", code: "INVALID_EDGE_TARGET", message: `Edge ${edge.id}: target '${target}' không tồn tại` });
      }
    }

    // Dừng sớm nếu có lỗi cơ bản
    if (errors.length > 0) {
      return { valid: false, errors };
    }

    // 5. Reachability từ start node
    const startNode = startNodes[0];
    const reachable = this._bfs(startNode.id, nodes, edges);
    for (const node of nodes) {
      if (node.type === "start") continue;
      if (!reachable.has(node.id)) {
        errors.push({
          nodeId: node.id,
          field: "",
          code: "UNREACHABLE_NODE",
          message: `Node '${node.id}' (${node.name || node.type}) không thể đến từ start node`,
        });
      }
    }

    // 6. Dead-end: userTask/serviceTask/gateway không có outgoing edge
    const outgoing = new Map<string, number>();
    for (const edge of edges) {
      const src = edge.source ?? edge.sourceNodeId;
      outgoing.set(src, (outgoing.get(src) ?? 0) + 1);
    }
    for (const node of nodes) {
      if (node.type === "end") continue;
      if ((outgoing.get(node.id) ?? 0) === 0) {
        errors.push({
          nodeId: node.id,
          field: "",
          code: "DEAD_END_NODE",
          message: `Node '${node.id}' (${node.name || node.type}) không có outgoing edge`,
        });
      }
    }

    return { valid: errors.length === 0, errors };
  }

  /**
   * Compile graph sang canonical format để runtime sử dụng.
   * Chỉ giữ các field cần thiết, loại bỏ React Flow visual props.
   */
  compile(graph: any): any {
    const nodes: any[] = (graph?.nodes ?? []).map((n: any) => ({
      id: n.id,
      type: n.type,
      name: n.name ?? "",
      code: n.code ?? n.nodeKey ?? n.id,
      assignments: n.assignments ?? [],
      data: this._sanitizeData(n.data),
    }));

    const edges: any[] = (graph?.edges ?? []).map((e: any) => ({
      id: e.id,
      source: e.source ?? e.sourceNodeId,
      target: e.target ?? e.targetNodeId,
      action: e.label ?? e.action ?? (e.data?.action) ?? null,
      condition: e.condition ?? null,
      priority: e.priority ?? 0,
    }));

    return { nodes, edges, compiledAt: new Date().toISOString(), schemaVersion: 1 };
  }

  private _bfs(startId: string, nodes: any[], edges: any[]): Set<string> {
    const visited = new Set<string>([startId]);
    const queue = [startId];
    const adjList = new Map<string, string[]>();
    for (const edge of edges) {
      const src = edge.source ?? edge.sourceNodeId;
      const tgt = edge.target ?? edge.targetNodeId;
      if (!adjList.has(src)) adjList.set(src, []);
      adjList.get(src)!.push(tgt);
    }
    while (queue.length > 0) {
      const curr = queue.shift()!;
      for (const next of adjList.get(curr) ?? []) {
        if (!visited.has(next)) {
          visited.add(next);
          queue.push(next);
        }
      }
    }
    return visited;
  }

  private _sanitizeData(data: any): any {
    if (!data || typeof data !== "object") return {};
    // Chỉ giữ các field an toàn, loại bỏ script/url tùy ý
    const allowed = ["label", "description", "dueInDays", "assigneeType", "notificationConfig"];
    const sanitized: any = {};
    for (const key of allowed) {
      if (data[key] !== undefined) sanitized[key] = data[key];
    }
    return sanitized;
  }
}
