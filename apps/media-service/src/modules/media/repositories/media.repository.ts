import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../infrastructure/prisma/prisma.service';
import { Media, Prisma } from '@prisma/client';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  async create(data: Prisma.MediaCreateInput): Promise<Media> {
    return this.prisma.media.create({ data });
  }

  async findById(id: string): Promise<Media | null> {
    return this.prisma.media.findUnique({ where: { id } });
  }

  async findByFileName(fileName: string): Promise<Media | null> {
    return this.prisma.media.findUnique({ where: { fileName } });
  }

  async update(id: string, data: Prisma.MediaUpdateInput): Promise<Media> {
    return this.prisma.media.update({
      where: { id },
      data,
    });
  }

  async updateStatus(id: string, status: 'PENDING' | 'COMPLETED' | 'FAILED'): Promise<Media> {
    return this.prisma.media.update({
      where: { id },
      data: { status },
    });
  }

  async delete(id: string): Promise<Media> {
    return this.prisma.media.delete({ where: { id } });
  }
}
