import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';

@Injectable()
export class TasksService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.task.findMany({
      include: {
        assignee: true,
        assigner: true,
      },
    });
  }

  async findByAssignee(assigneeId: number) {
    return this.prisma.task.findMany({
      where: { assigneeId },
      include: {
        assignee: true,
        assigner: true,
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    assigneeId: number;
    assignerId: number;
    dueDate?: Date;
  }) {
    return this.prisma.task.create({
      data,
    });
  }

  async updateStatus(id: number, status: string) {
    return this.prisma.task.update({
      where: { id },
      data: { status },
    });
  }
}
