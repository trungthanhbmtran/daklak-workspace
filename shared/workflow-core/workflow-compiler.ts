import { NodeData, EdgeData, WorkflowDefinition, ValidationContext, WorkflowContext } from './workflow-engine';

export interface CompiledNode {
  id: string;
  type?: string;
  data: any;
  allowedActions: string[];
  validateFn?: (context: ValidationContext) => boolean;
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

      // Compile validation expression
      try {
        let body = `with (context || {}) {\n`;

        if (node.type === 'user_task') {
          // Data-driven permissions evaluation
          body += `  const perms = ${JSON.stringify(node.data?.permissions || {})};\n`;
          body += `  if (!perms[actionName]) return false;\n`; // Must be explicitly allowed
          body += `  const allowed = perms[actionName];\n`;
          body += `  if (allowed.length === 0) return true;\n`; // Empty means no role restrictions
          body += `  const roles = [...(userRoles || [])];\n`;
          body += `  if (typeof isOwner !== 'undefined' && isOwner) roles.push('OWNER');\n`;
          body += `  if (typeof isAssignee !== 'undefined' && isAssignee) roles.push('ASSIGNEE');\n`;
          body += `  if (typeof isSupervisor !== 'undefined' && isSupervisor) roles.push('SUPERVISOR');\n`;
          body += `  if (typeof isDeptLeader !== 'undefined' && isDeptLeader) roles.push('DEPT_LEADER');\n`;
          body += `  if (typeof isAdmin !== 'undefined' && isAdmin) roles.push('ADMIN');\n`;
          body += `  if (typeof isCoordinator !== 'undefined' && isCoordinator) roles.push('COORDINATOR');\n`;
          body += `  if (allowed.includes('ANY') || allowed.includes('PARTICIPANT')) return true;\n`;
          body += `  return allowed.some(r => roles.includes(r));\n`;
          body += `}`;
        } else if (node.data?.validationExpression) {
          body += `  return (function() {\n    ${node.data.validationExpression}\n  })();\n}`;
        } else {
          body += `  return true;\n}`;
        }

        compiledNode.validateFn = new Function('context', body) as (context: ValidationContext) => boolean;
      } catch (e) {
        console.error(`[WorkflowCompiler] Failed to compile validationExpression for node ${node.id}`, e);
      }



      // Compile allowed actions statically
      compiledNode.allowedActions = this.extractAllowedActions(node, compiledNode.outEdges);

      compiledNodes.set(node.id, compiledNode);
    }

    // 2. Compile Gateway Edges
    for (const edge of edges) {
      const sourceNode = compiledNodes.get(edge.source);
      if (sourceNode && sourceNode.type === 'exclusive_gateway') {
        const compiledEdge: CompiledGatewayEdge = { edge };

        if (edge.data?.expression) {
          try {
            compiledEdge.conditionFn = new Function('context', `
               with (context || {}) {
                  return (${edge.data.expression});
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

    if (node.data?.validationExpression) {
      const regex = /actionName\s*===\s*['"]([^'"]+)['"]/g;
      let match;
      while ((match = regex.exec(node.data.validationExpression)) !== null) {
        possibleActions.add(match[1]);
      }
    }

    if (node.data?.actionName) {
      possibleActions.add(node.data.actionName);
    }

    outEdges.forEach((edge) => {
      if (edge.data?.actionName) possibleActions.add(edge.data.actionName);
      else if (edge.label) possibleActions.add(edge.label);
    });

    if (possibleActions.size === 0) {
      ['ASSIGN', 'COMPLETE', 'APPROVE', 'RETURN'].forEach((a) => possibleActions.add(a));
    }

    if (node.data?.allowAddSubtask) possibleActions.add('ADD_SUBTASK');
    if (node.data?.allowCoordinate) possibleActions.add('COORDINATE');
    if (node.data?.allowEdit) possibleActions.add('EDIT');
    if (node.data?.allowDelete) possibleActions.add('DELETE');
    if (node.data?.allowChat !== false) possibleActions.add('CHAT');
    if (node.type === 'user_task' && node.data?.allowAssign !== false) possibleActions.add('ASSIGN');

    return Array.from(possibleActions);
  }
}
