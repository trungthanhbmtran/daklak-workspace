import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MasterPlansService {
  constructor(private prisma: PrismaService) { }

  async findAll(query: any) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

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
    const mp = await this.prisma.masterPlan.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        startDate: data.startDate ? new Date(data.startDate) : null,
        endDate: data.endDate ? new Date(data.endDate) : null,
        documentId: data.documentId,
      }
    });

    if (data.tasks && data.tasks.length > 0) {
      const taskData: any[] = [];
      for (const task of data.tasks) {
        let employees: any[] = [];
        if (task.rankCode) {
          const ranks: any[] = await this.prisma.$queryRaw`SELECT id FROM admin_systems.job_titles WHERE code = ${task.rankCode}`;
          if (ranks.length > 0) {
            employees = await this.prisma.employee.findMany({
              where: { civilServantRankId: ranks[0].id, status: 'active' }
            });
          }
        } else if (task.rankId && task.rankId > 0) {
          employees = await this.prisma.employee.findMany({
            where: { civilServantRankId: task.rankId, status: 'active' }
          });
        } else {
          employees = await this.prisma.employee.findMany({
            where: { status: 'active' }
          });
        }

        for (const emp of employees) {
          taskData.push({
            title: task.title,
            description: task.description,
            assigneeCode: emp.employeeCode,
            assignerCode: emp.employeeCode,
            status: 'TODO',
            priority: 'MEDIUM',
            weight: task.weight,
            baseScore: task.targetValue,
            planId: mp.id,
          });
        }
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
