import { NodeData, EdgeData, WorkflowDefinition, ValidationContext } from '../engine/workflow-engine';
import { WorkflowContext } from '../plugins/node.plugin';
export interface CompiledNode {
  id: string;
  type?: string;
  data: any;
  allowedActions: string[];
  outEdges: EdgeData[]; // direct reference to outgoing edges for O(1) traversal
}

export interface CompiledGatewayEdge {
  edge: EdgeData;
  conditionFn?: (context: any) => boolean;
}

export interface CompiledWorkflow {
  nodes: Map<string, CompiledNode>;
  edges: EdgeData[];
  initialNodeId: string | null;
  gatewayEdges: Map<string, CompiledGatewayEdge[]>; // sourceNodeId -> compiled edges
}

export class WorkflowCompiler {
  private static cache = new Map<string, CompiledWorkflow>();

  /**
   * Clears the cache, useful for hot-reloading or testing
   */
  public static clearCache() {
    this.cache.clear();
  }

  /**
   * Compiles and caches the workflow definition. 
   * If a cacheKey is provided and exists, it returns the cached version.
   */
  public static compile(definition: WorkflowDefinition, cacheKey?: string): CompiledWorkflow {
    if (cacheKey && this.cache.has(cacheKey)) {
      return this.cache.get(cacheKey)!;
    }

    const compiled = this.doCompile(definition);

    if (cacheKey) {
      this.cache.set(cacheKey, compiled);
    }

    return compiled;
  }

  private static doCompile(definition: WorkflowDefinition): CompiledWorkflow {
    const nodes = definition.nodes || [];
    const edges = definition.edges || [];

    const compiledNodes = new Map<string, CompiledNode>();
    const gatewayEdges = new Map<string, CompiledGatewayEdge[]>();

    // Pre-calculate outgoing edges for O(1) lookup
    const outEdgesMap = new Map<string, EdgeData[]>();
    for (const edge of edges) {
      if (!outEdgesMap.has(edge.source)) {
        outEdgesMap.set(edge.source, []);
      }
      outEdgesMap.get(edge.source)!.push(edge);
    }

    // 1. Compile Nodes
    for (const node of nodes) {
      const compiledNode: CompiledNode = {
        id: node.id,
        type: node.type,
        data: node.data || {},
        allowedActions: [],
        outEdges: outEdgesMap.get(node.id) || [],
      };

      // Permissions validation is now delegated to NodePlugins in WorkflowEngine.

      // Compile allowed actions statically
      compiledNode.allowedActions = this.extractAllowedActions(node, compiledNode.outEdges);

      compiledNodes.set(node.id, compiledNode);
    }

    // 2. Compile Gateway Edges
    for (const edge of edges) {
      const sourceNode = compiledNodes.get(edge.source);
      if (sourceNode && sourceNode.type === 'exclusive_gateway') {
        const compiledEdge: CompiledGatewayEdge = { edge };
        const conditionStr = edge.label || edge.data?.condition || edge.data?.expression;

        if (conditionStr) {
          try {
            compiledEdge.conditionFn = new Function('context', `
               with (context || {}) {
                  try {
                    return (${conditionStr});
                  } catch (err) {
                    return false;
                  }
               }
            `) as (context: any) => boolean;
          } catch (e) {
            console.error(`[WorkflowCompiler] Failed to compile gateway expression for edge ${edge.id}`, e);
          }
        }

        if (!gatewayEdges.has(edge.source)) {
          gatewayEdges.set(edge.source, []);
        }
        gatewayEdges.get(edge.source)!.push(compiledEdge);
      }
    }

    // 3. Find initial node
    const startNode = nodes.find((n) => n.type === 'start');
    let initialNodeId: string | null = null;
    if (startNode) {
      const startOutEdge = outEdgesMap.get(startNode.id)?.[0];
      initialNodeId = startOutEdge ? startOutEdge.target : startNode.id;
    }

    return {
      nodes: compiledNodes,
      edges,
      initialNodeId,
      gatewayEdges,
    };
  }

  private static extractAllowedActions(node: NodeData, outEdges: EdgeData[]): string[] {
    const possibleActions = new Set<string>();

    // 1. user_task với permissions object — lấy action từ keys của permissions
    if (node.type === 'user_task' && node.data?.permissions) {
      const permKeys = Object.keys(node.data.permissions);
      permKeys.forEach(a => possibleActions.add(a));
    }


    // 3. Explicit actionName on node data
    if (node.data?.actionName) {
      possibleActions.add(node.data.actionName);
    }

    // 4. Outgoing edge actions
    outEdges.forEach((edge) => {
      if (edge.data?.actionName) possibleActions.add(edge.data.actionName);
      else if (edge.label) possibleActions.add(edge.label);
    });

    // 5. Nếu vẫn rỗng → fallback mặc định
    if (possibleActions.size === 0) {
      ['ASSIGN', 'COMPLETE', 'APPROVE', 'RETURN'].forEach((a) => possibleActions.add(a));
    }

    // 6. Flag-based auxiliary actions
    if (node.data?.allowAddSubtask) possibleActions.add('ADD_SUBTASK');
    if (node.data?.allowCoordinate) possibleActions.add('COORDINATE');
    if (node.data?.allowEdit) possibleActions.add('EDIT');
    if (node.data?.allowDelete) possibleActions.add('DELETE');
    if (node.data?.allowChat !== false) possibleActions.add('CHAT');
    if (node.type === 'user_task' && node.data?.allowAssign !== false) possibleActions.add('ASSIGN');

    return Array.from(possibleActions);
  }
}
