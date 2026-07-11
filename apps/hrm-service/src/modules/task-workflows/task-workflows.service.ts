import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { TasksService } from '../tasks/tasks.service';

/**
 * TaskWorkflowsService — proxy mỏng:
 * - UpdateTaskStatus (gRPC) → delegate sang TasksService (canonical implementation)
 * - WORKFLOW_UPDATED (event) → invalidate workflow definition cache
 *
 * Toàn bộ logic workflow (validate, sideEffects, notification, approval)
 * nằm trong TasksService — không trùng lặp.
 */
@Injectable()
export class TaskWorkflowsService {
  private readonly logger = new Logger(TaskWorkflowsService.name);

  constructor(
    public prisma: PrismaService,
    public shared: TaskSharedService,
    private readonly tasksService: TasksService,
  ) {}

  public invalidateWorkflowCache(workflowId: string, newDefinition?: any) {
    this.shared.invalidateWorkflowCache(workflowId, newDefinition);
  }

  /** Delegate hoàn toàn sang TasksService — nguồn sự thật duy nhất */
  updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionNameForWorkflow?: string) {
    return this.tasksService.updateTaskStatus(id, status, rejectReason, actorCode, context, actionNameForWorkflow);
  }
}
