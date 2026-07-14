import { INodePlugin, WorkflowContext, NodeValidationResult } from '../node.plugin';

export class StartNodePlugin implements INodePlugin {
  getType(): string {
    return 'start';
  }

  validate(nodeId: string, context: WorkflowContext): NodeValidationResult {
    // Start node is always valid to execute
    return { allowed: true };
  }

  async execute(nodeId: string, context: WorkflowContext): Promise<WorkflowContext> {
    // Start node simply initializes the context and moves forward.
    return context;
  }

  propertySchema(): any {
    return {
      type: 'object',
      properties: {
        description: { type: 'string' }
      }
    };
  }
}
