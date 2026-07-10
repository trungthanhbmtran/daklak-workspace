import { CompiledWorkflow, CompiledNode, WorkflowCompiler } from './workflow-compiler';

export interface WorkflowContext {
  [key: string]: any;
}

export interface NodeData {
  id: string;
  type?: string;
  data?: {
    role?: string;
    validationExpression?: string;
    [key: string]: any;
  };
}

export interface EdgeData {
  id?: string;
  source: string;
  target: string;
  label?: string;
  data?: {
    expression?: string;
    [key: string]: any;
  };
}

export interface WorkflowDefinition {
  nodes: NodeData[];
  edges: EdgeData[];
}

export interface ValidationContext {
  actionName: string;
  userId?: string;
  userRoles?: string[];
  userContext?: any;
  businessData?: any;
  [key: string]: any;
}



export class WorkflowEngine {
  private compiled: CompiledWorkflow;

  /**
   * Initializes the engine with either a compiled workflow (fastest) 
   * or a raw definition (will be compiled immediately).
   * If cacheKey is provided, it will cache the compiled result for future use.
   */
  constructor(definitionOrCompiled: any, cacheKey?: string) {
    if (definitionOrCompiled && definitionOrCompiled.nodes instanceof Map) {
      this.compiled = definitionOrCompiled as CompiledWorkflow;
    } else {
      let definition: WorkflowDefinition;
      if (typeof definitionOrCompiled === 'string') {
        try {
          definition = JSON.parse(definitionOrCompiled);
        } catch (e) {
          definition = { nodes: [], edges: [] };
        }
      } else {
        definition = definitionOrCompiled || { nodes: [], edges: [] };
      }
      this.compiled = WorkflowCompiler.compile(definition, cacheKey);
    }
  }

  public getInitialNodeId(): string | null {
    return this.compiled.initialNodeId;
  }

  public getNode(nodeId: string): CompiledNode | undefined {
    return this.compiled.nodes.get(nodeId);
  }

  public validateAction(
    currentNodeId: string,
    actionName: string,
    userRoles: string[] = [],
    userId?: string,
    businessData?: any,
    userContext?: any,
    currentContext?: WorkflowContext
  ): { allowed: boolean; reason?: string } {
    const node = this.getNode(currentNodeId);
    if (!node) return { allowed: false, reason: 'Current node not found in workflow definition' };

    const ctx = currentContext || businessData || {};

    if (node.validateFn) {
      const evalContext: ValidationContext = {
        ...ctx,
        actionName,
        userId,
        userRoles,
        userContext: userContext || {},
      };
      const isAllowed = node.validateFn(evalContext);
      if (!isAllowed) {
        return { allowed: false, reason: 'Không thỏa mãn điều kiện quy trình chặn.' };
      }
      return { allowed: true };
    }
    return { allowed: true };
  }



  public getAllowedActions(
    currentNodeId: string,
    userRoles: string[] = [],
    userId?: string,
    businessData?: any,
    userContext?: any,
    currentContext?: WorkflowContext
  ): string[] {
    const node = this.getNode(currentNodeId);
    if (!node) return [];

    const allowed: string[] = [];
    for (const action of node.allowedActions) {
      const res = this.validateAction(currentNodeId, action, userRoles, userId, businessData, userContext, currentContext);
      if (res.allowed) allowed.push(action);
    }
    return allowed;
  }

  public getNextNodeId(currentNodeId: string, actionName: string, evalContext?: any): string | null {
    const visited = new Set<string>();
    const queue = [currentNodeId];
    visited.add(currentNodeId);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const sourceNode = this.compiled.nodes.get(curr);
      if (!sourceNode) continue;

      for (const edge of sourceNode.outEdges) {
        const nextNodeId = this.handleEdgeTraversal(sourceNode, edge, evalContext, actionName, visited, queue);
        if (nextNodeId) {
          return nextNodeId;
        }
      }
    }

    return this.findLegacyFallbackNode(currentNodeId);
  }

  private handleEdgeTraversal(
    sourceNode: CompiledNode,
    edge: EdgeData,
    evalContext: any,
    actionName: string,
    visited: Set<string>,
    queue: string[]
  ): string | null {
    let isGatewayMatch = false;

    if (sourceNode.type === 'exclusive_gateway') {
      if (!this.evaluateGatewayCondition(sourceNode.id, edge, evalContext)) {
        return null;
      }
      isGatewayMatch = true;
    }

    const targetNode = this.compiled.nodes.get(edge.target);
    if (!targetNode) return null;

    if (this.isConcreteNode(targetNode)) {
      if (isGatewayMatch) {
        return targetNode.id;
      }
      if (this.isTargetNodeActionMatch(targetNode, edge, actionName)) {
        return targetNode.id;
      }
    } else if (targetNode.type === 'parallel_gateway' || targetNode.type === 'exclusive_gateway') {
      if (!visited.has(targetNode.id)) {
        visited.add(targetNode.id);
        queue.push(targetNode.id);
      }
    }

    return null;
  }

  private evaluateGatewayCondition(sourceNodeId: string, edge: EdgeData, evalContext: any): boolean {
    const gatewayEdges = this.compiled.gatewayEdges.get(sourceNodeId);
    if (gatewayEdges) {
      const compiledEdge = gatewayEdges.find(ge =>
        (ge.edge.id && ge.edge.id === edge.id) ||
        (ge.edge.source === edge.source && ge.edge.target === edge.target)
      );
      if (compiledEdge?.conditionFn) {
        return compiledEdge.conditionFn(evalContext || {});
      }
    }

    const edgeAction = edge.data?.actionName || edge.label;
    if (edgeAction && evalContext?.status) {
      return edgeAction === evalContext.status;
    }
    return false;
  }

  private isConcreteNode(node: CompiledNode): boolean {
    return node.type === 'user_task' || node.type === 'end' || !node.type;
  }

  private isTargetNodeActionMatch(targetNode: CompiledNode, edge: EdgeData, actionName: string): boolean {
    const edgeAction = edge.data?.actionName || edge.label;
    return edgeAction === actionName || targetNode.data?.actionName === actionName;
  }

  private findLegacyFallbackNode(currentNodeId: string): string | null {
    const sourceNode = this.compiled.nodes.get(currentNodeId);
    if (!sourceNode || sourceNode.outEdges.length !== 1) return null;

    const outEdge = sourceNode.outEdges[0];
    if (!outEdge.label && !outEdge.data?.actionName) {
      const targetNode = this.compiled.nodes.get(outEdge.target);
      if (targetNode && !['parallel_gateway', 'exclusive_gateway'].includes(targetNode.type || '')) {
        return outEdge.target;
      }
    }
    return null;
  }

  public resolveAssignments(currentNodeId: string, context: WorkflowContext): string[] | null {
    const node = this.getNode(currentNodeId);
    if (!node || !node.assignmentFn) return null;

    try {
      const result = node.assignmentFn(context);
      if (!result) return [];
      if (Array.isArray(result)) return result;
      return [String(result)];
    } catch (e: any) {
      console.error('[WorkflowEngine] Error evaluating assignmentExpression:', e);
      return [];
    }
  }

  public evaluateSideEffects(currentNodeId: string): any[] {
    const node = this.getNode(currentNodeId);
    if (!node || !node.data || !node.data.sideEffects) return [];

    let sideEffects = node.data.sideEffects;
    if (typeof sideEffects === 'string') {
      try {
        sideEffects = JSON.parse(sideEffects);
      } catch (e) {
        return [];
      }
    }

    if (!Array.isArray(sideEffects)) return [];
    return sideEffects;
  }
}
