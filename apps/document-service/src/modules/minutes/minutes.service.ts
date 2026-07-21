import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';


@Injectable()
export class MinutesService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const minutes = await this.prisma.minutes.create({
      data: {
        ...data,
        startTime: data.startTime ? new Date(data.startTime) : new Date(),
        endTime: data.endTime ? new Date(data.endTime) : null,
      },
    });
    return { data: this.mapToProto(minutes) };
  }

  async findOne(id: string) {
    const minutes = await this.prisma.minutes.findUnique({
      where: { id },
    });
    return this.mapToProto(minutes);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { content: { contains: search } },
        { location: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [total, items] = await Promise.all([
      this.prisma.minutes.count({ where }),
      this.prisma.minutes.findMany({
        where,
        orderBy: { startTime: 'desc' },
        skip,
        take: limit,
      })
    ]);

    return {
      data: items.map(item => this.mapToProto(item)),
      meta: {
        total, skip, take: limit
      },
    };
  }

  async update(id: string, data: any) {
    const updateData = { ...data };
    delete updateData.id;
    if (updateData.startTime) updateData.startTime = new Date(updateData.startTime);
    if (updateData.endTime) updateData.endTime = new Date(updateData.endTime);

    const minutes = await this.prisma.minutes.update({
      where: { id },
      data: updateData,
    });
    return { data: this.mapToProto(minutes) };
  }

  async remove(id: string) {
    await this.prisma.minutes.delete({ where: { id } });
    return { success: true };
  }

  private mapToProto(item: any) {
    if (!item) return null;
    return {
      ...item,
      startTime: item.startTime?.toISOString(),
      endTime: item.endTime?.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
