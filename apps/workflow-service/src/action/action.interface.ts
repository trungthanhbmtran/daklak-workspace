export interface WorkflowContext {
  instanceId: string;
  variables: Record<string, any>;
  organizationId: string;
  startedBy: string;
}

export interface WorkflowActionResult {
  success: boolean;
  variables?: Record<string, any>;
  error?: string;
}

export interface WorkflowServiceAction {
  code: string;
  execute(ctx: WorkflowContext, payload?: any): Promise<WorkflowActionResult>;
}
