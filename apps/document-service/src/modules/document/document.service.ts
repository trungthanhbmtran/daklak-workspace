import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    console.log("data", data);
    const document = await this.prisma.document.create({
      data: {
        ...data,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        processingDeadline: data.processingDeadline ? new Date(data.processingDeadline) : null,
      },
      include: {
        type: true,
        field: true,
      },
    });
    return { data: this.mapToProto(document) };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
      include: {
        type: true,
        field: true,
      },
    });
    return this.mapToProto(document);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, typeId, fieldId, status, urgency, startDate, endDate } = query;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (search) {
      where.OR = [
        { documentNumber: { contains: search } },
        { arrivalNumber: { contains: search } },
        { abstract: { contains: search } },
        { issuerName: { contains: search } },
      ];
    }
    if (typeId) where.typeId = typeId;
    if (fieldId) where.fieldId = fieldId;
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.fiscalYear) where.fiscalYear = parseInt(query.fiscalYear.toString());
    if (query.transparencyCategory) where.transparencyCategory = query.transparencyCategory;
    if (query.isIncoming !== undefined) {
      where.isIncoming = query.isIncoming;
    }

    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }

    const [items, total] = await Promise.all([
      this.prisma.document.findMany({
        where,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          type: true,
          field: true,
        },
      }),
      this.prisma.document.count({ where }),
    ]);

    return {
      data: items.map(item => this.mapToProto(item)),
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

  async update(id: string, data: any) {
    const updateData = { ...data };
    delete updateData.id;
    if (updateData.issueDate) updateData.issueDate = new Date(updateData.issueDate);
    if (updateData.arrivalDate) updateData.arrivalDate = new Date(updateData.arrivalDate);
    if (updateData.processingDeadline) updateData.processingDeadline = new Date(updateData.processingDeadline);

    const document = await this.prisma.document.update({
      where: { id },
      data: updateData,
      include: {
        type: true,
        field: true,
      },
    });
    return { data: this.mapToProto(document) };
  }

  async remove(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }

  async getStatistics() {
    const now = new Date();
    const [
      incomingTotal,
      incomingPending,
      incomingLate,
      outgoingTotal,
      urgentTotal
    ] = await Promise.all([
      // incomingTotal: Documents with isIncoming: true
      this.prisma.document.count({ where: { isIncoming: true } }),
      // incomingPending: Documents with isIncoming: true and status PROCESSING
      this.prisma.document.count({ where: { isIncoming: true, status: 'PROCESSING' } }),
      // incomingLate: Documents with isIncoming: true, status PROCESSING and deadline < now
      this.prisma.document.count({
        where: {
          isIncoming: true,
          status: 'PROCESSING',
          processingDeadline: { lt: now }
        }
      }),
      // outgoingTotal: Documents with isIncoming: false
      this.prisma.document.count({ where: { isIncoming: false } }),
      // urgentTotal: Urgency is URGENT or FLASH
      this.prisma.document.count({
        where: {
          urgency: { in: ['URGENT', 'FLASH'] },
          status: 'PROCESSING'
        }
      }),
    ]);

    return {
      incomingTotal,
      incomingPending,
      incomingLate,
      outgoingTotal,
      urgentTotal
    };
  }

  private mapToProto(doc: any) {
    if (!doc) return null;
    return {
      ...doc,
      issueDate: doc.issueDate?.toISOString(),
      arrivalDate: doc.arrivalDate?.toISOString(),
      processingDeadline: doc.processingDeadline?.toISOString(),
      createdAt: doc.createdAt.toISOString(),
      updatedAt: doc.updatedAt.toISOString(),
    };
  }
}
