import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class MasterPlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(query: any) {
    const where: any = {};
    if (query.type) where.type = query.type;
    if (query.status) where.status = query.status;

    const masterPlans = await this.prisma.masterPlan.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        tasks: true,
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
      include: { tasks: true }
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
        if (task.rankId && task.rankId > 0) {
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
}
