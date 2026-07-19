import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';


@Injectable()
export class DocumentService {
  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) { }

  async create(data: any) {
    console.log("[DocumentService] Creating document with data:", data);
    const document = await this.prisma.document.create({
      data: {
        documentNumber: data.documentNumber || `SN-${Date.now()}`,
        notation: data.notation || "VP",
        abstract: data.abstract || "Văn bản không có trích yếu",
        content: data.content || "",
        typeId: data.typeId || "CONG_VAN",
        fieldId: data.fieldId || "HANH_CHINH",
        issuingAuthorityId: data.issuingAuthorityId || "",
        issuerName: data.issuerName || "Sở Khoa học và Công nghệ",
        signerId: data.signerId || "",
        signerName: data.signerName || "",
        signerPosition: data.signerPosition || "",
        issueDate: data.issueDate ? new Date(data.issueDate) : new Date(),
        arrivalDate: data.arrivalDate ? new Date(data.arrivalDate) : null,
        arrivalNumber: data.arrivalNumber || "",
        processingDeadline: data.processingDeadline ? new Date(data.processingDeadline) : null,
        recipients: data.recipients || "",
        urgency: data.urgency || "NORMAL",
        securityLevel: data.securityLevel || "NORMAL",
        status: data.status || "PROCESSING",
        isPublic: !!data.isPublic,
        isIncoming: data.isIncoming !== undefined ? !!data.isIncoming : true,
        fileId: data.fileId || "",
        signatureValid: !!data.signatureValid,
        pageCount: Number(data.pageCount) || 1,
        attachmentCount: Number(data.attachmentCount) || 0,
        linkedDocumentId: data.linkedDocumentId || null,
        fiscalYear: data.fiscalYear || new Date().getFullYear(),
        transparencyCategory: data.transparencyCategory || "NONE",
      },
    });

    await this.workflowService.receiveDocument(document.id, data.userId, data.userName);

    return { data: this.mapToProto(document) };
  }

  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({
      where: { id },
    });
    if (!document) {
      throw new Error(`Document with ID ${id} not found`);
    }
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

    const [total, items] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })
    ]);

    return {
      data: items.map(item => this.mapToProto(item)),
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
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

    // Log hành động cập nhật nếu có kèm theo ý kiến xử lý (comment) hoặc thay đổi trạng thái
    if (data.comment || data.status) {
      await this.logRecord(
        id,
        data.status === 'PUBLISHED' ? "KẾT THÚC / LƯU HỒ SƠ" : "XỬ LÝ VĂN BẢN",
        data.comment || "Cập nhật thông tin văn bản.",
        data.userId,
        data.userName
      );
    }

    return { data: this.mapToProto(document) };
  }

  async receiveDocument(id: string, actorId?: string, actorName?: string) {
    const document = await this.workflowService.receiveDocument(id, actorId, actorName);
    return this.mapToProto(document);
  }

  async processDocument(id: string, actorId: string, actorName: string, note?: string) {
    const document = await this.workflowService.processDocument(id, actorId, actorName, note);
    return this.mapToProto(document);
  }

  async finalizeDocument(id: string, actorId: string, actorName: string, note?: string) {
    const document = await this.workflowService.finalizeDocument(id, actorId, actorName, note);
    return this.mapToProto(document);
  }

  async remove(id: string) {
    await this.prisma.document.delete({ where: { id } });
    return { success: true };
  }

  async getStatistics() {
    const now = new Date();
    
    // Tối ưu thuật toán: Đẩy việc đếm (count) xuống tầng Database thay vì kéo toàn bộ dữ liệu lên RAM
    const [
      incomingTotal,
      incomingPending,
      incomingLate,
      outgoingTotal,
      urgentTotal
    ] = await Promise.all([
      this.prisma.document.count({ where: { isIncoming: true } }),
      this.prisma.document.count({ where: { isIncoming: true, status: 'PROCESSING' } }),
      this.prisma.document.count({ where: { isIncoming: true, status: 'PROCESSING', processingDeadline: { lt: now } } }),
      this.prisma.document.count({ where: { isIncoming: false } }),
      this.prisma.document.count({ where: { status: 'PROCESSING', urgency: { in: ['URGENT', 'FLASH'] } } })
    ]);

    return {
      incomingTotal,
      incomingPending,
      incomingLate,
      outgoingTotal,
      urgentTotal
    };
  }

  async getLogs(documentId: string) {
    const logs = await this.prisma.documentLog.findMany({
      where: { documentId },
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: logs.map(log => ({
        ...log,
        createdAt: log.createdAt?.toISOString() || new Date().toISOString(),
        userId: log.userId || "",
        userName: log.userName || "",
        note: log.note || ""
      }))
    };
  }

  async logRecord(documentId: string, action: string, note?: string, userId?: string, userName?: string) {
    return this.prisma.documentLog.create({
      data: {
        documentId,
        action,
        note,
        userId,
        userName,
      },
    });
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
      issueDate: doc.issueDate instanceof Date ? doc.issueDate.toISOString() : (doc.issueDate || ""),
      arrivalDate: doc.arrivalDate instanceof Date ? doc.arrivalDate.toISOString() : (doc.arrivalDate || ""),
      arrivalNumber: doc.arrivalNumber || "",
      processingDeadline: doc.processingDeadline instanceof Date ? doc.processingDeadline.toISOString() : (doc.processingDeadline || ""),
      recipients: doc.recipients || "",
      urgency: doc.urgency || "NORMAL",
      securityLevel: doc.securityLevel || "NORMAL",
      status: doc.status || "DRAFT",
      isPublic: !!doc.isPublic,
      isIncoming: !!doc.isIncoming,
      fileId: doc.fileId || "",
      fileUrl: doc.fileId ? `/api/v1/admin/media/download/${doc.fileId}` : "",
      signatureValid: !!doc.signatureValid,
      pageCount: doc.pageCount || 1,
      attachmentCount: doc.attachmentCount || 0,
      linkedDocumentId: doc.linkedDocumentId || "",
      fiscalYear: doc.fiscalYear || 0,
      transparencyCategory: doc.transparencyCategory || "",
      createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || ""),
      updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || ""),
      typeName: doc.typeName || "", // Assuming these are pre-populated or handled elsewhere
      fieldName: doc.fieldName || "",
    };
  }

  async extractMetadata(fileId: string) {
    console.log("[DocumentService] Extraction disabled. Returning empty metadata for:", fileId);
    return {
      documentNumber: "",
      notation: "",
      abstract: "",
      typeId: "CONG_VAN",
      fieldId: "HANH_CHINH",
      issuerName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk",
      signerName: "",
      signerPosition: "",
      issueDate: new Date().toISOString().split('T')[0],
      recipients: "",
      pageCount: 1,
      signatureValid: false
    };
  }

  async syncOnline() {
    console.log("[DocumentService] Syncing documents from Trục VDX/LGSP...");
    // Giả lập việc nhận được 2 văn bản mới từ nguồn online
    const mockExternalDocs = [
      {
        documentNumber: `VDX-${Date.now() % 10000}-01`,
        notation: "VDX/TƯ",
        abstract: "Về việc triển khai kế hoạch chuyển đổi số năm 2026",
        issuerName: "Bộ Khoa học và Công nghệ",
        issueDate: new Date().toISOString(),
        isIncoming: true,
        status: "PROCESSING",
        urgency: "NORMAL",
      },
      {
        documentNumber: `VDX-${Date.now() % 10000}-02`,
        notation: "VDX/STC",
        abstract: "Hướng dẫn thực hiện Nghị định 61/NĐ-CP về công khai tài chính",
        issuerName: "Sở Tài chính tỉnh Đắk Lắk",
        issueDate: new Date().toISOString(),
        isIncoming: true,
        status: "PROCESSING",
        urgency: "FLASH",
      }
    ];

    // Thuật toán Concurrent Promise.all để lưu song song
    await Promise.all(
      mockExternalDocs.map(doc => 
        this.create({ ...doc, userId: 'SYSTEM', userName: 'Hệ thống tự động (VDX)' })
      )
    );

    return { success: true, count: mockExternalDocs.length };
  }

  // --- Administrative Procedures ---
  async createProcedure(data: any) {
    const requiredDocs = Array.isArray(data.requiredDocs) 
      ? JSON.stringify(data.requiredDocs) 
      : (typeof data.requiredDocs === 'string' ? data.requiredDocs : "[]");
      
    const steps = Array.isArray(data.steps) 
      ? JSON.stringify(data.steps) 
      : (typeof data.steps === 'string' ? data.steps : "[]");

    const procedure = await this.prisma.administrativeProcedure.create({
      data: {
        code: data.code || `TTHC-${Date.now()}`,
        name: data.name || "Chưa đặt tên thủ tục",
        category: data.category || "khac",
        description: data.description || "",
        duration: data.duration || "Trong ngày",
        fee: data.fee || "Miễn phí",
        requiredDocs,
        steps,
      },
    });

    return { data: this.mapProcedureToProto(procedure) };
  }

  async findProcedureOne(id: string) {
    const procedure = await this.prisma.administrativeProcedure.findUnique({
      where: { id },
    });
    if (!procedure) {
      throw new Error(`Procedure with ID ${id} not found`);
    }
    return { data: this.mapProcedureToProto(procedure) };
  }

  async findProcedureAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { code: { contains: query.search } },
        { name: { contains: query.search } },
        { description: { contains: query.search } },
      ];
    }
    if (query.category && query.category !== 'ALL') {
      where.category = query.category;
    }

    const [total, items] = await Promise.all([
      this.prisma.administrativeProcedure.count({ where }),
      this.prisma.administrativeProcedure.findMany({
        where,
        orderBy: { code: 'asc' },
        skip: (page - 1) * limit,
        take: limit,
      })
    ]);

    return {
      data: items.map(item => this.mapProcedureToProto(item)),
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
    };
  }

  async updateProcedure(id: string, data: any) {
    const updateData: any = {};
    const allowed = ['code', 'name', 'category', 'description', 'duration', 'fee'];
    allowed.forEach(field => {
      if (data[field] !== undefined) updateData[field] = data[field];
    });

    if (data.requiredDocs) {
      updateData.requiredDocs = Array.isArray(data.requiredDocs) 
        ? JSON.stringify(data.requiredDocs) 
        : data.requiredDocs;
    }
    if (data.steps) {
      updateData.steps = Array.isArray(data.steps) 
        ? JSON.stringify(data.steps) 
        : data.steps;
    }

    const procedure = await this.prisma.administrativeProcedure.update({
      where: { id },
      data: updateData,
    });

    return { data: this.mapProcedureToProto(procedure) };
  }

  async removeProcedure(id: string) {
    await this.prisma.administrativeProcedure.delete({ where: { id } });
    return { success: true };
  }

  private mapProcedureToProto(item: any) {
    if (!item) return null;

    let requiredDocs: string[] = [];
    try {
      requiredDocs = typeof item.requiredDocs === 'string' ? JSON.parse(item.requiredDocs) : item.requiredDocs;
    } catch {
      requiredDocs = [];
    }

    let steps: string[] = [];
    try {
      steps = typeof item.steps === 'string' ? JSON.parse(item.steps) : item.steps;
    } catch {
      steps = [];
    }

    return {
      id: item.id,
      code: item.code,
      name: item.name,
      category: item.category,
      description: item.description || "",
      duration: item.duration || "",
      fee: item.fee || "",
      requiredDocs,
      steps,
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : (item.createdAt || ""),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt || ""),
    };
  }

  // --- One-Stop Dossiers ---
  async createDossier(data: any) {
    const dossier = await this.prisma.oneStopDossier.create({
      data: {
        code: data.code || `DK-2026-${Math.floor(100 + Math.random() * 900)}`,
        senderName: data.senderName || "Người dân nộp hồ sơ",
        receiveDate: data.receiveDate ? new Date(data.receiveDate) : new Date(),
        dueDate: data.dueDate ? new Date(data.dueDate) : new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
        status: data.status || "RECEIVED",
        currentStep: Number(data.currentStep) || 1,
        stepDetails: data.stepDetails || "[]",
      },
    });

    return { data: this.mapDossierToProto(dossier) };
  }

  async findDossierOne(query: { id?: string, code?: string }) {
    const where: any = {};
    if (query.id) where.id = query.id;
    if (query.code) where.code = query.code;

    if (!query.id && !query.code) {
      throw new Error(`Dossier query must specify either ID or code`);
    }

    const dossier = await this.prisma.oneStopDossier.findUnique({
      where: where as any,
    });
    if (!dossier) {
      throw new Error(`Dossier not found`);
    }
    return { data: this.mapDossierToProto(dossier) };
  }

  async findDossierAll(query: any) {
    const page = Number(query.page) || 1;
    const limit = Number(query.limit) || 10;
    const skip = (page - 1) * limit;

    const where: any = {};
    if (query.search) {
      where.OR = [
        { code: { contains: query.search } },
        { senderName: { contains: query.search } },
      ];
    }
    if (query.status) {
      where.status = query.status;
    }

    const [total, items] = await Promise.all([
      this.prisma.oneStopDossier.count({ where }),
      this.prisma.oneStopDossier.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      })
    ]);

    return {
      data: items.map(item => this.mapDossierToProto(item)),
      meta: {
        pagination: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit)
        }
      },
    };
  }

  async updateDossier(id: string, data: any) {
    const updateData: any = {};
    const allowed = ['code', 'senderName', 'status', 'currentStep', 'stepDetails'];
    allowed.forEach(field => {
      if (data[field] !== undefined) updateData[field] = data[field];
    });

    if (data.receiveDate) updateData.receiveDate = new Date(data.receiveDate);
    if (data.dueDate) updateData.dueDate = new Date(data.dueDate);

    const dossier = await this.prisma.oneStopDossier.update({
      where: { id },
      data: updateData,
    });

    return { data: this.mapDossierToProto(dossier) };
  }

  async removeDossier(id: string) {
    await this.prisma.oneStopDossier.delete({ where: { id } });
    return { success: true };
  }

  private mapDossierToProto(item: any) {
    if (!item) return null;

    return {
      id: item.id,
      code: item.code,
      procedureName: item.procedureName || "",
      senderName: item.senderName,
      receiveDate: item.receiveDate instanceof Date ? item.receiveDate.toISOString() : (item.receiveDate || ""),
      dueDate: item.dueDate instanceof Date ? item.dueDate.toISOString() : (item.dueDate || ""),
      status: item.status || "RECEIVED",
      currentStep: item.currentStep || 1,
      stepDetails: item.stepDetails || "[]",
      createdAt: item.createdAt instanceof Date ? item.createdAt.toISOString() : (item.createdAt || ""),
      updatedAt: item.updatedAt instanceof Date ? item.updatedAt.toISOString() : (item.updatedAt || ""),
    };
  }
}


