import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RpcException } from '@nestjs/microservices';
import { TaskRole } from '@generated/prisma/client';
import { firstValueFrom } from 'rxjs';
import { WorkflowEngine } from '@shared/workflow-core/workflow-engine';
import { TaskSharedService } from '../task-shared/task-shared.service';

@Injectable()
export class TaskParticipantsService {
  private readonly logger = new Logger(TaskParticipantsService.name);
  constructor(public prisma: PrismaService, private shared: TaskSharedService) {}
  async assignTask(data: any) {
    const id = data.id;
    const context = data;
    const rawTaskForCheck = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true }
    });
    const metadataForCheck = (rawTaskForCheck?.metadata as any) || {};
    const activeWorkflowId = metadataForCheck.workflowId || rawTaskForCheck?.workflowInstId;
    if (activeWorkflowId && metadataForCheck.currentNodeId) {
      try {
        const tCheckArr = [rawTaskForCheck];
        await this.shared.enrichTasks(tCheckArr);
        const queryContext = { ...context, currentEmployeeCode: context?.currentEmployeeCode, currentUserId: context?.currentUserId };
        const access = await this.shared.checkTaskAccess(tCheckArr[0], queryContext);

        const definition = await this.shared.getWorkflowDefinition(activeWorkflowId);
        if (definition) {
          const engine = new WorkflowEngine(definition);
          const validateRes = engine.validateAction(
            metadataForCheck.currentNodeId,
            'ASSIGN',
            context?.currentUserPermissions || [],
            context?.currentEmployeeCode,
            {
              status: rawTaskForCheck!.status,
              isOwner: access.isOwner,
              isAssignee: access.isAssignee,
              isSupervisor: access.isSupervisor,
              isDeptLeader: access.isDeptLeader,
              isCoordinator: access.isCoordinator,
              isLowestLevel: access.isLowestLevel,
              allowedEmployeeCodes: context?.allowedEmployeeCodes || [],
            }
          );

          if (!validateRes.allowed) {
            this.logger.error(`Validate Action blocked ASSIGN: ${validateRes.reason}, businessData: ${JSON.stringify({ isOwner: access.isOwner, creator: tCheckArr[0]?.creatorEmployeeCode, current: context?.currentEmployeeCode })}`);
            throw new RpcException(`Workflow không cho phép thực hiện hành động phân công/giao việc.`);
          }

          // Chú ý: action ASSIGN thường không làm nhảy bước workflow (không đổi trạng thái task)
          // nên ở đây ta không cần tìm getNextNodeId và update currentNodeId
        }
      } catch (err) {
        if (err instanceof RpcException) throw err;
        this.logger.error('Lỗi tính toán ValidateAction for ASSIGN qua local engine', err);
      }
    }

    const t = await this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        include: { participants: true }
      });
      if (!currentTask) throw new RpcException('Nhiệm vụ không tồn tại');

      let currentAssigneeCode = 'UNASSIGNED';
      const currentAssigneeParticipant = currentTask.participants.find(p => p.participantRole === TaskRole.ASSIGNEE);
      if (currentAssigneeParticipant && currentAssigneeParticipant.employeeCode) {
        currentAssigneeCode = currentAssigneeParticipant.employeeCode;
      }

      const isUnassigned = currentAssigneeCode === 'UNASSIGNED' || currentTask.status === 'TEMPLATE';

      // Delete old participants for assignee, owner, coordinator
      await tx.taskParticipant.deleteMany({
        where: {
          taskId: id,
          participantRole: { in: [TaskRole.ASSIGNEE, TaskRole.OWNER, TaskRole.COORDINATOR] }
        }
      });

      // Re-create participants using helper
      const participantsData = this.shared.buildParticipantsData(id, data);
      if (participantsData.length > 0) {
        await tx.taskParticipant.createMany({ data: participantsData, skipDuplicates: true });
      }

      // Update status to TODO if it was TEMPLATE
      if (currentTask.status === 'TEMPLATE') {
        await tx.task.update({ where: { id }, data: { status: 'TODO' } });
      }

      return tx.task.findUnique({ where: { id }, include: { participants: true, kpiSettings: true } });
    });

    const enriched = await this.shared.enrichTasks([t]);
    const enrichedTaskResponse = this.shared.toTaskResponse(enriched[0]);

    if (data.assigneeCode) {
      this.shared.sendTaskNotification(
        [data.assigneeCode],
        'Có công việc mới được giao',
        `Bạn vừa được phân công phụ trách nhiệm vụ: "${enrichedTaskResponse.title}"`,
        enrichedTaskResponse
      );
    }

    if (Array.isArray(data.coassigneeCodes) && data.coassigneeCodes.length > 0) {
      this.shared.sendTaskNotification(
        data.coassigneeCodes,
        'Có công việc phối hợp mới',
        `Bạn được phân công phối hợp thực hiện nhiệm vụ: "${enrichedTaskResponse.title}"`,
        enrichedTaskResponse
      );
    }

    return enrichedTaskResponse;
  }
  async recommendAssignees(query: any) {
    try {
      const whereClause: any = { employmentStatus: 'active' };

      // 1. Phân quyền: Kiểm tra Admin
      const perms = query.currentUserPermissions || [];
      const isAdmin = perms.includes('TASK:MANAGE');

      if (query.excludeEmployeeCode) {
        whereClause.employeeCode = { not: query.excludeEmployeeCode };
      }

      // Lấy cấu trúc thẩm quyền trực tiếp từ user-service
      if (!isAdmin && query.currentUserId) {
        try {
          const subordinatesRes: any = await firstValueFrom(
            this.shared.userClient.getService('UserService').GetSubordinates({ userId: query.currentUserId })
          );
          query.allowedDepartmentIds = subordinatesRes?.allowedDepartmentIds || subordinatesRes?.allowed_department_ids || [];
          query.allowedEmployeeCodes = subordinatesRes?.allowedEmployeeCodes || subordinatesRes?.allowed_employee_codes || [];
        } catch (e) {
          console.error('Failed to get subordinates for recommendAssignees:', e);
        }
      }

      // Giới hạn gợi ý theo Sơ đồ thẩm quyền từ user-service
      if (!isAdmin) {
        const allowedCodes = query.allowedEmployeeCodes || [];

        if (allowedCodes.length > 0) {
          whereClause.employeeCode = { in: allowedCodes };
        } else if (query.currentEmployeeCode) {
          // Chỉ thấy bản thân nếu không có quyền gì
          whereClause.employeeCode = query.currentEmployeeCode;
        }
      }

      const employees = await this.prisma.employee.findMany({
        where: whereClause,
      });

      const activeTasksCount = await this.prisma.taskParticipant.groupBy({
        by: ['employeeCode'],
        where: {
          participantRole: 'ASSIGNEE',
          task: { status: { not: 'DONE' } },
        },
        _count: { taskId: true },
      });

      const taskCountMap = new Map<string, number>();
      activeTasksCount.forEach(item => {
        if (item.employeeCode) taskCountMap.set(item.employeeCode, item._count.taskId);
      });

      const evaluations = await this.prisma.kpiEvaluation.findMany({
        orderBy: { createdAt: 'desc' },
        select: { employeeCode: true, totalScore: true },
      });
      const kpiMap = new Map(evaluations.map(item => [item.employeeCode, item.totalScore || 75]));

      // 2. Chấm điểm Gợi ý dựa trên Vị trí chức danh (JobTitle), Lĩnh vực (Domain) và Phòng ban theo dõi
      const targetDomainId = query.domainId ? parseInt(query.domainId, 10) : null;
      const targetMonitoredUnitId = query.monitoredUnitId ? parseInt(query.monitoredUnitId, 10) : null;
      const targetJobTitleId = query.jobTitleId ? parseInt(query.jobTitleId, 10) : null;

      let scopeEmployeeCodes: string[] = [];
      if (targetDomainId || targetMonitoredUnitId) {
        try {
          const scopeRes: any = await firstValueFrom(
            this.shared.userClient.getService('UserService').GetEmployeesByScope({ domainId: targetDomainId || 0, monitoredUnitId: targetMonitoredUnitId || 0 })
          );
          scopeEmployeeCodes = scopeRes?.employeeCodes || scopeRes?.employee_codes || [];
        } catch (e) {
          console.error('Failed to get employees by scope:', e);
        }
      }

      const employeeList = employees.map(emp => {
        const taskCount = taskCountMap.get(emp.employeeCode) || 0;
        const kpiScore = kpiMap.get(emp.employeeCode) || 75;

        // Tính điểm Domain/Position Match Score
        let matchScore = 0;
        if (targetJobTitleId && emp.jobTitleId === targetJobTitleId) {
          matchScore += 50; // Ưu tiên tuyệt đối nếu đúng Vị trí chức danh yêu cầu
        }

        // Ưu tiên nếu nhân viên phụ trách Lĩnh vực hoặc Phòng ban tương ứng
        if (scopeEmployeeCodes.includes(emp.employeeCode)) {
          matchScore += 30;
        }

        return {
          id: emp.id,
          employeeCode: emp.employeeCode,
          employeeName: emp.fullName,
          fullName: emp.fullName,
          departmentId: emp.departmentId,
          jobTitleId: emp.jobTitleId,
          currentLoad: taskCount,
          performanceScore: kpiScore,
          matchScore: matchScore
        };
      });

      const strategy = query?.strategy || 'LOW_PERFORMANCE';

      // Sắp xếp: Ưu tiên MatchScore trước, sau đó đến Performance/Load
      employeeList.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;

        if (strategy === 'HIGH_PERFORMANCE') {
          return b.performanceScore - a.performanceScore || a.currentLoad - b.currentLoad;
        } else if (strategy === 'UNDER_QUOTA') {
          return a.currentLoad - b.currentLoad || b.performanceScore - a.performanceScore;
        } else { // 'LOW_PERFORMANCE'
          return a.performanceScore - b.performanceScore || a.currentLoad - b.currentLoad;
        }
      });

      // Group by department for topDepartments
      const deptMap = new Map<number, { departmentId: number; employeeCount: number; currentLoad: number; performanceScore: number, matchScore: number }>();
      employeeList.forEach(emp => {
        if (!emp.departmentId) return;
        const deptId = emp.departmentId;
        if (!deptMap.has(deptId)) {
          deptMap.set(deptId, {
            departmentId: deptId,
            employeeCount: 0,
            currentLoad: 0,
            performanceScore: 0,
            matchScore: 0
          });
        }
        const dept = deptMap.get(deptId)!;
        dept.employeeCount += 1;
        dept.currentLoad += emp.currentLoad;
        dept.performanceScore += emp.performanceScore;
        dept.matchScore += emp.matchScore;
      });

      const topDepartments = Array.from(deptMap.values()).map(dept => ({
        ...dept,
        currentLoad: dept.currentLoad / dept.employeeCount,
        performanceScore: dept.performanceScore / dept.employeeCount,
        matchScore: dept.matchScore / dept.employeeCount
      }));

      topDepartments.sort((a, b) => {
        if (b.matchScore !== a.matchScore) return b.matchScore - a.matchScore;
        if (strategy === 'HIGH_PERFORMANCE') return b.performanceScore - a.performanceScore;
        if (strategy === 'UNDER_QUOTA') return a.currentLoad - b.currentLoad;
        return a.performanceScore - b.performanceScore;
      });

      return {
        success: true,
        data: {
          topEmployees: employeeList,
          topDepartments,
        },
      };
    } catch (error: any) {
      console.error('recommendAssignees error:', error);
      return { success: false, message: error.message || 'Lỗi gợi ý cán bộ' };
    }
  }
  async requestCoordination(id: number, data: any) {
    await this.shared.populateQueryHierarchy(data);
    const t = await this.prisma.task.findUnique({
      where: { id },
      include: { participants: true, plan: { select: { id: true, title: true, createdByCode: true, departmentId: true } } }
    });
    if (!t) throw new RpcException('Nhiệm vụ không tồn tại.');

    await this.shared.enrichTasks([t]);
    const access = await this.shared.checkTaskAccess(t, data);
    if (!access.hasAccess) {
      throw new RpcException('Bạn không có quyền xem thông tin nhiệm vụ này.');
    }

    const allowedActions = await this.shared.computeAllowedActions(t, data);
    if (!allowedActions.includes('COORDINATE')) {
      throw new RpcException('Bạn không có quyền yêu cầu phối hợp trong công việc này.');
    }

    const leadCode = data.leadId || data.leadCode;
    const coordinatorCodes = data.coordinatorIds || data.coordinatorCodes || [];
    const message = data.message;
    const requesterCode = data.requesterCode;

    if (!leadCode && coordinatorCodes.length === 0) {
      // Just a request for coordination from the assignee
      if (message) {
        await this.prisma.taskComment.create({
          data: {
            taskId: id,
            authorCode: requesterCode || null,
            content: `Gửi yêu cầu phối hợp: ${message}`,
            isSystemMessage: true,
          }
        });
      }
      return { success: true };
    }

    return this.prisma.$transaction(async (tx) => {
      const currentTask = await tx.task.findUnique({
        where: { id },
        select: { status: true }
      });

      // 1. Update Lead (ASSIGNEE role) if provided
      if (leadCode) {
        await tx.taskParticipant.deleteMany({
          where: { taskId: id, participantRole: TaskRole.ASSIGNEE }
        });
        await tx.taskParticipant.create({
          data: { taskId: id, employeeCode: leadCode, participantRole: TaskRole.ASSIGNEE }
        });
      }

      // 2. Update Coordinators (COORDINATOR role)
      await tx.taskParticipant.deleteMany({
        where: { taskId: id, participantRole: TaskRole.COORDINATOR }
      });
      if (coordinatorCodes.length > 0) {
        const coData: any[] = [];
        coordinatorCodes.forEach((code: string) => {
          coData.push({
            taskId: id,
            employeeCode: code,
            participantRole: TaskRole.COORDINATOR
          });
        });
        if (coData.length > 0) {
          await tx.taskParticipant.createMany({ data: coData, skipDuplicates: true });
        }
      }

      // Update status to TODO if it was TEMPLATE
      if (currentTask && currentTask.status === 'TEMPLATE') {
        await tx.task.update({ where: { id }, data: { status: 'TODO' } });
      }

      return { success: true };
    });
  }
  async addCoAssignees(id: number, coassigneeCodes: string[]) {
    if (!coassigneeCodes || coassigneeCodes.length === 0) return;
    const employees = await this.prisma.employee.findMany({
      where: { employeeCode: { in: coassigneeCodes } },
      select: { employeeCode: true, userId: true }
    });
    const coData: any[] = [];
    employees.forEach(emp => {
      if (emp.userId) {
        coData.push({
          taskId: id,
          userId: parseInt(emp.userId, 10),
          employeeCode: emp.employeeCode,
          participantRole: TaskRole.COORDINATOR
        });
      }
    });
    if (coData.length > 0) {
      await this.prisma.taskParticipant.createMany({ data: coData, skipDuplicates: true });
    }
    return { success: true };
  }
}
