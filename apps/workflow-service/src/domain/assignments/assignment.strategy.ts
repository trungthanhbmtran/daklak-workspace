import { WorkflowContext } from '../plugins/node.plugin';

export interface AssigneeResult {
  userIds: string[];
  departmentIds?: string[];
  roleCodes?: string[];
}

export interface IAssignmentStrategy {
  /** The unique identifier of the strategy (e.g., 'CREATOR_MANAGER', 'BY_DOMAIN') */
  getStrategyCode(): string;

  /** Evaluates the strategy based on the current context and returns the target assignees */
  resolveAssignees(context: WorkflowContext, strategyConfig: any): Promise<AssigneeResult>;
}
