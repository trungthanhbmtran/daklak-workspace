import { WorkflowContext } from '../plugins/node.plugin';

export interface ActionResult {
  success: boolean;
  message?: string;
  data?: any;
}

export interface IActionPlugin {
  /** The unique identifier for this action (e.g., 'HTTP_REQUEST', 'SEND_EMAIL') */
  getActionCode(): string;

  /** Execute the external action asynchronously */
  executeAction(context: WorkflowContext, actionConfig: any): Promise<ActionResult>;
}
