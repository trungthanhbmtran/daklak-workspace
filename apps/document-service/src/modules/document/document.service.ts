import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class DocumentService {
  constructor(private prisma: PrismaService) { }

  async create(data: any) {
    console.log("[DocumentService] Creating document with data:", data);
    const document = await this.prisma.document.create({
      data: {
        documentNumber: data.documentNumber,
        notation: data.notation,
        abstract: data.abstract,
        content: data.content,
        typeId: data.typeId,
        fieldId: data.fieldId,
        issuingAuthorityId: data.issuingAuthorityId,
        issuerName: data.issuerName,
        signerId: data.signerId,
        signerName: data.signerName,
        signerPosition: data.signerPosition,
        issueDate: data.issueDate ? new Date(data.issueDate) : null,
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        arrivalNumber: data.arrivalNumber,
        processingDeadline: data.processingDeadline ? new Date(data.processingDeadline) : null,
        recipients: data.recipients,
        urgency: data.urgency || 'NORMAL',
        securityLevel: data.securityLevel || 'NORMAL',
        status: data.status || 'DRAFT',
        isPublic: !!data.isPublic,
        isIncoming: data.isIncoming !== undefined ? !!data.isIncoming : true,
        fileId: data.fileId,
        signatureValid: !!data.signatureValid,
        pageCount: Number(data.pageCount) || 1,
        attachmentCount: Number(data.attachmentCount) || 0,
        linkedDocumentId: data.linkedDocumentId,
        fiscalYear: data.fiscalYear ? Number(data.fiscalYear) : null,
        transparencyCategory: data.transparencyCategory,
      },
    });
    return { data: this.mapToProto(document) };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
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
    const updateData: any = {};
    const allowedFields = [
      'documentNumber', 'notation', 'abstract', 'content', 'typeId', 'fieldId',
      'issuingAuthorityId', 'issuerName', 'signerId', 'signerName', 'signerPosition',
      'arrivalNumber', 'recipients', 'urgency', 'securityLevel', 'status',
      'isPublic', 'isIncoming', 'fileId', 'signatureValid', 'pageCount',
      'attachmentCount', 'linkedDocumentId', 'fiscalYear', 'transparencyCategory'
    ];

    allowedFields.forEach(field => {
      if (data[field] !== undefined) {
        updateData[field] = data[field];
      }
    });

    if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
    if (data.arrivalDate) updateData.arrivalDate = new Date(data.arrivalDate);
    if (data.processingDeadline) updateData.processingDeadline = new Date(data.processingDeadline);

    const document = await this.prisma.document.update({
      where: { id },
      data: updateData,
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
          processingDeadline: { lt: now, not: null }
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
      id: doc.id,
      documentNumber: doc.documentNumber || "",
      notation: doc.notation || "",
      abstract: doc.abstract || "",
      content: doc.content || "",
      typeId: doc.typeId || "",
      fieldId: doc.fieldId || "",
      issuingAuthorityId: doc.issuingAuthorityId || "",
      issuerName: doc.issuerName || "",
      signerId: doc.signerId || "",
      signerName: doc.signerName || "",
      signerPosition: doc.signerPosition || "",
      issueDate: doc.issueDate?.toISOString() || "",
      arrivalDate: doc.arrivalDate?.toISOString() || "",
      arrivalNumber: doc.arrivalNumber || "",
      processingDeadline: doc.processingDeadline?.toISOString() || "",
      recipients: doc.recipients || "",
      urgency: doc.urgency || "NORMAL",
      securityLevel: doc.securityLevel || "NORMAL",
      status: doc.status || "DRAFT",
      isPublic: !!doc.isPublic,
      isIncoming: !!doc.isIncoming,
      fileId: doc.fileId || "",
      signatureValid: !!doc.signatureValid,
      pageCount: doc.pageCount || 1,
      attachmentCount: doc.attachmentCount || 0,
      linkedDocumentId: doc.linkedDocumentId || "",
      fiscalYear: doc.fiscalYear || 0,
      transparencyCategory: doc.transparencyCategory || "",
      createdAt: doc.createdAt?.toISOString() || "",
      updatedAt: doc.updatedAt?.toISOString() || "",
    };
  }

  async extractMetadata(fileId: string) {
    console.log("[DocumentService] Extracting metadata for file:", fileId);
    
    // In a real implementation, this would:
    // 1. Get the file URL from media-service
    // 2. Download the file
    // 3. Run OCR (Tesseract, Google Vision, etc.)
    // 4. Parse the text according to Decree 30/2020/ND-CP
    
    // For now, we simulate a high-quality extraction result following Decree 30 standards
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simulate processing
    
    return {
      documentNumber: "159",
      notation: "QĐ-SKHCN",
      abstract: "Quyết định về việc ban hành Quy chế quản lý và sử dụng tài sản công tại Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
      typeId: "QUYET_DINH", // This should match a real ID in production
      fieldId: "HANH_CHINH",
      issuerName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
      signerName: "Nguyễn Văn A",
      signerPosition: "Giám đốc Sở",
      issueDate: new Date().toISOString().split('T')[0],
      recipients: "UBND tỉnh; Sở Tài chính; Các phòng đơn vị; Lưu VT.",
      pageCount: 12,
      signatureValid: true
    };
  }
}
