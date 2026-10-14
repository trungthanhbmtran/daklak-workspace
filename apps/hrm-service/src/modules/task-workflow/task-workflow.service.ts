import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom, timeout } from 'rxjs';
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
 * TaskWorkflowService - Tích hợp chặt chẽ với workflow-service (Source of Truth #6).
 * Toàn bộ quy trình BPMN, State Machine, Transitions và Allowed Actions được ủy quyền cho workflow-service.
 */
@Injectable()
export class TaskWorkflowService {
  private readonly logger = new Logger(TaskWorkflowService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
  ) {}

  /**
   * Định tuyến mã quy trình từ workflow-service (Process Binding Resolver có Redis Cache 24h)
   */
  async resolveWorkflowCode(data: any, planId: any, parentId: any): Promise<string | null> {
    if (data?.workflowCode) return data.workflowCode;
    const metadata = data?.metadata || {};
    if (metadata.workflowCode) return metadata.workflowCode;

    const isIncidental =
      data?.taskType === 'UNPLANNED' ||
      data?.taskType === 'INCIDENTAL' ||
      data?.taskType === 'ADHOC' ||
      data?.isIncidental === true ||
      metadata.taskType === 'UNPLANNED' ||
      metadata.isIncidental === true;

    const trigger = isIncidental ? 'TASK_INCIDENTAL_CREATED' : 'TASK_CREATED';

    try {
      const bindingCode = await this.shared.getProcessBinding(
        'BTCTU_TASK_MANAGEMENT',
        trigger,
        data?.organizationId || 'BTCTU_DAKLAK',
      );
      if (bindingCode) return bindingCode;
    } catch (err: any) {
      this.logger.debug(`ResolveBinding cached lookup failed or not found: ${err?.message}`);
    }

    // Fallback chuẩn theo quy trình Ban Tổ chức Tỉnh ủy Đắk Lắk
    return 'WF_BTCTU_QUAN_LY_CONG_VIEC';
  }

  /**
   * Khởi tạo workflow instance trên workflow-service
   */
  async initWorkflow(
    taskId: number,
    workflowCode: string,
    context: { initiatorId: string; assigneeCode?: string; assignerCode?: string; isIncidental?: boolean },
  ): Promise<any> {
    try {
      if (this.shared.workflowService?.StartByProcessType) {
        const instance = await firstValueFrom<any>(
          this.shared.workflowService.StartByProcessType({
            processTypeCode: 'BTCTU_TASK_MANAGEMENT',
            organizationId: 'BTCTU_DAKLAK',
            trigger: context.isIncidental ? 'TASK_INCIDENTAL_CREATED' : 'TASK_CREATED',
            businessId: taskId.toString(),
            businessType: 'TASK',
            actorId: context.initiatorId,
            initialContext: this.shared.toProtoStruct({
              taskId,
              assigneeCode: context.assigneeCode || 'UNASSIGNED',
              assignerCode: context.assignerCode || 'SYSTEM',
              isIncidental: context.isIncidental || false,
            }),
          }).pipe(timeout(3000))
        );
        return instance;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to initialize workflow instance for task ${taskId}: ${err?.message}`);
    }
    return null;
  }

  /**
   * Lấy initial node id từ workflow definition đã nạp ở workflow-service
   */
  async getLocalInitialNodeId(workflowId: string): Promise<string | null> {
    if (!workflowId) return null;
    try {
      const def = await this.shared.getWorkflowDefinition(workflowId);
      if (def?.nodes && Array.isArray(def.nodes)) {
        // Ưu tiên tìm node 'start'
        const startNode = def.nodes.find((n: any) => n.type === 'start');
        if (startNode) {
          // Tìm node tiếp theo nối từ start node
          const outgoing = def.edges?.find((e: any) => e.source === startNode.id);
          if (outgoing?.target) {
            return outgoing.target;
          }
          return startNode.id;
        }
        return def.nodes[0]?.id || null;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to get local initial node id for workflow ${workflowId}: ${err?.message}`);
    }
    return null;
  }

  /**
   * Lấy node data hiện tại từ workflow definition
   */
  async getCurrentNodeData(workflowId: string, nodeId: string): Promise<any> {
    if (!workflowId || !nodeId) return null;
    try {
      const def = await this.shared.getWorkflowDefinition(workflowId);
      if (def?.nodes && Array.isArray(def.nodes)) {
        const node = def.nodes.find((n: any) => n.id === nodeId);
        return node?.data || null;
      }
    } catch (err: any) {
      this.logger.warn(`Failed to get current node data for workflow ${workflowId}, node ${nodeId}: ${err?.message}`);
    }
    return null;
  }

  /**
   * Kiểm tra chuyển đổi trạng thái workflow - Ủy quyền gọi gRPC sang workflow-service
   */
  async validateAndTransition(
    task: any,
    actionName: string,
    actorContext: any,
  ): Promise<WorkflowTransitionResult> {
    const actorCode = actorContext?.actorCode;
    const permissions = actorContext?.permissions || [];
    const access = actorContext?.access || {};
    const metadata = (task.metadata as any) || {};

    const isIncidental =
      task.taskType === 'UNPLANNED' ||
      task.taskType === 'INCIDENTAL' ||
      task.taskType === 'ADHOC' ||
      metadata.taskType === 'UNPLANNED' ||
      metadata.isIncidental === true ||
      metadata.incidentalStatus === 'PENDING_APPROVAL';

    // ── Xử lý các Action Phê duyệt / Từ chối việc phát sinh ───────────────────
    if (actionName === 'APPROVE_INCIDENTAL' || actionName === 'APPROVE_TASK_INCIDENTAL') {
      const isSupervisor =
        (task.supervisorCode && actorCode === task.supervisorCode) ||
        access.isSupervisor ||
        access.isDeptLeader ||
        access.isAdmin ||
        permissions.includes('TASK:MANAGE') ||
        permissions.includes('TASK:ADMIN');

      if (!isSupervisor) {
        return {
          allowed: false,
          reason: 'Chỉ Lãnh đạo phụ trách thẩm định (hoặc Lãnh đạo đơn vị) mới có thẩm quyền phê duyệt việc phát sinh.',
        };
      }

      const nextStatus =
        task.assigneeCode && task.assigneeCode !== 'UNASSIGNED' && task.assigneeCode !== task.creatorEmployeeCode
          ? 'PENDING_ACCEPTANCE'
          : 'IN_PROGRESS';

      return {
        allowed: true,
        targetStatus: nextStatus,
        reason: 'Lãnh đạo phụ trách đã phê duyệt việc phát sinh.',
      };
    }

    if (actionName === 'REJECT_INCIDENTAL' || actionName === 'REJECT_TASK_INCIDENTAL') {
      const isSupervisor =
        (task.supervisorCode && actorCode === task.supervisorCode) ||
        access.isSupervisor ||
        access.isDeptLeader ||
        access.isAdmin ||
        permissions.includes('TASK:MANAGE') ||
        permissions.includes('TASK:ADMIN');

      if (!isSupervisor) {
        return {
          allowed: false,
          reason: 'Chỉ Lãnh đạo phụ trách thẩm định (hoặc Lãnh đạo đơn vị) mới có thẩm quyền từ chối việc phát sinh.',
        };
      }

      return {
        allowed: true,
        targetStatus: 'REJECTED',
        isCompleted: false,
        reason: 'Lãnh đạo phụ trách đã từ chối việc phát sinh.',
      };
    }

    // Nếu công việc phát sinh đang ở PENDING_APPROVAL mà chưa duyệt thì chặn toàn bộ các hành động xử lý/tiếp nhận
    if (isIncidental && task.status === 'PENDING_APPROVAL') {
      const allowedInPending = [
        'APPROVE_INCIDENTAL',
        'APPROVE_TASK_INCIDENTAL',
        'REJECT_INCIDENTAL',
        'REJECT_TASK_INCIDENTAL',
        'CHAT',
        'VIEW',
        'DELETE',
        'CANCEL',
      ];
      if (!allowedInPending.includes(actionName)) {
        return {
          allowed: false,
          reason: 'Công việc phát sinh đang chờ Lãnh đạo phụ trách thẩm định phê duyệt. Chưa thể tiếp nhận hoặc thực hiện.',
        };
      }
    }

    // ── Gọi gRPC sang workflow-service để thẩm định Action theo BPMN ─────────
    const workflowId = metadata.workflowId || task.workflowInstId;
    const currentNodeId = metadata.currentNodeId;

    if (this.shared.workflowService?.ValidateAction && (workflowId || currentNodeId)) {
      try {
        const protoBusinessData = this.shared.toProtoStruct({
          taskId: task.id,
          status: task.status,
          taskType: task.taskType || metadata.taskType,
          isIncidental,
          assigneeCode: task.assigneeCode,
          creatorCode: task.creatorEmployeeCode,
          supervisorCode: task.supervisorCode,
          actorCode,
          isAdmin: access.isAdmin || permissions.includes('TASK:MANAGE'),
          isOwner: access.isOwner,
          isAssignee: access.isAssignee,
          isSupervisor: access.isSupervisor,
          isCoordinator: access.isCoordinator,
          isDeptLeader: access.isDeptLeader,
        });

        const validateRes = await firstValueFrom<any>(
          this.shared.workflowService.ValidateAction({
            instanceId: metadata.workflowInstanceId || '',
            workflowId: workflowId || '',
            currentNodeId: currentNodeId || '',
            actionName,
            userId: actorCode || '',
            userRoles: permissions,
            businessData: protoBusinessData,
          }).pipe(timeout(3000))
        );

        if (validateRes && validateRes.allowed === false) {
          // Nếu từ chối do chưa tìm thấy runtime instance graph, fallback sang definition graph
          if (validateRes.reason !== 'Workflow graph not found') {
            return {
              allowed: false,
              reason: validateRes.reason || `Quy trình không cho phép hành động ${actionName}`,
            };
          }
          this.logger.debug(`Instance graph not found in workflow-service for task ${task.id}, falling back to definition graph validation.`);
        }
      } catch (err: any) {
        this.logger.warn(`gRPC ValidateAction failed in workflow-service: ${err?.message}, falling back to graph validation.`);
      }
    }

    // ── Fallback BPMN Graph Validation khi có definition ───────────────────
    if (workflowId && currentNodeId) {
      try {
        const def = await this.shared.getWorkflowDefinition(workflowId);
        if (def?.edges && Array.isArray(def.edges)) {
          const matchingEdge = def.edges.find(
            (e: any) =>
              e.source === currentNodeId &&
              (e.label === actionName || e.action === actionName || e.data?.action === actionName)
          );
          if (matchingEdge) {
            const targetNode = def.nodes?.find((n: any) => n.id === matchingEdge.target);
            return {
              allowed: true,
              nextNodeId: matchingEdge.target,
              nextNodeData: targetNode?.data || null,
              targetStatus: targetNode?.data?.targetStatus,
            };
          }
        }
      } catch (err: any) {
        this.logger.debug(`Workflow graph lookup skipped: ${err?.message}`);
      }
    }

    // Mặc định cho phép nếu hành động hợp lệ theo nghiệp vụ cơ sở
    return { allowed: true };
  }

  resolveNotificationConfig(nodeData: any): {
    sendNotify: boolean;
    nodeLabel: string;
    notifConfig?: any;
  } {
    return {
      sendNotify: true,
      nodeLabel: nodeData?.label || 'Giao việc',
      notifConfig: nodeData?.notificationConfig,
    };
  }

  async seedStepsFromNode(taskId: number, nodeData: any): Promise<void> {
    // Dự phòng khi node chứa predefined checklist steps
    if (nodeData?.defaultSteps && Array.isArray(nodeData.defaultSteps) && nodeData.defaultSteps.length > 0) {
      try {
        const stepsData = nodeData.defaultSteps.map((s: any, idx: number) => ({
          taskId,
          title: typeof s === 'string' ? s : s.title,
          order: idx + 1,
          baseScore: typeof s === 'object' && s.baseScore ? s.baseScore : 0,
          status: 'TODO',
        }));
        await this.prisma.taskStep.createMany({ data: stepsData, skipDuplicates: true });
      } catch (err: any) {
        this.logger.warn(`Failed to seed steps from node for task ${taskId}: ${err?.message}`);
      }
    }
  }
}
