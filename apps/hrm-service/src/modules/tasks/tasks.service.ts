import { Injectable, Inject } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class TasksService implements OnModuleInit {
  private integrationService: any;
  private recommendationCache = new Map<string, { data: any, expiresAt: number }>();
  private readonly RECOMMENDATION_CACHE_TTL_MS = 300000; // 5 minutes

  constructor(
    private prisma: PrismaService,
    @Inject('NOTIFICATION_SERVICE') private notificationClient: ClientProxy,
    @Inject('INTEGRATION_PACKAGE') private integrationClient: any,
  ) { }

  onModuleInit() {
    this.integrationService = this.integrationClient.getService('IntegrationService');
  }

  // Lấy động cấu hình tích hợp
  private async getDynamicConfig() {
    try {
      const res = await firstValueFrom<any>(this.integrationService.FindAll({ search: '' }));
      const data = res?.data || res || [];
      if (!data || !Array.isArray(data)) return {};
      const config: Record<string, any> = {};
      for (const item of data) {
        if (item.isActive && item.configData) {
          try {
            const parsed = typeof item.configData === 'string' ? JSON.parse(item.configData) : item.configData;
            if (item.integrationCode === 'NOTIFY_TELEGRAM') config.telegram = parsed;
            if (item.integrationCode === 'NOTIFY_ZALO') config.zalo = parsed;
            if (item.integrationCode === 'NOTIFY_SMTP') config.smtp = parsed;
            if (item.integrationCode === 'NOTIFY_INAPP') config.inApp = parsed;
          } catch (e) { }
        }
      }
      return config;
    } catch (error) {
      console.warn('Failed to fetch dynamic config from user-service:', error.message);
      return {};
    }
  }

  private async getTaskStats(query: any) {
    const statsWhere: any = query.assigneeCode ? { assigneeCode: query.assigneeCode } : {};

    if (!query.isAdmin && query.currentUserCode) {
      const authConditions: any[] = [
        { assigneeCode: query.currentUserCode },
        { assignerCode: query.currentUserCode },
      ];
      if (query.currentUserDept) {
        authConditions.push({ departmentId: query.currentUserDept });
      }
      statsWhere.AND = [{ OR: authConditions }];
    }

    const baseWhere = { ...statsWhere, status: { notIn: ['DONE', 'ARCHIVED', 'TEMPLATE'] } };

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    // Fetch minimal data for single-pass bucketing
    const tasks = await this.prisma.task.findMany({
      where: baseWhere,
      select: { status: true, dueDate: true }
    });

    let overdueCount = 0;
    let dueIn3DaysCount = 0;
    let dueIn7DaysCount = 0;
    let dueOver7DaysCount = 0;

    for (let i = 0; i < tasks.length; i++) {
      const t = tasks[i];
      if (t.status === 'OVERDUE' || (t.dueDate && t.dueDate < now)) {
        overdueCount++;
      } else if (t.status !== 'OVERDUE') {
        if (t.dueDate && t.dueDate >= now && t.dueDate <= in3Days) {
          dueIn3DaysCount++;
        } else if (t.dueDate && t.dueDate > in3Days && t.dueDate <= in7Days) {
          dueIn7DaysCount++;
        } else if (!t.dueDate || t.dueDate > in7Days) {
          dueOver7DaysCount++;
        }
      }
    }

    return { overdueCount, dueIn3DaysCount, dueIn7DaysCount, dueOver7DaysCount };
  }

  private applyDateFilter(filter: string, where: any) {
    if (!filter) return;

    const now = new Date();
    now.setHours(0, 0, 0, 0);

    const in3Days = new Date(now);
    in3Days.setDate(in3Days.getDate() + 3);

    const in7Days = new Date(now);
    in7Days.setDate(in7Days.getDate() + 7);

    // Bắt buộc loại bỏ DONE, ARCHIVED, TEMPLATE khi có filter ngày
    where.status = { notIn: ['DONE', 'ARCHIVED', 'TEMPLATE'] };

    switch (filter) {
      case 'overdue':
        where.OR = [
          { status: 'OVERDUE' },
          { dueDate: { lt: now } }
        ];
        break;
      case 'dueIn3Days':
        where.status = { notIn: ['DONE', 'ARCHIVED', 'OVERDUE', 'TEMPLATE'] };
        where.dueDate = { gte: now, lte: in3Days };
        break;
      case 'dueIn7Days':
        where.status = { notIn: ['DONE', 'ARCHIVED', 'OVERDUE', 'TEMPLATE'] };
        where.dueDate = { gt: in3Days, lte: in7Days };
        break;
      case 'dueOver7Days':
        where.status = { notIn: ['DONE', 'ARCHIVED', 'OVERDUE', 'TEMPLATE'] };
        where.OR = [
          { dueDate: { gt: in7Days } },
          { dueDate: null }
        ];
        break;
    }
  }

  async listTasks(query: any) {
    const where: any = {
      // Không hiển thị task dạng template (chưa được giao)
      status: { not: 'TEMPLATE' },
    };
    if (query.assigneeCode) {
      if (query.isSupervisor) {
        where.supervisorCode = query.assigneeCode;
      } else {
        where.assigneeCode = query.assigneeCode;
      }
    }
    // Lọc theo người giao việc (tab ASSIGNED_BY_ME)
    if (query.assignerCode) {
      where.assignerCode = query.assignerCode;
    }
    if (query.departmentId) {
      where.departmentId = query.departmentId;
    }
    if (query.search) {
      where.title = { contains: query.search };
    }
    // Lọc theo status cụ thể (từ dropdown trạng thái) - nhưng vẫn không cho TEMPLATE
    if (query.status && query.status !== 'ALL') {
      where.status = query.status;
    }
    // Lọc theo mức độ ưu tiên
    if (query.priority && query.priority !== 'ALL') {
      where.priority = query.priority;
    }

    this.applyDateFilter(query.filter, where);

    // Lọc theo planId — khi query theo plan thì bỏ qua auth filter (plan visibility đã kiểm tra)
    if (query.planId) {
      where.planId = parseInt(query.planId, 10);
      // Khi filter theo planId, bỏ điều kiện TEMPLATE để thấy cả task chưa giao
      delete where.status;
      return this.listTasksByPlan(where, query);
    }

    // Nếu đã chỉ định assignerCode cụ thể (tab ASSIGNED_BY_ME), bỏ qua auth filter
    // để người giao việc thấy TẤT CẢ task họ đã giao (kể cả giao cho người khác phòng)
    if (!query.assignerCode && !query.isAdmin && query.currentUserCode) {
      const authConditions: any[] = [
        { assigneeCode: query.currentUserCode },
        { assignerCode: query.currentUserCode },
        // Người phối hợp cũng thấy task (co-assignee)
        { coAssigneeCodesJson: { contains: query.currentUserCode } },
      ];

      // QUY TẮC: Thấy task nếu task thuộc kế hoạch của đơn vị cấp trên
      const ancestorIds: number[] = Array.isArray(query.callerAncestorUnitIds)
        ? query.callerAncestorUnitIds.map(Number).filter(Boolean)
        : (query.currentUserDept ? [query.currentUserDept] : []);

      if (ancestorIds.length > 0) {
        authConditions.push({ departmentId: { in: ancestorIds } });
      }

      where.AND = where.AND || [];
      where.AND.push({ OR: authConditions });
    }


    const [tasks, stats] = await Promise.all([
      this.prisma.task.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          assignee: true,
          assigner: true,
          supervisor: true,
          plan: { select: { id: true, title: true } }
        }
      }),
      this.getTaskStats(query)
    ]);

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ thành công',
      data: tasks.map((t: any) => ({
        ...t,
        assigneeName: t.assignee
          ? `${t.assignee.lastname} ${t.assignee.firstname}`.trim()
          : (t.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : t.assigneeCode),
        assignerName: t.assigner
          ? `${t.assigner.lastname} ${t.assigner.firstname}`.trim()
          : (t.assignerCode || ''),
        supervisorName: t.supervisor
          ? `${t.supervisor.lastname} ${t.supervisor.firstname}`.trim()
          : (t.supervisorCode || ''),
        dueDate: t.dueDate?.toISOString() || '',
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
        plan: t.plan || null,
        coAssigneeCodes: this.parseCoAssigneeCodes(t.coAssigneeCodesJson),
      })),
      meta: {
        pagination: {
          total: tasks.length,
          page: 1,
          pageSize: tasks.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      },
      stats
    };
  }

  /** Lấy toàn bộ task thuộc 1 kế hoạch (flat list), client tự build tree theo parentId */
  private async listTasksByPlan(where: any, query: any) {
    const tasks = await this.prisma.task.findMany({
      where,
      orderBy: [{ parentId: 'asc' }, { createdAt: 'asc' }],
      include: {
        assignee: true,
        assigner: true,
        plan: { select: { id: true, title: true } }
      }
    });

    const isUserAdmin = query.isAdmin;
    const currentUserCode = query.currentUserCode;
    const callerAncestorUnitIds = Array.isArray(query.callerAncestorUnitIds) ? query.callerAncestorUnitIds.map(Number) : [];

    return {
      success: true,
      message: 'Lấy danh sách nhiệm vụ theo kế hoạch thành công',
      data: tasks.map((t: any) => {
        // Phân quyền cho từng task
        const canEdit = isUserAdmin
          || t.assignerCode === currentUserCode
          || t.assigneeCode === currentUserCode
          || (t.departmentId && callerAncestorUnitIds.includes(t.departmentId));

        return {
          ...t,
          assigneeName: t.assignee
            ? `${t.assignee.lastname} ${t.assignee.firstname}`.trim()
            : (t.assigneeCode === 'UNASSIGNED' || !t.assigneeCode ? 'Chưa phân công' : t.assigneeCode),
          assignerName: t.assigner
            ? `${t.assigner.lastname} ${t.assigner.firstname}`.trim()
            : (t.assignerCode || ''),
          dueDate: t.dueDate?.toISOString() || '',
          startDate: t.startDate?.toISOString() || '',
          createdAt: t.createdAt?.toISOString() || '',
          updatedAt: t.updatedAt?.toISOString() || '',
          plan: t.plan || null,
          permissions: {
            canEdit,
            canAssign: canEdit,
            canAddSubTask: canEdit
          }
        };
      }),
      meta: { pagination: { total: tasks.length, page: 1, pageSize: tasks.length, totalPages: 1 } }
    };
  }

  async createTask(data: any) {
    // Propagate planId từ task cha nếu không có — đảm bảo toàn bộ cây task thuộc cùng kế hoạch
    let planId = data.planId || null;
    if (data.parentId && !planId) {
      const parent = await this.prisma.task.findUnique({
        where: { id: parseInt(data.parentId, 10) },
        select: { planId: true }
      });
      planId = parent?.planId || null;
    }

    // Sub-task tạo bởi người được giao → status TEMPLATE (chưa giao), gốc → TODO
    const initialStatus = data.parentId ? 'TEMPLATE' : (data.status || 'TODO');

    const t = await this.prisma.task.create({
      data: {
        title: data.title || data.taskName || 'Nhiệm vụ không tên',
        description: data.description,
        assigneeCode: data.assigneeCode || 'UNASSIGNED',
        assignerCode: data.assignerCode || '',
        departmentId: data.departmentId || null,
        status: initialStatus,
        priority: data.priority || 'MEDIUM',
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        baseScore: data.baseScore,
        weight: data.weight,
        scoringMethod: data.scoringMethod || 'MANUAL',
        bonusPerDay: data.bonusPerDay,
        penaltyPerDay: data.penaltyPerDay,
        supervisorCode: data.supervisorCode || null,
        planId,
        parentId: data.parentId ? parseInt(data.parentId, 10) : null,
      }
    });

    return {
      ...t,
      startDate: t.startDate?.toISOString() || '',
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async updateTaskStatus(id: number, status: string, rejectReason?: string, actorCode?: string) {
    const dataToUpdate: any = { status };
    if (rejectReason !== undefined) {
      dataToUpdate.rejectReason = rejectReason;
    }

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: { assignee: true, assigner: true }
    });

    if (t.assignerCode && t.assigner) {
      if (status === 'RETURNED' || status === 'DONE') {
        const title = status === 'RETURNED' ? 'bị trả lại' : 'được hoàn thành';
        const dynamicConfig = await this.getDynamicConfig();
        this.notificationClient.emit('notify', {
          recipient: t.assigner.email || t.assignerCode,
          subject: `[HRM] Công việc ${title}: ${t.title}`,
          body: `Công việc "${t.title}" đã ${title}.\nNgười thực hiện: ${actorCode}${status === 'RETURNED' ? `\nLý do: ${rejectReason}` : ''}\nVui lòng truy cập hệ thống để xem chi tiết.`,
          metadata: { dynamicConfig }
        });
      }
    }

    if (rejectReason && status === 'RETURNED') {
      await this.prisma.taskComment.create({
        data: {
          taskId: id,
          authorCode: actorCode || null,
          content: `Đã trả lại công việc với lý do: ${rejectReason}`,
          isSystemMessage: true,
        }
      });
    }

    // Nếu status là DONE, tự động cập nhật progress = 100 và tính lại tiến độ parent
    if (status === 'DONE') {
      await this.updateTaskProgress(id, 100, actorCode);
    }

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async recommendAssignees(query: { rankCode: string, strategy: string }) {
    const { rankCode, strategy } = query;

    const cacheKey = `${rankCode}_${strategy}`;
    const cached = this.recommendationCache.get(cacheKey);
    if (cached && cached.expiresAt > Date.now()) {
      return cached.data;
    }

    const where: any = {};
    if (rankCode && rankCode !== 'ALL') {
      where.rankCode = rankCode;
    }

    const employees = await this.prisma.employee.findMany({
      where,
      include: {
        tasksReceived: {
          where: { status: { in: ['TODO', 'IN_PROGRESS', 'OVERDUE'] } }
        },
        kpiEvaluations: {
          where: { status: 'APPROVED' },
          orderBy: { periodId: 'desc' },
          take: 3
        }
      }
    });

    const deptMap = new Map<number, any>();
    const recommendations: any[] = [];

    // Single-pass reduction
    for (let i = 0; i < employees.length; i++) {
      const emp = employees[i];

      let currentLoad = 0;
      for (let j = 0; j < emp.tasksReceived.length; j++) {
        currentLoad += emp.tasksReceived[j].weight || 10;
      }

      let performanceScore = 50;
      if (emp.kpiEvaluations && emp.kpiEvaluations.length > 0) {
        let totalScore = 0;
        for (let j = 0; j < emp.kpiEvaluations.length; j++) {
          totalScore += emp.kpiEvaluations[j].totalScore || 0;
        }
        performanceScore = totalScore / emp.kpiEvaluations.length;
      } else {
        // Fallback mock if no evaluations yet
        performanceScore = 60 + Math.random() * 30;
      }

      // Match Score Calculation
      let loadFactor = Math.max(0, 100 - currentLoad); // Less load = higher factor
      let perfFactor = performanceScore;
      if (strategy === 'LOW_PERFORMANCE') {
        perfFactor = 100 - performanceScore;
      } else if (strategy === 'UNDER_QUOTA') {
        // Hạn mức quy định tạm tính là 40 điểm
        loadFactor = currentLoad < 40 ? 100 : 0;
      }

      const matchScore = (loadFactor * 0.6) + (perfFactor * 0.4);

      recommendations.push({
        employeeCode: emp.employeeCode,
        employeeName: `${emp.lastname} ${emp.firstname}`.trim(),
        departmentId: emp.departmentId,
        jobTitleId: emp.jobTitleId,
        currentLoad,
        performanceScore,
        matchScore
      });

      // Group by department in the same pass
      if (emp.departmentId) {
        let d = deptMap.get(emp.departmentId);
        if (!d) {
          d = { departmentId: emp.departmentId, totalLoad: 0, totalPerf: 0, totalMatch: 0, count: 0 };
          deptMap.set(emp.departmentId, d);
        }
        d.totalLoad += currentLoad;
        d.totalPerf += performanceScore;
        d.totalMatch += matchScore;
        d.count += 1;
      }
    }

    // Sort by matchScore DESC
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    const topDepartments = Array.from(deptMap.values()).map(d => ({
      departmentId: d.departmentId,
      currentLoad: d.totalLoad / d.count,
      performanceScore: d.totalPerf / d.count,
      matchScore: d.totalMatch / d.count,
      employeeCount: d.count
    })).sort((a, b) => b.matchScore - a.matchScore);

    const result = {
      success: true,
      message: 'Gợi ý nhân sự và phòng ban thành công',
      data: {
        topEmployees: recommendations.slice(0, 5),
        topDepartments: topDepartments.slice(0, 3)
      }
    };

    this.recommendationCache.set(cacheKey, { data: result, expiresAt: Date.now() + this.RECOMMENDATION_CACHE_TTL_MS });
    return result;
  }

  async updateTask(id: number, data: any) {
    const updateData: any = {};
    if (data.weight !== undefined && data.weight !== null && data.weight !== 0) updateData.weight = data.weight;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);
    if (data.priority) updateData.priority = data.priority;
    if (data.baseScore !== undefined && data.baseScore !== null && data.baseScore !== 0) updateData.baseScore = data.baseScore;
    if (data.title) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description;

    const t = await this.prisma.task.update({
      where: { id },
      data: updateData,
    });

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      startDate: t.startDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async assignTask(id: number, assigneeCode: string, coAssigneeCodes?: string[], departmentId?: number, assignerCode?: string) {
    const currentTask = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, title: true, planId: true, priority: true, startDate: true, dueDate: true, status: true, assignerCode: true }
    });

    if (!currentTask) {
      throw new Error('Không tìm thấy nhiệm vụ gốc.');
    }

    const dataToUpdate: any = {};
    if (assigneeCode !== undefined) dataToUpdate.assigneeCode = assigneeCode;
    if (departmentId !== undefined) dataToUpdate.departmentId = departmentId;

    if (assignerCode) {
      // Không được giao việc cho chính mình
      if (assigneeCode === assignerCode) {
        throw new Error('Không được phân công công việc cho chính mình.');
      }
      // Không được giao lại cho người đã giao cho mình
      if (assigneeCode === currentTask.assignerCode && assigneeCode !== 'UNASSIGNED') {
        throw new Error('Không được giao lại công việc cho người đã giao việc cho bạn.');
      }

      // Ghi đè người giao việc nếu là employee hợp lệ
      const assignerEmployee = await this.prisma.employee.findUnique({
        where: { employeeCode: assignerCode },
        select: { employeeCode: true }
      });
      if (assignerEmployee) {
        dataToUpdate.assignerCode = assignerCode;
      }
    }

    // TEMPLATE → TODO khi được giao lần đầu
    if (currentTask?.status === 'TEMPLATE') {
      dataToUpdate.status = 'TODO';
    }

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate,
      include: { assignee: true }
    });

    if (assigneeCode && t.assignee && t.assigneeCode !== 'UNASSIGNED') {
      const dynamicConfig = await this.getDynamicConfig();
      this.notificationClient.emit('notify', {
        recipient: t.assignee.email || t.assigneeCode,
        subject: `[HRM] Phân công công việc mới: ${t.title}`,
        body: `Bạn vừa được phân công công việc: "${t.title}".\nHạn hoàn thành: ${t.dueDate ? t.dueDate.toISOString().split('T')[0] : 'Chưa xác định'}.\nVui lòng truy cập hệ thống để xem chi tiết.`,
        metadata: { dynamicConfig }
      });
    }

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
      coAssigneeCodes: this.parseCoAssigneeCodes((t as any).coAssigneeCodesJson),
    };
  }

  /** Parse JSON string thành mảng employeeCode của người phối hợp */
  private parseCoAssigneeCodes(json: string | null | undefined): string[] {
    if (!json) return [];
    try { return JSON.parse(json); } catch { return []; }
  }

  /**
   * Two cases in one endpoint:
   *
   * A) Assignee requests coordination: escalates to direct supervisor (assignerCode).
   *    - data.leadCode = undefined, data.requesterCode = assigneeCode
   *
   * B) Supervisor assigns Lead & Coordinators after receiving request:
   *    - data.leadCode = who becomes the new lead
   *    - data.coordinatorCodes = list of coordinators
   *    - data.requesterCode = assigner (supervisor)
   */
  async requestCoordination(data: {
    taskId: number;
    requesterCode: string;
    message?: string;
    // Role assignment (for supervisors)
    leadCode?: string;
    coordinatorCodes?: string[];
  }) {
    const task = await this.prisma.task.findUnique({
      where: { id: data.taskId },
      include: { assigner: true, assignee: true }
    });
    if (!task) throw new Error('Task not found.');

    // === CASE B: Supervisor assigns Lead & Coordinators ===
    if (data.leadCode) {
      const isAssigner = task.assignerCode === data.requesterCode;
      if (!isAssigner) {
        throw new Error('Only the task assigner can assign lead and coordinators.');
      }

      const coordinatorCodes = data.coordinatorCodes || [];

      // Update task: assigneeCode = lead, coAssigneeCodesJson = coordinators
      await this.prisma.task.update({
        where: { id: data.taskId },
        data: {
          assigneeCode: data.leadCode,
          coAssigneeCodesJson: coordinatorCodes.length > 0 ? JSON.stringify(coordinatorCodes) : null,
        }
      });

      // Write system message
      const coordinatorStr = coordinatorCodes.length > 0
        ? `Coordinators: ${coordinatorCodes.join(', ')}`
        : 'No coordinators assigned';
      await this.prisma.taskComment.create({
        data: {
          taskId: data.taskId,
          authorCode: null,
          content: `👥 [ASSIGNED]: Supervisor ${data.requesterCode} assigned roles:\n🎯 Lead: ${data.leadCode}\n🤝 ${coordinatorStr}`,
          isSystemMessage: true,
        }
      });

      // Notify new lead (if different from previous assignee)
      const dynamicConfig = await this.getDynamicConfig();
      if (data.leadCode !== task.assigneeCode) {
        const leadEmp = await this.prisma.employee.findFirst({
          where: { employeeCode: data.leadCode },
          select: { email: true }
        });
        if (leadEmp?.email) {
          this.notificationClient.emit('notify', {
            recipient: leadEmp.email,
            subject: `[HRM] You are the Lead: ${task.title}`,
            body: `You have been assigned as Lead for task: "${task.title}".\nDue: ${task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'Not set'}.\nPlease log in to view details.`,
            metadata: { dynamicConfig }
          });
        }
      }

      // Notify each coordinator
      if (coordinatorCodes.length > 0) {
        const coEmps = await this.prisma.employee.findMany({
          where: { employeeCode: { in: coordinatorCodes } },
          select: { employeeCode: true, email: true }
        });
        for (const emp of coEmps) {
          if (emp.email) {
            this.notificationClient.emit('notify', {
              recipient: emp.email,
              subject: `[HRM] You are a Coordinator: ${task.title}`,
              body: `You have been assigned as coordinator for task: "${task.title}".\nLead: ${data.leadCode}.\nDue: ${task.dueDate ? task.dueDate.toISOString().split('T')[0] : 'Not set'}.\nPlease log in to view details.`,
              metadata: { dynamicConfig }
            });
          }
        }
      }

      return {
        success: true,
        message: 'Lead & Coordinators assigned successfully',
        data: { leadCode: data.leadCode, coordinatorCodes }
      };
    }

    // === CASE A: Assignee requests coordination → escalate to supervisor ===
    const supervisorCode = task.assignerCode;
    if (!supervisorCode || supervisorCode === data.requesterCode) {
      throw new Error('Cannot determine direct supervisor to send coordination request.');
    }

    const requestMsg = data.message?.trim() || 'I need support to complete this task.';
    await this.prisma.taskComment.create({
      data: {
        taskId: data.taskId,
        authorCode: null,
        content: `🤝 [COORDINATION REQUEST]: ${data.requesterCode} sent a coordination request to supervisor.\nMessage: ${requestMsg}`,
        isSystemMessage: true,
      }
    });

    if (task.assigner?.email) {
      const dynamicConfig = await this.getDynamicConfig();
      this.notificationClient.emit('notify', {
        recipient: task.assigner.email,
        subject: `[HRM] Coordination request: ${task.title}`,
        body: `${data.requesterCode} has sent a coordination request for task: "${task.title}".\n\nMessage: ${requestMsg}\n\nPlease log in to review and assign roles if needed.`,
        metadata: { dynamicConfig }
      });
    }

    return {
      success: true,
      message: `Coordination request sent to supervisor (${supervisorCode}) successfully`,
      data: { supervisorCode }
    };
  }

  private async checkTaskPermission(task: any, query: any) {
    if (query.isAdmin) return;
    if (!query.currentUserCode) return; // Bỏ qua nếu ko có thông tin auth

    const code = query.currentUserCode;
    if (task.assigneeCode === code || task.assignerCode === code || task.supervisorCode === code) return;
    
    // Nếu là task phối hợp
    try {
      const coAssignees = task.coAssigneeCodesJson ? JSON.parse(task.coAssigneeCodesJson) : [];
      if (Array.isArray(coAssignees) && coAssignees.includes(code)) return;
    } catch {}

    const ancestorIds: number[] = Array.isArray(query.callerAncestorUnitIds)
      ? query.callerAncestorUnitIds.map(Number).filter(Boolean)
      : (query.currentUserDept ? [query.currentUserDept] : []);
    
    if (task.departmentId !== null && ancestorIds.includes(task.departmentId)) return;

    // Check plan bypass
    if (task.planId) {
      const plan = await this.prisma.masterPlan.findUnique({
        where: { id: task.planId },
        include: { tasks: { select: { assigneeCode: true, assignerCode: true } } }
      });
      if (plan) {
         if (plan.departmentId !== null && ancestorIds.includes(plan.departmentId)) return;
         if (plan.tasks.some(t => t.assigneeCode === code || t.assignerCode === code)) return;
      }
    }

    throw new Error('Bạn không có quyền truy cập nhiệm vụ này.');
  }

  async getTask(query: any) {
    const id = typeof query === 'object' ? query.id : query;
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: { assignee: true, assigner: true, plan: true }
    });
    if (!task) throw new Error('Task not found');
    
    if (typeof query === 'object') {
      await this.checkTaskPermission(task, query);
    }

    return {
      ...task,
      dueDate: task.dueDate?.toISOString() || '',
      startDate: task.startDate?.toISOString() || '',
      createdAt: task.createdAt?.toISOString() || '',
      updatedAt: task.updatedAt?.toISOString() || ''
    };
  }

  async breakdownTask(data: any) {
    const parent = await this.prisma.task.findUnique({
      where: { id: data.parentId }
    });
    if (!parent) throw new Error('Không tìm thấy nhiệm vụ cha');

    const child = await this.prisma.task.create({
      data: {
        title: data.title,
        description: data.description,
        assigneeCode: data.assigneeCode || 'UNASSIGNED',
        assignerCode: data.assignerCode || '',
        departmentId: data.departmentId || null,
        status: 'TODO',
        priority: parent.priority,
        planId: parent.planId,
        parentId: parent.id,
        rootTaskId: parent.rootTaskId || parent.id,
        startDate: data.startDate ? new Date(data.startDate) : parent.startDate,
        dueDate: data.dueDate ? new Date(data.dueDate) : parent.dueDate,
        baseScore: data.baseScore || 0,
        weight: data.weight || 0,
        scoringMethod: parent.scoringMethod
      }
    });
    return {
      ...child,
      startDate: child.startDate?.toISOString() || '',
      dueDate: child.dueDate?.toISOString() || '',
      createdAt: child.createdAt?.toISOString() || '',
      updatedAt: child.updatedAt?.toISOString() || ''
    };
  }

  async updateTaskProgress(id: number, progress: number, actorCode?: string) {
    const t = await this.prisma.task.update({
      where: { id },
      data: { progress }
    });

    // Recalculate parent progress if applicable
    if (t.parentId) {
      await this.recalculateParentProgress(t.parentId);
    }

    return t;
  }

  private async recalculateParentProgress(parentId: number) {
    const parent = await this.prisma.task.findUnique({
      where: { id: parentId },
      include: { subTasks: true }
    });

    if (!parent || !parent.subTasks || parent.subTasks.length === 0) return;

    let totalProgress = 0;
    let allCompleted = true;

    for (const child of parent.subTasks) {
      totalProgress += child.progress || 0;
      if (child.progress < 100) {
        allCompleted = false;
      }
    }

    const avgProgress = totalProgress / parent.subTasks.length;

    const dataToUpdate: any = { progress: avgProgress };
    if (allCompleted) {
      dataToUpdate.status = 'DONE';
    } else if (parent.status === 'DONE') {
      // Nếu task cha đang là DONE nhưng có task con mới chưa xong, chuyển về IN_PROGRESS
      dataToUpdate.status = 'IN_PROGRESS';
    }

    await this.prisma.task.update({
      where: { id: parentId },
      data: dataToUpdate
    });

    // Recursively update upwards
    if (parent.parentId) {
      await this.recalculateParentProgress(parent.parentId);
    }
  }


  async addComment(data: any) {
    let finalAuthorCode = data.isSystemMessage ? null : data.authorCode;

    if (finalAuthorCode) {
      const emp = await this.prisma.employee.findUnique({
        where: { employeeCode: finalAuthorCode }
      });
      if (!emp) {
        finalAuthorCode = null;
      }
    }

    const c = await this.prisma.taskComment.create({
      data: {
        taskId: data.taskId,
        authorCode: finalAuthorCode,
        content: data.content,
        isSystemMessage: data.isSystemMessage || false,
      },
      include: { author: true }
    });
    return {
      id: c.id,
      taskId: c.taskId,
      authorCode: c.authorCode || '',
      authorName: c.author ? `${c.author.lastname} ${c.author.firstname}`.trim() : (c.isSystemMessage ? 'Hệ thống' : 'Quản trị viên'),
      authorAvatar: c.author?.avatar || '',
      content: c.content,
      isSystemMessage: c.isSystemMessage,
      createdAt: c.createdAt.toISOString()
    };
  }

  async getComments(query: any) {
    const taskId = typeof query === 'object' ? query.taskId : query;

    if (typeof query === 'object') {
      const task = await this.prisma.task.findUnique({ where: { id: taskId } });
      if (task) {
        await this.checkTaskPermission(task, query);
      }
    }

    const comments = await this.prisma.taskComment.findMany({
      where: { taskId },
      orderBy: { createdAt: 'asc' },
      include: { author: true }
    });

    return {
      success: true,
      message: 'Lấy tin nhắn thành công',
      data: comments.map(c => ({
        id: c.id,
        taskId: c.taskId,
        authorCode: c.authorCode || '',
        authorName: c.author ? `${c.author.lastname} ${c.author.firstname}`.trim() : (c.isSystemMessage ? 'Hệ thống' : 'Quản trị viên'),
        authorAvatar: c.author?.avatar || '',
        content: c.content,
        isSystemMessage: c.isSystemMessage,
        createdAt: c.createdAt.toISOString()
      }))
    };
  }

  /**
   * Lấy chuỗi giao việc (delegation chain) đệ quy không giới hạn cấp.
   * Dùng BFS để duyệt toàn bộ cây: task cha → task hiện tại → con cấp 1 → con cấp 2 → ...
   * Mỗi node có field `level` để frontend xác định độ sâu và style phù hợp.
   */
  async getSubTasks(query: any) {
    const taskId = typeof query === 'object' ? query.taskId : query;

    const mapTask = (t: any, level: number, isParent = false, isCurrent = false) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assigneeCode: t.assigneeCode,
      assigneeName: t.assignee
        ? `${t.assignee.lastname} ${t.assignee.firstname}`.trim()
        : t.assigneeCode,
      assignerCode: t.assignerCode,
      assignerName: t.assigner
        ? `${t.assigner.lastname} ${t.assigner.firstname}`.trim()
        : (t.assignerCode || ''),
      departmentId: t.departmentId || 0,
      parentId: t.parentId || 0,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
      level,
      isParent,
      isCurrent,
      isChild: !isParent && !isCurrent,
      isGrandChild: false,
    });

    // Query 1: lấy task hiện tại + task cha
    const rootTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        assigner: true,
        parent: { include: { assignee: true, assigner: true } }
      }
    });

    if (!rootTask) {
      return { success: false, message: 'Task không tồn tại', data: [] };
    }

    if (typeof query === 'object') {
      await this.checkTaskPermission(rootTask, query);
    }

    const result: any[] = [];
    if (rootTask.parent) {
      result.push(mapTask(rootTask.parent, -1, true, false));
    }
    result.push(mapTask(rootTask, 0, false, true));

    // Query 2: lấy tất cả tasks cùng planId (nếu có) hoặc toàn bộ cây theo parentId
    // Build cây trên memory thay vì N+1 queries
    let allRelated: any[];
    if (rootTask.planId) {
      allRelated = await this.prisma.task.findMany({
        where: { planId: rootTask.planId, id: { not: taskId } },
        include: { assignee: true, assigner: true },
        orderBy: [{ parentId: 'asc' }, { createdAt: 'asc' }],
      });
    } else {
      // Không có planId: lấy trực tiếp con cấp 1 rồi mở rộng trong memory
      allRelated = await this.prisma.task.findMany({
        where: { parentId: taskId },
        include: { assignee: true, assigner: true },
        orderBy: { createdAt: 'asc' },
      });
    }

    // Build adjacency list for O(N) traversal
    const adjMap = new Map<number, any[]>();
    for (let i = 0; i < allRelated.length; i++) {
      const t = allRelated[i];
      const pid = t.parentId ?? taskId;
      if (!adjMap.has(pid)) adjMap.set(pid, []);
      adjMap.get(pid)!.push(t);
    }

    const ordered: { task: any; level: number }[] = [];
    const queue = [{ id: taskId, level: 0 }];

    // BFS queue processing
    let qIdx = 0;
    while (qIdx < queue.length) {
      const current = queue[qIdx++];
      const children = adjMap.get(current.id) || [];
      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        ordered.push({ task: child, level: current.level + 1 });
        queue.push({ id: child.id, level: current.level + 1 });
      }
    }

    for (const { task, level } of ordered) {
      result.push(mapTask(task, level, false, false));
    }

    return {
      success: true,
      message: 'Lấy chuỗi giao việc thành công',
      data: result,
    };
  }
}
