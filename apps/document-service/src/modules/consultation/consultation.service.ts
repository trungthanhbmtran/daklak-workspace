import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class ConsultationService {
  constructor(private prisma: PrismaService) {}

  async create(data: any) {
    const { targetUnitIds, ...rest } = data;
    const consultation = await this.prisma.consultation.create({
      data: {
        ...rest,
        deadline: new Date(data.deadline),
        responses: {
          create: targetUnitIds.map((unitId: string) => ({
            unitId,
            status: 'PENDING',
          })),
        },
      },
      include: {
        responses: true,
      },
    });
    return { data: this.mapToProto(consultation) };
  }

  async findOne(id: string) {
    const consultation = await this.prisma.consultation.findUnique({
      where: { id },
      include: {
        responses: true,
      },
    });
    return this.mapToProto(consultation);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, status } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { title: { contains: search } },
        { description: { contains: search } },
      ];
    }
    if (status) where.status = status;

    const [items, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { responses: true }
          },
          responses: {
            where: { status: 'RESPONDED' },
            select: { id: true }
          }
        },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    return {
      data: items.map(item => ({
        ...this.mapToProto(item),
        totalResponses: item.responses.length,
        totalUnits: item._count.responses,
      })),
      meta: {
        pagination: {
          total,
          page,
          pageSize: limit,
          totalPages: Math.ceil(total / limit),
        },
      },
    };
  }

  async submitResponse(data: { consultationId: string, unitId: string, content: string, fileId?: string }) {
    const response = await this.prisma.consultationResponse.updateMany({
      where: {
        consultationId: data.consultationId,
        unitId: data.unitId,
      },
      data: {
        content: data.content,
        fileId: data.fileId,
        status: 'RESPONDED',
        respondedAt: new Date(),
      },
    });
    return { success: true };
  }

  // Public Comments Logic
  async submitPublicComment(data: any) {
    const comment = await this.prisma.publicComment.create({
      data: {
        consultationId: data.consultationId,
        fullName: data.fullName,
        email: data.email,
        phoneNumber: data.phoneNumber,
        content: data.content,
        status: 'PENDING'
      }
    });
    return this.mapPublicCommentToProto(comment);
  }

  async listPublicComments(query: { consultationId?: string, status?: string }) {
    const where: any = {};
    if (query.consultationId) where.consultationId = query.consultationId;
    if (query.status && query.status !== 'ALL') where.status = query.status;

    const comments = await this.prisma.publicComment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { consultation: { select: { title: true } } }
    });

    return { data: comments.map(c => ({
      ...this.mapPublicCommentToProto(c),
      draftTitle: c.consultation?.title || "N/A"
    })) };
  }

  async moderateComment(data: { id: string, status: string, userId: string }) {
    const comment = await this.prisma.publicComment.update({
      where: { id: data.id },
      data: {
        status: data.status,
        moderatedBy: data.userId,
        moderatedAt: new Date()
      }
    });
    return this.mapPublicCommentToProto(comment);
  }

  private mapPublicCommentToProto(c: any) {
    return {
      ...c,
      moderatedAt: c.moderatedAt?.toISOString() || "",
      createdAt: c.createdAt.toISOString(),
    };
  }

  private mapToProto(item: any) {
    if (!item) return null;
    return {
      ...item,
      deadline: item.deadline.toISOString(),
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
