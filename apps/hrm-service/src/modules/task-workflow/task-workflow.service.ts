import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

import { TaskSharedService } from '../task-shared/task-shared.service';
import { PrismaService } from '../../database/prisma.service';

/** Kết quả sau khi validate action và lấy node tiếp theo */
export interface WorkflowTransitionResult {
  allowed: boolean;
  reason?: string;
  nextNodeId?: string;
  nextNodeData?: any;
  targetStatus?: string;
  isCompleted?: boolean;
}

/**
 * TaskWorkflowService — điểm duy nhất điều phối tất cả workflow logic:
 *  - Resolve workflow code
 *  - Khởi động workflow khi tạo task
 *  - Validate action & lấy node tiếp theo
 *  - Seed TaskStep từ node.data.steps
 */
@Injectable()
export class TaskWorkflowService {
  private readonly logger = new Logger(TaskWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
  ) {}

  // ─── Workflow Resolution ──────────────────────────────────────────────────

  /**
   * Tra cứu workflow code theo thứ tự ưu tiên:
   * 1. data.workflowCode (caller truyền rõ)
   * 2. plan.metadata.workflowCode
   * 3. parent task metadata.workflowCode (subtask kế thừa)
   * 4. 'TASK_PROCESSING_ID' (default)
   */
  async resolveWorkflowCode(data: any, planId: any, parentId: any): Promise<string | null> {
    if (data.workflowCode) return data.workflowCode;

    if (planId) {
      const plan = await this.prisma.masterPlan.findUnique({
        where: { id: parseInt(planId.toString(), 10) },
      }) as any;
      if (plan?.metadata?.workflowCode) return plan.metadata.workflowCode;
    }

    if (parentId) {
      const parent = await this.prisma.task.findUnique({
        where: { id: parseInt(parentId.toString(), 10) },
        select: { metadata: true },
      });
      const parentMeta = parent?.metadata as any;
      if (parentMeta?.workflowCode) return parentMeta.workflowCode;
    }

    return 'TASK_PROCESSING_ID';
  }

  // ─── Workflow Initialisation ──────────────────────────────────────────────

  /**
   * Khởi động workflow cho task vừa tạo.
   * Trả về { workflowId, workflowCode, currentNodeId, workflowInstId? } để lưu vào metadata.
   * Trả null nếu không tìm thấy workflow.
   */
  async initWorkflow(
    taskId: number,
    workflowCode: string,
    context: { initiatorId: string; assigneeCode?: string; assignerCode?: string },
  ): Promise<{ workflowId: string; workflowCode: string; currentNodeId: string; workflowInstId?: string } | null> {
    const workflowId = await this.shared.getWorkflowIdByTrigger(workflowCode);
    if (!workflowId) {
      this.logger.warn(`Workflow code "${workflowCode}" không tìm thấy trong DB. Task ${taskId} không có workflow.`);
      return null;
    }

    let workflowInstId: string | undefined;
    let remoteNodeId: string | undefined;

    try {
      const inst = await firstValueFrom<any>(
        this.shared.workflowService.StartWorkflow({
          workflowId,
          initiatorId: context.initiatorId,
          businessId: taskId.toString(),
          businessType: 'TASK',
          initialContext: this.shared.toProtoStruct({
            taskId,
            assigneeCode: context.assigneeCode || 'UNASSIGNED',
            assignerCode: context.assignerCode,
          }),
        }),
      );
      workflowInstId = inst?.id;
      remoteNodeId = inst?.currentNodeId;
    } catch (err) {
      this.logger.warn('WorkflowService.StartWorkflow failed, dùng local engine', err);
    }

    const currentNodeId = remoteNodeId ?? (await this.getLocalInitialNodeId(workflowId));
    if (!currentNodeId) return null;

    return { workflowId, workflowCode, currentNodeId, workflowInstId };
  }

  /** Lấy initialNodeId từ workflow definition qua engine remote */
  async getLocalInitialNodeId(workflowId: string): Promise<string | null> {
    try {
      const res = await firstValueFrom<any>(this.shared.workflowService.GetInitialNode({ workflowId }));
      return res?.initialNodeId || null;
    } catch (err) {
      this.logger.warn(`getLocalInitialNodeId failed for ${workflowId}`, err);
      return null;
    }
  }

  // ─── Action Validation & Transition ──────────────────────────────────────

  /**
   * Validate một action trên task hiện tại và trả về kết quả transition.
   * `task` phải đã được enriched (có assigneeCode, assignerCode, v.v.)
   */
  async validateAndTransition(
    task: any,
    actionName: string,
    actorContext: {
      actorCode?: string;
      permissions?: string[];
      hasChildren?: boolean;
      access?: any;
    },
  ): Promise<WorkflowTransitionResult> {
    const metadata = (task.metadata as any) || {};
    const workflowId = metadata.workflowId || task.workflowInstId;
    const currentNodeId = metadata.currentNodeId;

    if (!workflowId || !currentNodeId) {
      return { allowed: true }; // Không có workflow → cho phép (legacy tasks)
    }

    const definition = await this.shared.getWorkflowDefinition(workflowId);
    if (!definition) {
      return { allowed: false, reason: 'Không tìm thấy cấu hình Workflow' };
    }

    const businessData = {
      ...task,
      status: task.status,
      hasChildren: actorContext.hasChildren ?? false,
      isOwner: actorContext.access?.isOwner ?? false,
      isAssignee: actorContext.access?.isAssignee ?? false,
      isSupervisor: actorContext.access?.isSupervisor ?? false,
      isCoordinator: actorContext.access?.isCoordinator ?? false,
      isDeptLeader: actorContext.access?.isDeptLeader ?? false,
      isLowestLevel: actorContext.access?.isLowestLevel ?? false,
      allowedEmployeeCodes: actorContext.access?.allowedEmployeeCodes ?? [],
      actionName,
    };

    const validateRes = await firstValueFrom<any>(this.shared.workflowService.ValidateAction({
      workflowId: String(workflowId),
      currentNodeId,
      actionName,
      userRoles: actorContext.permissions ?? [],
      userId: actorContext.actorCode || '',
      businessData: this.shared.toProtoStruct(businessData),
    }));

    if (!validateRes.allowed) {
      return { allowed: false, reason: validateRes.reason };
    }

    const nextNodeRes = await firstValueFrom<any>(this.shared.workflowService.GetNextNode({
      workflowId: String(workflowId),
      currentNodeId,
      actionName,
      evalContext: this.shared.toProtoStruct(businessData),
    }));

    const nextNodeId = nextNodeRes.nextNodeId || undefined;
    let nextNodeData: any = undefined;
    let targetStatus: string | undefined = undefined;
    let isCompleted: boolean | undefined = undefined;

    if (nextNodeId) {
      nextNodeData = nextNodeRes.nextNodeData ? JSON.parse(nextNodeRes.nextNodeData) : undefined;
      if (nextNodeData) {
        targetStatus = nextNodeData.targetStatus ?? nextNodeId;
      }
      isCompleted = nextNodeRes.type === 'end' || nextNodeRes.type === 'END' || nextNodeData?.isCompleted === true;
    }

    return { allowed: true, nextNodeId, nextNodeData, targetStatus, isCompleted };
  }

  // ─── Node Data Helpers ────────────────────────────────────────────────────

  /**
   * Lấy data của node hiện tại từ workflow (dùng để đọc config khi tạo task)
   */
  async getCurrentNodeData(workflowId: string, nodeId: string): Promise<any> {
    const definition = await this.shared.getWorkflowDefinition(workflowId);
    if (!definition) return null;
    try {
      return definition.nodes?.find((n: any) => n.id === nodeId)?.data ?? null;
    } catch {
      return null;
    }
  }

  /**
   * Đọc notification config từ nodeData của workflow.
   * Workflow designer có thể cấu hình: sendNotification, label, notification.title/template/recipients
   */
  resolveNotificationConfig(nodeData: any): {
    sendNotify: boolean;
    nodeLabel: string;
    notifConfig?: any;
  } {
    if (!nodeData) return { sendNotify: true, nodeLabel: 'Giao việc' };
    return {
      sendNotify: nodeData.sendNotification !== false,
      nodeLabel: nodeData.label || 'Giao việc',
      notifConfig: nodeData.notification,
    };
  }

  // ─── Step Seeding ─────────────────────────────────────────────────────────

  /**
   * Tự động tạo TaskStep từ node.data.steps nếu workflow designer đã cấu hình.
   * Mỗi step trong node.data.steps: { title, order?, assigneeCode? }
   */
  async seedStepsFromNode(taskId: number, nodeData: any): Promise<void> {
    const steps: any[] = Array.isArray(nodeData?.steps) ? nodeData.steps : [];
    if (steps.length === 0) return;

    const stepsData = steps.map((s: any, i: number) => ({
      taskId,
      title: s.title || s.label || s.name || `Bước ${i + 1}`,
      order: s.order ?? i,
      assigneeCode: s.assigneeCode || null,
    }));

    try {
      await this.prisma.taskStep.createMany({ data: stepsData, skipDuplicates: true });
      this.logger.log(`Seeded ${stepsData.length} steps từ workflow vào task ${taskId}`);
    } catch (err) {
      this.logger.error(`Lỗi seed steps cho task ${taskId}`, err);
    }
  }
}
