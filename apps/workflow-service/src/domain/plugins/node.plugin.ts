export interface WorkflowContext {
  workflowId: string;
  workflowVersion: number;
  entityType: string;
  entityId: string;
  variables: Record<string, any>;
  currentUser?: {
    id: string;
    roles: string[];
    departmentId?: string;
  };
  [key: string]: any;
}

export interface NodeValidationResult {
  allowed: boolean;
  reason?: string;
}

export interface INodePlugin {
  /** Identifies the plugin type (e.g., 'START', 'END', 'USER_TASK') */
  getType(): string;

  /** Validates if the node can be executed given the current context */
  validate(nodeId: string, context: WorkflowContext): NodeValidationResult;

  /** Executes the node logic and returns the next context state */
  execute(nodeId: string, context: WorkflowContext): Promise<WorkflowContext>;

  /** Returns JSON Schema for the node properties to render in Designer */
  propertySchema(): any;
}
