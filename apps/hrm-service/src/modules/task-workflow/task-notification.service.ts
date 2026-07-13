import { Injectable, Logger } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { TaskSharedService } from '../task-shared/task-shared.service';
import { PrismaService } from '../../database/prisma.service';

/**
 * TaskNotificationService — điểm duy nhất gửi tất cả notification liên quan task.
 * Logic thông báo được lấy từ nodeData của workflow (sendNotification, label, notification config).
 */
@Injectable()
export class TaskNotificationService {
  private readonly logger = new Logger(TaskNotificationService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly shared: TaskSharedService,
  ) {}

  // ─── Notify khi tạo task mới ──────────────────────────────────────────────

  /**
   * Gửi thông báo cho assignee, coassignees, và monitors khi task được tạo.
   * nodeData từ workflow quyết định có gửi không và label là gì.
   */
  async notifyNewTask(
    task: any,
    createData: { assigneeCode?: string; coassigneeCodes?: string[]; monitoredUnitId?: number },
    notifConfig: { sendNotify: boolean; nodeLabel: string; notifConfig?: any },
  ): Promise<void> {
    if (!notifConfig.sendNotify) return;
    const { nodeLabel } = notifConfig;

    if (createData.assigneeCode) {
      this.shared.sendTaskNotification(
        [createData.assigneeCode],
        `Có công việc mới: ${nodeLabel}`,
        `Bạn vừa được giao nhiệm vụ: "${task.title}"`,
        task,
      );
    }

    if (createData.coassigneeCodes?.length) {
      this.shared.sendTaskNotification(
        createData.coassigneeCodes,
        `Có công việc phối hợp mới: ${nodeLabel}`,
        `Bạn được phân công phối hợp thực hiện nhiệm vụ: "${task.title}"`,
        task,
      );
    }

    if (createData.monitoredUnitId) {
      await this.notifyMonitoredUnit(task, createData.monitoredUnitId, nodeLabel);
    }
  }

  // ─── Notify khi chuyển workflow node ─────────────────────────────────────

  /**
   * Gửi thông báo tự động khi task transition sang node mới.
   * Đọc cấu hình từ nextNodeData.notification (workflow designer đặt).
   */
  async notifyTransition(task: any, nextNodeData: any, actorCode?: string): Promise<void> {
    if (!nextNodeData?.sendNotification) return;

    let title = `Có cập nhật: ${nextNodeData.label || ''}`;
    let message = `Công việc "${task.title}" đã chuyển sang bước: ${nextNodeData.label || ''}. ${nextNodeData.description || ''}`;
    let recipientCodes: string[] = [];

    const cfg = nextNodeData.notification;
    if (cfg) {
      if (cfg.title) title = cfg.title;
      if (cfg.template) message = cfg.template.replace('{{taskTitle}}', `"${task.title}"`);

      if (Array.isArray(cfg.recipients)) {
        const roleMap: Record<string, string | string[]> = {
          assigneeCode: task.assigneeCode,
          assignerCode: task.assignerCode,
          creatorEmployeeCode: task.creatorEmployeeCode,
          supervisorCode: task.supervisorCode,
          coordinatorCodes: task.coassigneeCodes || [],
        };
        for (const key of cfg.recipients) {
          const val = roleMap[key];
          if (Array.isArray(val)) recipientCodes.push(...val);
          else if (val) recipientCodes.push(val);
        }
      }
    } else {
      title = `Có công việc cần xử lý: ${nextNodeData.label || ''}`;
      message = `Công việc "${task.title}" vừa chuyển đến bước: ${nextNodeData.label || ''}. Vui lòng kiểm tra và xử lý.`;
      recipientCodes = nextNodeData.role === 'MANAGER'
        ? [task.supervisorCode, task.assignerCode, task.creatorEmployeeCode].filter(Boolean)
        : [task.assigneeCode].filter(Boolean);
    }

    const uniqueCodes = [...new Set(recipientCodes.filter(c => c && c !== actorCode))];
    if (uniqueCodes.length === 0) return;

    const emps = await this.prisma.employee.findMany({
      where: { employeeCode: { in: uniqueCodes } },
      select: { userId: true },
    });
    const userIds = emps.map(e => e.userId).filter(Boolean) as string[];

    if (userIds.length > 0) {
      this.shared.sendTaskNotification(userIds, title, message, { id: task.id, metadata: task.metadata });
    }
  }

  // ─── Notify yêu cầu phê duyệt ────────────────────────────────────────────

  /**
   * Gửi thông báo cho người phê duyệt khi assignee hoàn thành task (approvalRequired).
   */
  async notifyApprovalRequired(task: any, nextNodeData: any, actorCode?: string): Promise<void> {
    if (!nextNodeData?.approvalRequired) return;

    const ownerParticipant = await this.prisma.taskParticipant.findFirst({
      where: { taskId: task.id, participantRole: 'OWNER' },
      select: { employeeCode: true },
    });
    const approverCode = ownerParticipant?.employeeCode || task.creatorEmployeeCode;
    if (!approverCode || approverCode === actorCode) return;

    const [approverEmp, assigneeEmp] = await Promise.all([
      this.prisma.employee.findUnique({ where: { employeeCode: approverCode }, select: { userId: true } }),
      this.prisma.employee.findUnique({ where: { employeeCode: task.assigneeCode }, select: { fullName: true } }),
    ]);

    if (!approverEmp?.userId) return;

    const tmpl = nextNodeData.approvalNotificationTemplate;
    const assigneeName = assigneeEmp?.fullName || task.assigneeCode;
    const notifMsg = tmpl
      ? tmpl.replace(/\{\{assigneeName\}\}/g, assigneeName).replace(/\{\{taskTitle\}\}/g, task.title || '')
      : `${assigneeName} đã hoàn thành "${task.title}". Vui lòng kiểm tra và phê duyệt.`;

    this.shared.sendTaskNotification(
      [approverEmp.userId],
      'Yêu cầu phê duyệt kết quả công việc',
      notifMsg,
      { id: task.id, metadata: task.metadata },
    );
  }

  // ─── Notify @mention trong comment ───────────────────────────────────────

  /**
   * Gửi thông báo cho người bị @mention trong comment.
   */
  async notifyMention(task: any, content: string, actorCode: string, actorName: string): Promise<void> {
    const mentionRegex = /@\[.*?\]\(([^)]+)\)/g;
    const mentionedCodes = new Set<string>();
    let match;
    while ((match = mentionRegex.exec(content)) !== null) {
      if (match[1] !== actorCode) mentionedCodes.add(match[1]);
    }
    if (mentionedCodes.size === 0) return;

    const emps = await this.prisma.employee.findMany({
      where: { employeeCode: { in: Array.from(mentionedCodes) } },
      select: { userId: true },
    });
    const userIds = emps.map(e => e.userId).filter(Boolean) as string[];

    if (userIds.length > 0) {
      this.shared.sendTaskNotification(
        userIds,
        'Bạn được nhắc đến trong bình luận',
        `${actorName} đã nhắc đến bạn trong bình luận của công việc "${task.title}"`,
        task,
      );
    }
  }

  // ─── Private helpers ──────────────────────────────────────────────────────

  private async notifyMonitoredUnit(task: any, monitoredUnitId: number, nodeLabel: string): Promise<void> {
    try {
      const res: any = await firstValueFrom(
        this.shared.userService.GetEmployeesByScope({ monitored_unit_id: monitoredUnitId }),
      );
      const followerCodes: string[] = res?.employeeCodes || res?.employee_codes || [];
      if (followerCodes.length > 0) {
        this.shared.sendTaskNotification(
          followerCodes,
          `Có công việc mới tại phòng ban theo dõi: ${nodeLabel}`,
          `Một nhiệm vụ mới ("${task.title}") vừa được giao cho phòng ban bạn đang phụ trách theo dõi.`,
          task,
        );
      }
    } catch (e) {
      this.logger.error('Failed to notify monitored unit', e);
    }
  }
}
