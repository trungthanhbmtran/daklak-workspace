import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { Prisma } from '@generated/prisma/client';

@Injectable()
export class PlansService {
  constructor(private prisma: PrismaService) {}

  async findAll(params: { type?: string; status?: string }) {
    const where: Prisma.MasterPlanWhereInput = {};
    if (params.type) where.type = params.type;
    if (params.status) where.status = params.status;

    const plans = await this.prisma.masterPlan.findMany({
      where,
      include: {
        _count: {
          select: { tasks: true }
        },
        tasks: {
          select: { status: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return plans.map(plan => ({
      ...plan,
      totalTasks: plan._count.tasks,
      completedTasks: plan.tasks.filter(t => t.status === 'DONE').length
    }));
  }

  async findById(id: number) {
    const plan = await this.prisma.masterPlan.findUnique({
      where: { id },
      include: {
        _count: {
          select: { tasks: true }
        },
        tasks: {
          select: { status: true }
        }
      }
    });

    if (!plan) throw new NotFoundException('Master Plan not found');

    return {
      ...plan,
      totalTasks: plan._count.tasks,
      completedTasks: plan.tasks.filter(t => t.status === 'DONE').length
    };
  }

  async create(data: {
    title: string;
    description?: string;
    type?: string;
    startDate?: string;
    endDate?: string;
    documentId?: string;
  }) {
    return this.prisma.masterPlan.create({
      data: {
        title: data.title,
        description: data.description,
        type: data.type || 'SMART_GOAL',
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        documentId: data.documentId,
        status: 'ACTIVE'
      }
    });
  }

  async update(id: number, data: {
    title?: string;
    description?: string;
    type?: string;
    status?: string;
    startDate?: string;
    endDate?: string;
    documentId?: string;
  }) {
    return this.prisma.masterPlan.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description,
        type: data.type,
        status: data.status,
        startDate: data.startDate ? new Date(data.startDate) : undefined,
        endDate: data.endDate ? new Date(data.endDate) : undefined,
        documentId: data.documentId
      }
    });
  }

  async remove(id: number) {
    await this.prisma.masterPlan.delete({
      where: { id }
    });
    return { success: true, message: 'Deleted successfully' };
  }
}
