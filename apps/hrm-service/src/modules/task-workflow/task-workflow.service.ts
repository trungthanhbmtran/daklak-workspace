import { Injectable, Logger } from '@nestjs/common';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { PrismaService } from '../../database/prisma.service';

export interface WorkflowTransitionResult {
  allowed: boolean;
  reason?: string;
  nextNodeId?: string;
  nextNodeData?: any;
  targetStatus?: string;
  isCompleted?: boolean;
}

/**
 * Phiên bản DUMMY sau khi chuyển đổi sang No-Code Workflow.
 * Mọi logic gọi gRPC cũ đã bị xoá.
 */
@Injectable()
export class TaskWorkflowService {
  private readonly logger = new Logger(TaskWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
  ) {}

  async resolveWorkflowCode(data: any, planId: any, parentId: any): Promise<string | null> {
    return null;
  }

  async initWorkflow(
    taskId: number,
    workflowCode: string,
    context: { initiatorId: string; assigneeCode?: string; assignerCode?: string },
  ): Promise<any> {
    return null;
  }

  async getLocalInitialNodeId(workflowId: string): Promise<string | null> {
    return null;
  }

  async validateAndTransition(
    task: any,
    actionName: string,
    actorContext: any,
  ): Promise<WorkflowTransitionResult> {
    // Luôn cho phép do Workflow Engine mới xử lý qua Event
    return { allowed: true };
  }

  async getCurrentNodeData(workflowId: string, nodeId: string): Promise<any> {
    return null;
  }

  resolveNotificationConfig(nodeData: any): {
    sendNotify: boolean;
    nodeLabel: string;
    notifConfig?: any;
  } {
    return { sendNotify: true, nodeLabel: 'Giao việc' };
  }

  async seedStepsFromNode(taskId: number, nodeData: any): Promise<void> {
    // Không còn sử dụng
  }
}
