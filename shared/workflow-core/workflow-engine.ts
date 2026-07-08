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

    // System/Global Actions that bypass strict business rules (collaboration/monitoring)
    const systemActions = ['CHAT', 'MONITOR'];
    const ctx = currentContext || businessData || {};
    const isOwner = !!ctx.isOwner;
    const isAssignee = !!ctx.isAssignee;
    const isSupervisor = !!ctx.isSupervisor;
    const isDeptLeader = !!ctx.isDeptLeader;
    const isCoordinator = !!ctx.isCoordinator;
    const isParticipant = isOwner || isAssignee || isSupervisor || isDeptLeader || isCoordinator;
    
    if (systemActions.includes(actionName)) {
        if (!isParticipant) return { allowed: false, reason: 'Bạn không có quyền tham gia vào công việc này.' };
        return { allowed: true };
    }

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
          ...ctx,
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
    } else {
      // Smart PBAC Defaults if no validationExpression is provided
      if (node.type === 'user_task') {
        const isManager = isSupervisor || isDeptLeader;

        // Suy luận từ danh sách nhân viên cấp dưới (Cây tổ chức)
        const allowedCodes = ctx.allowedEmployeeCodes || [];
        const currentEmpCode = userId || '';
        const hasSubordinates = allowedCodes.filter((c: string) => c !== currentEmpCode).length > 0;

        switch (actionName) {
          case 'ASSIGN':
          case 'ASSIGN_STAFF':
            if (!hasSubordinates && !ctx.isAdmin) return { allowed: false, reason: 'Bạn không có nhân viên cấp dưới để phân công/giao việc.' };
            if (!isAssignee && !isOwner && !isManager) return { allowed: false, reason: 'Chỉ người phụ trách hoặc quản lý mới có quyền phân công/phân rã.' };
            break;

          case 'COMPLETE':
          case 'PROCESS':
          case 'IN_PROGRESS':
          case 'DONE':
          case 'SUBMIT_DRAFT':
          case 'EDIT_ARTICLE':
          case 'PUBLISH':
          case 'ISSUE':
            if (ctx.isUnassigned) return { allowed: false, reason: 'Công việc chưa có người nhận nên không thể báo cáo hoàn thành/xử lý.' };
            if (!isAssignee && !isOwner) return { allowed: false, reason: 'Chỉ người được phân công hoặc người tạo mới có quyền thực hiện.' };
            break;

          case 'APPROVE':
          case 'REJECT':
          case 'ROUTE':
            if (ctx.status !== 'PENDING_APPROVAL' && ctx.status !== 'REVIEWING') return { allowed: false, reason: 'Công việc chưa được báo cáo hoàn thành để duyệt.' };
            if (!isOwner) return { allowed: false, reason: 'Chỉ người giao việc mới có quyền nghiệm thu (duyệt).' };
            break;

          case 'RETURN':
            if (ctx.isUnassigned) return { allowed: false, reason: 'Công việc chưa có người nhận nên không thể trả lại.' };
            if (!isManager && !isOwner && !isAssignee) return { allowed: false, reason: 'Không có quyền trả lại công việc.' };
            break;

          case 'ADD_SUBTASK':
            if (!hasSubordinates && !ctx.isAdmin) return { allowed: false, reason: 'Bạn không có nhân viên cấp dưới để phân rã công việc.' };
            if (!isAssignee && !isOwner && !isManager) return { allowed: false, reason: 'Chỉ người phụ trách hoặc quản lý mới có quyền phân rã.' };
            break;

          case 'EDIT':
          case 'DELETE':
            if (!isOwner) return { allowed: false, reason: 'Chỉ người tạo mới có quyền sửa/xóa.' };
            break;

          case 'CHAT':
          case 'MONITOR':
             // Already handled above
             break;

          case 'COORDINATE':
            if (ctx.isUnassigned) return { allowed: false, reason: 'Công việc chưa có người nhận nên không thể xin phối hợp.' };
            if (!isParticipant) return { allowed: false, reason: 'Bạn không có quyền xin phối hợp.' };
            break;
        }
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
    const node = this.getNode(currentNodeId);
    const possibleActions = ['ASSIGN', 'COMPLETE', 'APPROVE', 'RETURN'];

    // Auxiliary Actions based on node configuration
    if (node?.data?.allowAddSubtask) possibleActions.push('ADD_SUBTASK');
    if (node?.data?.allowCoordinate) possibleActions.push('COORDINATE');
    if (node?.data?.allowEdit) possibleActions.push('EDIT');
    if (node?.data?.allowDelete) possibleActions.push('DELETE');
    if (node?.data?.allowChat !== false) possibleActions.push('CHAT'); // Default to true if not explicitly false

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

  /**
   * Evaluate the assignment script to determine dynamic assignees.
   * Returns an array of assignee codes or null if no script is defined.
   */
  public resolveAssignments(currentNodeId: string, context: WorkflowContext): string[] | null {
    const node = this.getNode(currentNodeId);
    if (!node || !node.data || !node.data.assignmentExpression) return null;

    try {
      const script = node.data.assignmentExpression;
      const evaluator = new Function('context', `
        with (context || {}) {
          ${script}
        }
      `);
      
      const result = evaluator(context);
      
      if (!result) return [];
      if (Array.isArray(result)) return result;
      return [String(result)];
    } catch (e: any) {
      console.error('[WorkflowEngine] Error evaluating assignmentExpression:', e);
      return []; // Return empty array on failure to prevent falling back to undefined behavior
    }
  }

  /**
   * Evaluate Side Effects (e.g. Webhooks) attached to a node.
   */
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
