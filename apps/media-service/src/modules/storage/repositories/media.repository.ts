import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../../database/prisma.service';
import { Media, MediaStatus, Prisma } from '@prisma/client';

@Injectable()
export class MediaRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * Create a new media record.
   */
  async create(data: Prisma.MediaCreateInput): Promise<Media> {
    return this.prisma.media.create({
      data,
    });
  }

  /**
   * Find media by its ID.
   */
  async findById(id: string): Promise<Media | null> {
    return this.prisma.media.findUnique({
      where: { id },
    });
  }

  /**
   * Update media status.
   */
  async updateStatus(id: string, status: MediaStatus): Promise<Media> {
    return this.prisma.media.update({
      where: { id },
      data: { status },
      select: {
        id: true,
        fileName: true,
        bucket: true,
        mimeType: true,
        status: true,
      },
    }) as any; // prisma select returns partial, but we cast for simplicity in this case or use a specific interface
  }

  /**
   * Find a specific media record by its file name (key).
   */
  async findByFileName(fileName: string): Promise<Media | null> {
    return this.prisma.media.findUnique({
      where: { fileName },
    });
  }
}
