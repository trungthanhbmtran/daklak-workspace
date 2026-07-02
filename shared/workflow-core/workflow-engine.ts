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
                ${node.data.validationExpression}
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
  public getNextNodeId(currentNodeId: string, actionName: string): string | null {
    const edges = this.definition.edges || [];
    // Find edge starting from current node with label matching action (e.g. 'APPROVE')
    const edge = edges.find((e) => e.source === currentNodeId && e.label === actionName);
    
    if (edge) {
      return edge.target;
    }
    
    // If no edge matches label, try to find a default edge if only one exists out of this node
    const outEdges = edges.filter((e) => e.source === currentNodeId);
    if (outEdges.length === 1 && !outEdges[0].label) {
        return outEdges[0].target;
    }

    return null;
  }
}
