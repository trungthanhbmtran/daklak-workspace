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

  async findByAssignee(assigneeCode: string) {
    return this.prisma.task.findMany({
      where: { assigneeCode },
      include: {
        assignee: true,
        assigner: true,
      },
    });
  }

  async create(data: {
    title: string;
    description?: string;
    assigneeCode: string;
    assignerCode: string;
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
