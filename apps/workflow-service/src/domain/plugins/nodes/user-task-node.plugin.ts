import { INodePlugin, WorkflowContext, NodeValidationResult } from '../node.plugin';

export class UserTaskNodePlugin implements INodePlugin {
  getType(): string {
    return 'user_task';
  }

  validate(nodeId: string, context: WorkflowContext): NodeValidationResult {
    const nodeData = context.currentNodeData; // Assuming engine passes this
    const actionName = context.actionName;
    const userRoles = context.userRoles || [];
    
    if (!nodeData || !nodeData.permissions) {
      return { allowed: true }; // No permissions config means allow all
    }
    
    const perms = nodeData.permissions;
    if (!perms[actionName]) return { allowed: false, reason: 'Không có quyền thực hiện hành động này' };
    
    const allowed = perms[actionName];
    if (allowed.length === 0) return { allowed: true };
    
    const roles = [...userRoles];
    if (context.isOwner) roles.push('OWNER');
    if (context.isAssignee) roles.push('ASSIGNEE');
    if (context.isSupervisor) roles.push('SUPERVISOR');
    if (context.isDeptLeader) roles.push('DEPT_LEADER');
    if (context.isAdmin) roles.push('ADMIN');
    if (context.isCoordinator) roles.push('COORDINATOR');
    
    if (allowed.includes('ANY') || allowed.includes('PARTICIPANT')) return { allowed: true };
    
    const isMatched = allowed.some((r: string) => roles.includes(r));
    return isMatched ? { allowed: true } : { allowed: false, reason: 'Không đủ quyền hạn' };
  }

  async execute(nodeId: string, context: WorkflowContext): Promise<WorkflowContext> {
    // User task pauses execution until user acts. 
    // The engine creates a WorkflowTask, so execution here might just be a no-op 
    // or preparing variables.
    return context;
  }

  propertySchema(): any {
    return {
      type: 'object',
      properties: {
        actionName: { type: 'string' },
        targetStatus: { type: 'string' },
        assignmentStrategy: { type: 'string' },
        permissions: { type: 'object' }
      }
    };
  }
}
