import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MasterPlansService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: any) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;
    if (query.departmentId) where.departmentId = query.departmentId;

    if (!query.isAdmin && query.currentUserCode) {
      const authConditions: any[] = [];
      
      // QUY TẮC 1: Kế hoạch thuộc đơn vị của user hoặc đơn vị CẤP TRÊN
      // (Giám đốc IOC thấy kế hoạch của Sở vì Sở là cấp trên của IOC)
      const ancestorIds: number[] = Array.isArray(query.callerAncestorUnitIds) 
        ? query.callerAncestorUnitIds.map(Number).filter(Boolean)
        : (query.currentUserDept ? [query.currentUserDept] : []);

      if (ancestorIds.length > 0) {
        authConditions.push({ departmentId: { in: ancestorIds } });
      }

      // QUY TẮC 2: User là người được giao hoặc người giao của bất kỳ task nào trong kế hoạch
      // (Trưởng phòng thấy kế hoạch vì là assignee/assigner của task)
      authConditions.push({
        tasks: {
          some: {
            OR: [
              { assigneeCode: query.currentUserCode },
              { assignerCode: query.currentUserCode },
            ]
          }
        }
      });

      where.AND = [{ OR: authConditions }];
    }

    const masterPlans = await this.prisma.masterPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: {
          include: { assignee: true }
        },
      }
    });

    return {
      success: true,
      message: 'Lấy danh sách Kế hoạch thành công',
      data: masterPlans.map(mp => ({
        ...mp,
        startDate: mp.startDate?.toISOString() || '',
        endDate: mp.endDate?.toISOString() || '',
        createdAt: mp.createdAt?.toISOString() || '',
        updatedAt: mp.updatedAt?.toISOString() || '',
        totalTasks: mp.tasks.length,
        completedTasks: mp.tasks.filter(t => t.status === 'DONE').length,
        tasks: mp.tasks.map((t: any) => ({
          ...t,
          assigneeName: t.assignee ? `${t.assignee.firstname} ${t.assignee.lastname}` : t.assigneeCode,
          dueDate: t.dueDate?.toISOString() || '',
          completionDate: t.completionDate?.toISOString() || '',
          createdAt: t.createdAt?.toISOString() || '',
          updatedAt: t.updatedAt?.toISOString() || '',
        })),
      })),
      meta: {
        pagination: {
          total: masterPlans.length,
          page: 1,
          pageSize: masterPlans.length,
          totalPages: 1,
          hasNext: false,
          hasPrev: false
        }
      }
    };
  }

  async findById(id: number) {
    const mp = await this.prisma.masterPlan.findUnique({
      where: { id },
      include: {
        tasks: {
          include: { assignee: true }
        }
      }
    });
    if (!mp) return null;
    return {
      ...mp,
      startDate: mp.startDate?.toISOString() || '',
      endDate: mp.endDate?.toISOString() || '',
      createdAt: mp.createdAt?.toISOString() || '',
      updatedAt: mp.updatedAt?.toISOString() || '',
      totalTasks: mp.tasks.length,
      completedTasks: mp.tasks.filter(t => t.status === 'DONE').length,
      tasks: mp.tasks.map((t: any) => ({
        ...t,
        assigneeName: t.assignee ? `${t.assignee.firstname} ${t.assignee.lastname}` : t.assigneeCode,
        dueDate: t.dueDate?.toISOString() || '',
        completionDate: t.completionDate?.toISOString() || '',
        createdAt: t.createdAt?.toISOString() || '',
        updatedAt: t.updatedAt?.toISOString() || '',
      })),
    };
  }

  async create(data: any) {
    console.log("MasterPlansService.create received data:", JSON.stringify(data, null, 2));
    const mp = await this.prisma.masterPlan.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        documentId: data.documentId,
        departmentId: data.departmentId,
        createdByCode: data.createdByCode,
      }
    });

    if (data.tasks && data.tasks.length > 0) {
      const taskData: any[] = [];

      let systemUser = await this.prisma.employee.findUnique({ where: { employeeCode: 'UNASSIGNED' } });
      if (!systemUser) {
        systemUser = await this.prisma.employee.create({
          data: {
            employeeCode: 'UNASSIGNED',
            firstname: 'Hệ',
            lastname: 'Thống',
            email: 'unassigned@system.local',
            status: 'inactive',
            departmentId: 0,
            jobTitleId: 0,
            startDate: new Date()
          }
        });
      }

      for (const task of data.tasks) {
        taskData.push({
          title: task.title,
          description: task.description,
          assigneeCode: 'UNASSIGNED',
          assignerCode: 'UNASSIGNED',
          status: 'TEMPLATE',
          priority: 'MEDIUM',
          weight: task.weight,
          baseScore: task.targetValue,
          planId: mp.id,
        });
      }

      if (taskData.length > 0) {
        await this.prisma.task.createMany({ data: taskData });
      }
    }

    return this.findById(mp.id);
  }

  async update(id: number, data: any) {
    const updateData: any = {};
    if (data.title) updateData.title = data.title;
    if (data.description) updateData.description = data.description;
    if (data.type) updateData.type = data.type;
    if (data.status) updateData.status = data.status;
    if (data.startDate) updateData.startDate = new Date(data.startDate);
    if (data.endDate) updateData.endDate = new Date(data.endDate);
    if (data.documentId) updateData.documentId = data.documentId;

    await this.prisma.masterPlan.update({
      where: { id },
      data: updateData,
    });
    return this.findById(id);
  }

  async delete(id: number) {
    await this.prisma.masterPlan.delete({ where: { id } });
    return { success: true, message: 'Deleted successfully' };
  }

  async getHistoricalFeasibility(query: any) {
    // Tiêu chí: cùng một công việc (dựa vào title hoặc type), cùng thời gian yêu cầu (duration), thời gian gần nhất
    const { title, type, durationDays } = query;

    let whereClause: any = {
      status: 'COMPLETED' // Chỉ tính các kế hoạch đã xong để lấy dữ liệu thực tế
    };

    if (type) whereClause.type = type;
    if (title) whereClause.title = { contains: title };

    // Tìm các kế hoạch thoả mãn
    const pastPlans = await this.prisma.masterPlan.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' }, // Thời gian gần nhất
      take: 5, // Lấy 5 kế hoạch gần nhất để phân tích
      include: {
        tasks: true
      }
    });

    let totalTasks = 0;
    let completedTasks = 0;
    let overdueTasks = 0;

    // Lọc thêm theo duration nếu cần (hoặc AI tự phân tích)
    // Tính toán số liệu thống kê
    pastPlans.forEach(plan => {
      totalTasks += plan.tasks.length;
      plan.tasks.forEach(t => {
        if (t.status === 'DONE') completedTasks++;
        if (t.status === 'OVERDUE') overdueTasks++;
      });
    });

    const feasibilityScore = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

    return {
      success: true,
      data: {
        pastPlansCount: pastPlans.length,
        totalTasks,
        completedTasks,
        overdueTasks,
        feasibilityScore: Math.round(feasibilityScore),
        historicalContext: pastPlans.map(p => ({
          title: p.title,
          total: p.tasks.length,
          done: p.tasks.filter(t => t.status === 'DONE').length
        }))
      }
    };
  }
}
