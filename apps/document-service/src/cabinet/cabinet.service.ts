import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class CabinetService {
  constructor(private readonly prisma: PrismaService) {}

  async listFiles(userId?: string, orgId?: string) {
    return this.prisma.documentCabinet.findMany({
      where: {
        OR: [
          userId ? { userId } : {},
          orgId ? { orgId } : {},
        ],
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async addFile(data: { userId?: string, orgId?: string, fileName: string, fileUrl: string, fileType: string, fileSize: number, tags?: string }) {
    return this.prisma.documentCabinet.create({
      data: {
        userId: data.userId,
        orgId: data.orgId,
        fileName: data.fileName,
        fileUrl: data.fileUrl,
        fileType: data.fileType,
        fileSize: data.fileSize,
        tags: data.tags || '[]',
      },
    });
  }

  async deleteFile(id: string) {
    return this.prisma.documentCabinet.delete({
      where: { id },
    });
  }
}
