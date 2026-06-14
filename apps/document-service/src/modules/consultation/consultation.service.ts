import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class ConsultationService {
  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) { }

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
        _count: {
          select: { responses: true }
        },
        responses: {
          where: { status: 'RESPONDED' },
          select: { id: true }
        }
      },
    });
    if (!consultation) return null;
    return {
      ...this.mapToProto(consultation),
      totalResponses: consultation.responses.length,
      totalUnits: consultation._count.responses,
    };
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

    // Optimized via ID-Indexed Deferred Join
    const [idsResult, total] = await Promise.all([
      this.prisma.consultation.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        select: { id: true },
      }),
      this.prisma.consultation.count({ where }),
    ]);

    const ids = idsResult.map((item) => item.id);
    const items = ids.length > 0
      ? await this.prisma.consultation.findMany({
          where: { id: { in: ids } },
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
        })
      : [];

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
    await this.workflowService.submitConsultationResponse(data.consultationId, data.unitId, data.content, data.fileId);
    return { success: true };
  }

  async listResponses(consultationId: string) {
    const responses = await this.prisma.consultationResponse.findMany({
      where: { consultationId },
      orderBy: { respondedAt: 'desc' },
    });
    return { data: responses.map(r => this.mapResponseToProto(r)) };
  }

  private mapResponseToProto(r: any) {
    return {
      id: r.id,
      consultationId: r.consultationId,
      unitId: r.unitId,
      unitName: r.unitName ?? "",
      userId: r.userId ?? "",
      content: r.content ?? "",
      fileId: r.fileId ?? "",
      status: r.status,
      respondedAt: r.respondedAt?.toISOString() || "",
    };
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

    return {
      data: comments.map(c => ({
        ...this.mapPublicCommentToProto(c),
        draftTitle: c.consultation?.title || "N/A"
      }))
    };
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
      id: c.id,
      consultationId: c.consultationId,
      fullName: c.fullName,
      email: c.email ?? "",
      phoneNumber: c.phoneNumber ?? "",
      content: c.content,
      status: c.status,
      moderatedBy: c.moderatedBy ?? "",
      moderatedAt: c.moderatedAt?.toISOString() || "",
      createdAt: c.createdAt.toISOString(),
    };
  }

  private mapToProto(item: any) {
    if (!item) return null;
    return {
      id: item.id,
      title: item.title,
      description: item.description ?? "",
      documentId: item.documentId ?? "",
      deadline: item.deadline.toISOString(),
      status: item.status,
      issuerId: item.issuerId ?? "",
      issuerName: item.issuerName ?? "",
      isUrgent: !!item.isUrgent,
      createdAt: item.createdAt.toISOString(),
      updatedAt: item.updatedAt.toISOString(),
    };
  }
}
