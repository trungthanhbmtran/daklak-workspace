import { INodePlugin, WorkflowContext, NodeValidationResult } from '../node.plugin';

export class ExclusiveGatewayNodePlugin implements INodePlugin {
  getType(): string {
    return 'exclusive_gateway';
  }

  validate(nodeId: string, context: WorkflowContext): NodeValidationResult {
    return { allowed: true };
  }

  async execute(nodeId: string, context: WorkflowContext): Promise<WorkflowContext> {
    // Gateway execution usually involves evaluating outgoing edge expressions.
    // The engine itself handles graph traversal, so the gateway node just passes context along.
    return context;
  }

  propertySchema(): any {
    return {
      type: 'object',
      properties: {}
    };
  }
}
