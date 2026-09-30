export interface WorkflowCommand {
  commandId: string;
  workflowInstanceId: string;
  processVersion: number;
  nodeId: string;
  commandType: string;
  payload: any;
}
