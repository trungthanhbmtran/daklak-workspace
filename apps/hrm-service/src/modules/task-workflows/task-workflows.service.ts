import { Injectable, Inject, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ClientProxy, RpcException } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';
import { TaskSharedService } from '../task-shared/task-shared.service';

@Injectable()
export class TaskWorkflowsService {
  private readonly logger = new Logger(TaskWorkflowsService.name);
  constructor(
    public prisma: PrismaService,
    private shared: TaskSharedService,
    @Inject('WORKFLOW_PACKAGE') public workflowClient: any,
  ) {}

  private get workflowService() {
    return this.workflowClient.getService('WorkflowService');
  }

  public async getWorkflowDefinition(workflowId: string): Promise<any> {
    return this.shared.getWorkflowDefinition(workflowId);
  }
  public invalidateWorkflowCache(workflowId: string, newDefinition?: any) {
    this.shared.invalidateWorkflowCache(workflowId, newDefinition);
  }
  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string, context?: any, actionNameForWorkflow?: string) {
    if (context) await this.shared.populateQueryHierarchy(context);
    const rawTask = await this.prisma.task.findUnique({ where: { id } });
    if (!rawTask) throw new RpcException('Nhiệm vụ không tồn tại');

    const actualActorCode = actorCode || context?.currentEmployeeCode;

    const tCheckArr = [rawTask];
    await this.shared.enrichTasks(tCheckArr);
    const tCheck: any = tCheckArr[0];

    // GỌI WORKFLOW ĐỂ VALIDATE VÀ NHẢY BƯỚC
    const metadata = (rawTask.metadata as any) || {};
    const activeWorkflowId = metadata.workflowId || rawTask.workflowInstId;
    let nextNodeIdToSave: string | undefined = undefined;

    if (activeWorkflowId && metadata.currentNodeId) {
      try {
        let actionName = actionNameForWorkflow || status;

        let hasChildren = false;
        const childrenCount = await this.prisma.taskClosure.count({ where: { ancestorId: rawTask.id, depth: 1 } });
        hasChildren = childrenCount > 0;

        const queryContext = { ...context, currentEmployeeCode: actualActorCode, currentUserId: context?.currentUserId };
        const access = await this.shared.checkTaskAccess(tCheck, queryContext);

        const businessData = {
          status: rawTask.status,
          hasChildren,
          isOwner: access.isOwner,
          isAssignee: access.isAssignee,
          isSupervisor: access.isSupervisor,
          isCoordinator: access.isCoordinator,
          isDeptLeader: access.isDeptLeader,
          isLowestLevel: access.isLowestLevel,
          allowedEmployeeCodes: context?.allowedEmployeeCodes || [],
        };

        const definition = await this.getWorkflowDefinition(activeWorkflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const validateRes = engine.validateAction(
            metadata.currentNodeId,
            actionName,
            context?.currentUserPermissions || [],
            actualActorCode,
            businessData
          );

          if (!validateRes.allowed) {
            const reasonMsg = validateRes.reason ? ` (${validateRes.reason})` : '';
            throw new RpcException(`Workflow không cho phép thực hiện hành động ${actionName}${reasonMsg}.`);
          }

          // Nhảy bước
          const nextNodeId = engine.getNextNodeId(metadata.currentNodeId, actionName, { ...businessData, actionName });
          if (nextNodeId) {
            nextNodeIdToSave = nextNodeId;
          }
        }
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi tính toán ValidateAction qua local engine', err);
      }
    }

    let targetStatus = status;
    let nextNodeData: any = null;
    
    if (nextNodeIdToSave && activeWorkflowId) {
      const definition = await this.getWorkflowDefinition(activeWorkflowId);
      if (definition) {
        const engine = new WorkflowEngine(definition);
        const nextNode = engine.getNode(nextNodeIdToSave);
        if (nextNode && nextNode.data) {
          nextNodeData = nextNode.data;
          if (nextNodeData.targetStatus) {
            targetStatus = nextNodeData.targetStatus;
          }
        }
      }
    }

    const dataToUpdate: any = { status: targetStatus };
    if (rejectReason !== undefined) dataToUpdate.rejectReason = rejectReason;
    if (targetStatus === 'DONE') dataToUpdate.completedAt = new Date();
    if (nextNodeIdToSave) {
      dataToUpdate.metadata = { ...((rawTask.metadata as any) || {}), currentNodeId: nextNodeIdToSave };
    }

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: { participants: true }
    });

    if (rejectReason && (targetStatus === 'RETURNED' || (nextNodeData && nextNodeData.sideEffects?.includes('RETURN_TASK')))) {
      await this.prisma.taskComment.create({
        data: {
          taskId: id,
          authorCode: actualActorCode || null,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    if (nextNodeData?.autoProgress !== undefined) {
      // await this.updateTaskProgress(id, nextNodeData.autoProgress, actualActorCode);
    } else if (targetStatus === 'DONE') {
      // await this.updateTaskProgress(id, 100, actualActorCode);
    }

    // Xử lý gửi thông báo tự động dựa trên cấu hình Workflow Engine (Node tiếp theo)
    if (nextNodeIdToSave && activeWorkflowId) {
      try {
        const definition = await this.getWorkflowDefinition(activeWorkflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const nextNode = engine.getNode(nextNodeIdToSave);

          // Chỉ gửi nếu Node đích được cấu hình tick chọn Gửi thông báo
          if (nextNode && nextNode.data && nextNode.data.sendNotification) {
            let title = `Có cập nhật: ${nextNode.data.label}`;
            let message = `Công việc "${tCheck.title}" đã chuyển sang bước: ${nextNode.data.label}. ${nextNode.data.description || ''}`;
            let recipientCodes: string[] = [];

            // Ưu tiên sử dụng cấu hình Notification từ Workflow Node
            if (nextNode.data.notification) {
              const notifCfg = nextNode.data.notification;
              title = notifCfg.title || title;
              message = notifCfg.template ? notifCfg.template.replace('{{taskTitle}}', `"${tCheck.title}"`) : message;
              
              if (notifCfg.recipientExpression) {
                // Đánh giá biểu thức tìm danh sách người nhận (ví dụ: "[assigneeCode, supervisorCode]")
                try {
                  const evalContext = {
                     assignerCode: tCheck.assignerCode,
                     assigneeCode: tCheck.assigneeCode,
                     creatorEmployeeCode: tCheck.creatorEmployeeCode,
                     supervisorCode: tCheck.supervisorCode,
                     coordinatorCodes: tCheck.coassigneeCodes || []
                  };
                  const getRecipients = new Function('context', `
                    with (context) { return ${notifCfg.recipientExpression}; }
                  `);
                  const computedRecipients = getRecipients(evalContext);
                  if (Array.isArray(computedRecipients)) {
                    recipientCodes = computedRecipients.filter(Boolean);
                  }
                } catch(e) {
                   this.logger.error('Failed to parse recipientExpression', e);
                }
              }
            } else {
              // Template fallback (Hardcode cũ)
              if (targetStatus === 'RETURNED' || rejectReason) {
                title = 'Công việc bị trả lại';
                message = `Công việc "${tCheck.title}" của bạn đã bị trả lại.\nLý do: ${rejectReason}`;
              } else if (nextNode.data.actionName === 'APPROVE') {
                title = 'Yêu cầu nghiệm thu công việc';
                message = `Nhân sự đã báo cáo hoàn thành công việc "${tCheck.title}". Vui lòng kiểm tra và nghiệm thu.`;
              } else if (targetStatus === 'DONE' || nextNode.type === 'end') {
                title = 'Công việc đã được nghiệm thu';
                message = `Công việc "${tCheck.title}" của bạn đã được duyệt hoàn thành.`;
              }

              // Đối soát fallback cũ
              if (nextNode.data.role === 'MANAGER' || targetStatus === 'PENDING_APPROVAL') {
                recipientCodes.push(tCheck.supervisorCode, tCheck.assignerCode, tCheck.creatorEmployeeCode);
              } else {
                recipientCodes.push(tCheck.assigneeCode);
              }
            }

            // Lọc danh sách và loại trừ người đang thao tác
            const uniqueCodes = [...new Set(recipientCodes.filter(c => c && c !== actualActorCode))];

            for (const code of uniqueCodes) {
              const emp = await this.prisma.employee.findUnique({ where: { employeeCode: code }, select: { userId: true } });
              if (emp?.userId) {
                this.shared.notificationClient.emit('send_notification', {
                  title,
                  message,
                  type: 'SYSTEM',
                  recipients: [emp.userId],
                  metadata: {
                    module: (tCheck.metadata as any)?.module || 'hrm',
                    type: (tCheck.metadata as any)?.type || 'work-plans/tasks',
                    id: id
                  },
                }).subscribe();
              }
            }
          }
        }
      } catch (err) {
        this.logger.error('Lỗi khi gửi thông báo tự động từ Workflow', err);
      }
    }

    const updatedTask = await this.prisma.task.findUnique({
      where: { id },
      include: {
        participants: true,
        plan: { select: { id: true, title: true, createdByCode: true } },
        kpiSettings: true
      }
    });
    const enriched = await this.shared.enrichTasks([updatedTask]);
    return this.shared.toTaskResponse(enriched[0]);
  }
  async resolveTask(id: number, action: string, body: any) {
    if (action === 'COMPLETE') {
      const raw = await this.prisma.task.findUnique({ where: { id } });
      const tArr = [raw];
      await this.shared.enrichTasks(tArr);
      const t: any = tArr[0];
      const requiresApproval = t?.assignerCode && t.assignerCode !== t.assigneeCode && t.assignerCode !== 'UNASSIGNED';
      const nextStatus = requiresApproval ? 'PENDING_APPROVAL' : 'DONE';
      return this.updateTaskStatus(id, nextStatus, undefined, body?.currentEmployeeCode, body, action);
    }
    if (action === 'APPROVE') return this.updateTaskStatus(id, 'DONE', undefined, body?.currentEmployeeCode, body, action);
    if (action === 'RETURN') return this.updateTaskStatus(id, 'RETURNED', body?.rejectReason, body?.currentEmployeeCode, body, action);
  }
}
