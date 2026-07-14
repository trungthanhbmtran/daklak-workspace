import { INodePlugin, WorkflowContext, NodeValidationResult } from '../node.plugin';

export class EndNodePlugin implements INodePlugin {
  getType(): string {
    return 'end';
  }

  validate(nodeId: string, context: WorkflowContext): NodeValidationResult {
    return { allowed: true };
  }

  async execute(nodeId: string, context: WorkflowContext): Promise<WorkflowContext> {
    // End node signifies the end of a workflow instance. 
    // State transitions (e.g. setting workflow status to COMPLETED) 
    // are typically handled by the engine, not the node itself.
    return context;
  }

  propertySchema(): any {
    return {
      type: 'object',
      properties: {}
    };
  }
}
