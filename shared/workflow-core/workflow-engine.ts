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
  private definition: WorkflowDefinition;

  constructor(definition: any) {
    if (typeof definition === 'string') {
      try {
        this.definition = JSON.parse(definition);
      } catch (e) {
        this.definition = { nodes: [], edges: [] };
      }
    } else {
      this.definition = definition || { nodes: [], edges: [] };
    }
  }

  /**
   * Get the initial node ID to start the workflow.
   * It finds the 'start' node and returns the ID of the node it points to.
   */
  public getInitialNodeId(): string | null {
    const nodes = this.definition.nodes || [];
    const startNode = nodes.find((n) => n.type === 'start');
    if (!startNode) return null;

    const edges = this.definition.edges || [];
    const outEdge = edges.find((e) => e.source === startNode.id);
    return outEdge ? outEdge.target : startNode.id;
  }

  /**
   * Get a node by its ID
   */
  public getNode(nodeId: string): NodeData | undefined {
    return (this.definition.nodes || []).find(n => n.id === nodeId);
  }

  /**
   * Validate if a user can perform an action on the current node
   */
  public validateAction(
    currentNodeId: string,
    actionName: string,
    userRoles: string[] = [],
    userId?: string,
    businessData?: any,
    userContext?: any,
    currentContext?: WorkflowContext
  ): { allowed: boolean; reason?: string } {
    const nodes = this.definition.nodes || [];
    const node = nodes.find((n) => n.id === currentNodeId);

    if (!node) return { allowed: false, reason: 'Current node not found in workflow definition' };

    // Check PBAC required role on node
    const requiredRole = node?.data?.role;
    if (requiredRole && !userRoles.includes(requiredRole)) {
      return { allowed: false, reason: `Requires role: ${requiredRole}` };
    }

    // Evaluate dynamic validation expression if present
    if (node?.data?.validationExpression) {
      try {
        const evalContext: ValidationContext = {
          ...(currentContext || {}),
          ...(businessData || {}),
          actionName,
          userId,
          userRoles,
          userContext: userContext || {},
        };

        const validator = new Function(
          'context',
          `
             with (context) {
                return (${node.data.validationExpression});
             }
          `
        );
        const isAllowed = !!validator(evalContext);
        if (!isAllowed) {
          return { allowed: false, reason: `Không thỏa mãn điều kiện quy trình chặn.` };
        }
      } catch (e: any) {
        return { allowed: false, reason: `Lỗi tính toán biểu thức phân quyền: ${e.message}` };
      }
    }

    return { allowed: true };
  }

  /**
   * Get all allowed actions for a user
   */
  public getAllowedActions(
    currentNodeId: string,
    userRoles: string[] = [],
    userId?: string,
    businessData?: any,
    userContext?: any,
    currentContext?: WorkflowContext
  ): string[] {
    const possibleActions = ['EDIT', 'ASSIGN', 'ADD_SUBTASK', 'DELETE', 'COMPLETE', 'APPROVE', 'RETURN', 'CHAT', 'COORDINATE'];
    const allowed: string[] = [];

    for (const action of possibleActions) {
      const res = this.validateAction(
        currentNodeId,
        action,
        userRoles,
        userId,
        businessData,
        userContext,
        currentContext
      );
      if (res.allowed) allowed.push(action);
    }

    return allowed;
  }

  /**
   * Find the next node based on action/edge label
   */
  public getNextNodeId(currentNodeId: string, actionName: string, evalContext?: any): string | null {
    const nodes = this.definition.nodes || [];
    const edges = this.definition.edges || [];
    const visited = new Set<string>();
    const queue = [currentNodeId];
    
    visited.add(currentNodeId);

    while (queue.length > 0) {
      const curr = queue.shift()!;
      const outEdges = edges.filter((e) => e.source === curr);
      const sourceNode = nodes.find((n) => n.id === curr);

      for (const edge of outEdges) {
        // If coming from an exclusive_gateway with an expression, evaluate it
        if (sourceNode?.type === 'exclusive_gateway' && edge.data?.expression) {
          try {
            const validator = new Function('context', `
               with (context || {}) {
                  return (${edge.data.expression});
               }
            `);
            if (!validator(evalContext || {})) {
              continue;
            }
          } catch (e) {
            continue;
          }
        }

        const targetNode = nodes.find((n) => n.id === edge.target);
        if (!targetNode) continue;

        // Concrete step (user_task, end, or empty type)
        if (targetNode.type === 'user_task' || targetNode.type === 'end' || !targetNode.type) {
          if (edge.label === actionName || targetNode.data?.actionName === actionName) {
            return targetNode.id;
          }
        } 
        // Gateway: keep traversing
        else if (targetNode.type === 'parallel_gateway' || targetNode.type === 'exclusive_gateway') {
          if (!visited.has(targetNode.id)) {
            visited.add(targetNode.id);
            queue.push(targetNode.id);
          }
        }
      }
    }
    
    // Legacy fallback: if exactly 1 edge out and no label, and target is a concrete node
    const outEdges = edges.filter((e) => e.source === currentNodeId);
    if (outEdges.length === 1 && !outEdges[0].label) {
      const targetNode = nodes.find(n => n.id === outEdges[0].target);
      if (targetNode && targetNode.type !== 'parallel_gateway' && targetNode.type !== 'exclusive_gateway') {
        return outEdges[0].target;
      }
    }

    return null;
  }
}
