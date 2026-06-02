import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) { }

  private async getTaskStats(query: any) {
    const statsWhere: any = query.assigneeCode ? { assigneeCode: query.assigneeCode } : {};

    if (!query.isAdmin && query.currentUserCode) {
      const authConditions: any[] = [
        { assigneeCode: query.currentUserCode },
        { assignerCode: query.currentUserCode },
        { supervisorCode: query.currentUserCode },
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

    const [overdueCount, dueIn3DaysCount, dueIn7DaysCount, dueOver7DaysCount] = await Promise.all([
      this.prisma.task.count({
        where: {
          ...baseWhere,
          OR: [
            { status: 'OVERDUE' },
            { dueDate: { lt: now } }
          ]
        }
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ['DONE', 'ARCHIVED', 'OVERDUE', 'TEMPLATE'] },
          dueDate: { gte: now, lte: in3Days }
        }
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ['DONE', 'ARCHIVED', 'OVERDUE', 'TEMPLATE'] },
          dueDate: { gt: in3Days, lte: in7Days }
        }
      }),
      this.prisma.task.count({
        where: {
          ...baseWhere,
          status: { notIn: ['DONE', 'ARCHIVED', 'OVERDUE', 'TEMPLATE'] },
          OR: [
            { dueDate: { gt: in7Days } },
            { dueDate: null }
          ]
        }
      })
    ]);

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

    // Nếu đã chỉ định assignerCode cụ thể (tab ASSIGNED_BY_ME), bỏ qua auth filter
    // để người giao việc thấy TẤT CẢ task họ đã giao (kể cả giao cho người khác phòng)
    if (!query.assignerCode && !query.isAdmin && query.currentUserCode) {
      const authConditions: any[] = [
        { assigneeCode: query.currentUserCode },
        { assignerCode: query.currentUserCode },
        { supervisorCode: query.currentUserCode },
      ];
      if (query.currentUserDept) {
        authConditions.push({ departmentId: query.currentUserDept });
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
          ? `${t.assignee.firstname} ${t.assignee.lastname}`.trim()
          : (t.assigneeCode === 'UNASSIGNED' ? 'Chưa phân công' : t.assigneeCode),
        assignerName: t.assigner
          ? `${t.assigner.firstname} ${t.assigner.lastname}`.trim()
          : (t.assignerCode || ''),
        supervisorName: t.supervisor
          ? `${t.supervisor.firstname} ${t.supervisor.lastname}`.trim()
          : (t.supervisorCode || ''),
        dueDate: t.dueDate?.toISOString() || '',
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
        plan: t.plan || null,
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

  async createTask(data: any) {
    const t = await this.prisma.task.create({
      data: {
        title: data.title || data.taskName || 'Nhiệm vụ không tên',
        description: data.description,
        assigneeCode: data.assigneeCode || '',
        assignerCode: data.assignerCode || '',
        departmentId: data.departmentId || null,
        status: 'TODO',
        priority: data.priority || 'MEDIUM',
        startDate: data.startDate ? new Date(data.startDate) : null,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        baseScore: data.baseScore,
        weight: data.weight,
        scoringMethod: data.scoringMethod || 'MANUAL',
        bonusPerDay: data.bonusPerDay,
        penaltyPerDay: data.penaltyPerDay,
        supervisorCode: data.supervisorCode,
        planId: data.planId,
        parentId: data.parentId || null,
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
      data: dataToUpdate
    });

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

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
    };
  }

  async recommendAssignees(query: { rankCode: string, strategy: string }) {
    const { rankCode, strategy } = query;
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

    const recommendations = employees.map((emp: any) => {
      const currentLoad = emp.tasksReceived.reduce((sum: number, t: any) => sum + (t.weight || 10), 0);

      let performanceScore = 50; // default
      if (emp.kpiEvaluations && emp.kpiEvaluations.length > 0) {
        const total = emp.kpiEvaluations.reduce((sum: number, e: any) => sum + (e.totalScore || 0), 0);
        performanceScore = total / emp.kpiEvaluations.length;
      } else {
        // Fallback mock if no evaluations yet
        performanceScore = 60 + Math.random() * 30;
      }

      // Match Score Calculation
      // We want to prioritize LOW load. 
      // If HIGH_PERFORMANCE -> prioritize HIGH performanceScore
      // If LOW_PERFORMANCE -> prioritize LOW performanceScore (to give them a chance to improve)

      let loadFactor = Math.max(0, 100 - currentLoad); // Less load = higher factor
      let perfFactor = performanceScore;
      if (strategy === 'LOW_PERFORMANCE') {
        perfFactor = 100 - performanceScore;
      } else if (strategy === 'UNDER_QUOTA') {
        // Hạn mức quy định tạm tính là 40 điểm
        if (currentLoad < 40) {
          loadFactor = 100; // Tối đa điểm cho người chưa đủ hạn mức
        } else {
          loadFactor = 0; // Không ưu tiên người đã đủ hoặc vượt hạn mức
        }
      }

      const matchScore = (loadFactor * 0.6) + (perfFactor * 0.4);

      return {
        employeeCode: emp.employeeCode,
        employeeName: `${emp.firstname} ${emp.lastname}`,
        departmentId: emp.departmentId,
        currentLoad,
        performanceScore,
        matchScore
      };
    });

    // Sort by matchScore DESC
    recommendations.sort((a, b) => b.matchScore - a.matchScore);

    // Group by department
    const deptMap = new Map<number, any>();
    recommendations.forEach(emp => {
      if (!emp.departmentId) return;
      if (!deptMap.has(emp.departmentId)) {
        deptMap.set(emp.departmentId, {
          departmentId: emp.departmentId,
          totalLoad: 0,
          totalPerf: 0,
          totalMatch: 0,
          count: 0
        });
      }
      const d = deptMap.get(emp.departmentId);
      d.totalLoad += emp.currentLoad;
      d.totalPerf += emp.performanceScore;
      d.totalMatch += emp.matchScore;
      d.count += 1;
    });

    const topDepartments = Array.from(deptMap.values()).map(d => ({
      departmentId: d.departmentId,
      currentLoad: d.totalLoad / d.count,
      performanceScore: d.totalPerf / d.count,
      matchScore: d.totalMatch / d.count,
      employeeCount: d.count
    })).sort((a, b) => b.matchScore - a.matchScore);

    return {
      success: true,
      message: 'Gợi ý nhân sự và phòng ban thành công',
      data: {
        topEmployees: recommendations.slice(0, 5),
        topDepartments: topDepartments.slice(0, 3)
      }
    };
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

  async assignTask(id: number, assigneeCode: string, departmentId?: number, assignerCode?: string) {
    // Lấy task hiện tại để kiểm tra status và supervisorCode
    const currentTask = await this.prisma.task.findUnique({
      where: { id },
      select: { status: true, supervisorCode: true }
    });

    const dataToUpdate: any = {};
    if (assigneeCode !== undefined) dataToUpdate.assigneeCode = assigneeCode;
    if (departmentId !== undefined) dataToUpdate.departmentId = departmentId;

    // Ghi đè lại người giao việc nếu được truyền từ Gateway
    if (assignerCode) {
      // Kiểm tra xem assignerCode có phải là employee code hợp lệ không (tránh FK violation)
      // assignerCode có thể là username (không phải employee) nếu user chưa có employee record
      const assignerEmployee = await this.prisma.employee.findUnique({
        where: { employeeCode: assignerCode },
        select: { employeeCode: true }
      });

      if (assignerEmployee) {
        dataToUpdate.assignerCode = assignerCode;
        // Chỉ set supervisorCode nếu assignerCode là employee hợp lệ VÀ task chưa có supervisor
        if (!currentTask?.supervisorCode || currentTask.supervisorCode === 'UNASSIGNED') {
          dataToUpdate.supervisorCode = assignerCode;
        }
      }
    }

    // Nếu task đang là TEMPLATE (tạo từ master-plans), chuyển sang TODO khi được giao
    if (currentTask?.status === 'TEMPLATE') {
      dataToUpdate.status = 'TODO';
    }

    const t = await this.prisma.task.update({
      where: { id },
      data: dataToUpdate
    });

    return {
      ...t,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || ''
    };
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
      authorName: c.author ? `${c.author.firstname} ${c.author.lastname}` : (c.isSystemMessage ? 'Hệ thống' : 'Quản trị viên'),
      authorAvatar: c.author?.avatar || '',
      content: c.content,
      isSystemMessage: c.isSystemMessage,
      createdAt: c.createdAt.toISOString()
    };
  }

  async getComments(taskId: number) {
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
        authorName: c.author ? `${c.author.firstname} ${c.author.lastname}` : (c.isSystemMessage ? 'Hệ thống' : 'Quản trị viên'),
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
  async getSubTasks(taskId: number) {
    const mapTask = (t: any, level: number, isParent = false, isCurrent = false) => ({
      id: t.id,
      title: t.title,
      status: t.status,
      priority: t.priority,
      assigneeCode: t.assigneeCode,
      assigneeName: t.assignee
        ? `${t.assignee.firstname} ${t.assignee.lastname}`.trim()
        : t.assigneeCode,
      assignerCode: t.assignerCode,
      assignerName: t.assigner
        ? `${t.assigner.firstname} ${t.assigner.lastname}`.trim()
        : (t.assignerCode || ''),
      departmentId: t.departmentId || 0,
      parentId: t.parentId || 0,
      dueDate: t.dueDate?.toISOString() || '',
      createdAt: t.createdAt?.toISOString() || '',
      updatedAt: t.updatedAt?.toISOString() || '',
      level,       // -1 = task cha gốc, 0 = task hiện tại, 1,2,3... = các cấp con
      isParent,
      isCurrent,
      isChild: !isParent && !isCurrent,
      isGrandChild: false, // không dùng nữa, giữ để tương thích proto
    });

    // Lấy task gốc kèm task cha (nếu có)
    const rootTask = await this.prisma.task.findUnique({
      where: { id: taskId },
      include: {
        assignee: true,
        assigner: true,
        parent: {
          include: { assignee: true, assigner: true }
        }
      }
    });

    if (!rootTask) {
      return { success: false, message: 'Task không tồn tại', data: [] };
    }

    const result: any[] = [];

    // Thêm task cha vào đầu timeline (nếu có)
    if (rootTask.parent) {
      result.push(mapTask(rootTask.parent, -1, true, false));
    }

    // Task hiện tại (level 0)
    result.push(mapTask(rootTask, 0, false, true));

    // BFS: duyệt toàn bộ cây con không giới hạn độ sâu
    const queue: Array<{ id: number; level: number }> = [{ id: taskId, level: 0 }];

    while (queue.length > 0) {
      const { id, level } = queue.shift()!;

      const children = await this.prisma.task.findMany({
        where: { parentId: id },
        include: { assignee: true, assigner: true },
        orderBy: { createdAt: 'asc' }
      });

      for (const child of children) {
        result.push(mapTask(child, level + 1, false, false));
        // Tiếp tục duyệt xuống các cấp sâu hơn
        queue.push({ id: child.id, level: level + 1 });
      }
    }

    return {
      success: true,
      message: 'Lấy chuỗi giao việc thành công',
      data: result,
    };
  }
}
