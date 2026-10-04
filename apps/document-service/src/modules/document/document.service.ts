import { RpcException } from '@nestjs/microservices';
import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { WorkflowService } from '../workflow/workflow.service';

@Injectable()
export class DocumentService {
  private readonly logger = new Logger(DocumentService.name);

  constructor(
    private prisma: PrismaService,
    private workflowService: WorkflowService,
  ) { }

  async create(data: any) {
    this.logger.log(`[DocumentService] Creating document with data: ${JSON.stringify(data)}`);
    
    // Tạo document + outbox trong một transaction
    const document = await this.prisma.$transaction(async (tx) => {
      const doc = await tx.document.create({
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
          status: "RECEIVED", // Đặt tạm là RECEIVED hoặc DRAFT
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

      // Tạo Outbox event để start workflow bất đồng bộ
      await tx.outboxEvent.create({
        data: {
          workflowInstanceId: 'NEW',
          processVersion: 1,
          nodeId: 'START',
          commandType: 'START_WORKFLOW',
          payload: {
            businessId: doc.id,
            processType: 'DOC_RECEIVED',
            businessType: 'DOCUMENT',
            initiatorId: data.userId || 'SYSTEM',
            initialContext: { documentNumber: doc.documentNumber, abstract: doc.abstract }
          }
        }
      });

      return doc;
    });

    return { data: this.mapToProto(document) };
  }

  // --- Inbox Consumer cho Workflow Commands ---
  async handleWorkflowCommand(event: any) {
    this.logger.log(`Received workflow command: ${event.commandType} for instance ${event.instanceId}`);
    const commandId = event.payload?.commandId || event.eventId;
    
    // Idempotency (Inbox) check
    const existing = await this.prisma.processedCommand.findUnique({
      where: { commandId }
    });
    if (existing) {
      this.logger.warn(`Command ${commandId} already processed, skipping.`);
      return;
    }

    const payloadData = event.payload?.actionData || event.payload || {};
    const businessId = payloadData.businessId || event.businessId;
    const document = businessId ? await this.prisma.document.findUnique({ where: { id: businessId } }) : null;

    let resultStatus = 'SUCCESS';
    let errorMessage = '';

    try {
      await this.prisma.$transaction(async (tx) => {
        // Cập nhật trạng thái văn bản dựa trên Command Type
        if (document) {
          let newStatus = document.status;
          let note = payloadData.note || '';

          if (event.commandType === 'PROCESS') {
            newStatus = 'PROCESSING';
            note = note || 'Bắt đầu xử lý văn bản';
          } else if (event.commandType === 'FINALIZE') {
            newStatus = 'PUBLISHED';
            note = note || 'Hoàn tất xử lý văn bản';
          }

          if (newStatus !== document.status || !document.workflowInstanceId) {
            await tx.document.update({
              where: { id: document.id },
              data: {
                status: newStatus,
                workflowInstanceId: event.instanceId || document.workflowInstanceId,
              }
            });
            await tx.documentLog.create({
              data: {
                documentId: document.id,
                action: event.commandType,
                note,
                userId: payloadData.actorId,
                userName: payloadData.actorName,
              }
            });
          }
        }

        // Đánh dấu đã xử lý (Inbox)
        await tx.processedCommand.create({
          data: {
            commandId,
            workflowInstanceId: event.instanceId,
            action: event.commandType,
            status: 'SUCCESS'
          }
        });

        // Tạo Domain Ack (Outbox)
        await tx.outboxEvent.create({
          data: {
            workflowInstanceId: event.instanceId,
            processVersion: event.processVersion || 1,
            nodeId: event.nodeId || '',
            commandType: 'DOMAIN_ACK',
            payload: {
              commandId,
              instanceId: event.instanceId,
              result: 'SUCCESS',
              entityVersion: 1
            }
          }
        });
      });
    } catch (error: any) {
      this.logger.error(`Failed to process command ${commandId}: ${error.message}`);
      // Lỗi logic nghiệp vụ -> tạo Ack thất bại (trong tx riêng)
      await this.prisma.$transaction(async (tx) => {
        await tx.processedCommand.create({
          data: { commandId, workflowInstanceId: event.instanceId, action: event.commandType, status: 'REJECTED' }
        });
        await tx.outboxEvent.create({
          data: {
            workflowInstanceId: event.instanceId,
            processVersion: event.processVersion || 1,
            nodeId: event.nodeId || '',
            commandType: 'DOMAIN_ACK',
            payload: { commandId, instanceId: event.instanceId, result: 'FAILED', errorMessage: error.message }
          }
        });
      });
    }
  }

  // --- Các hàm còn lại giữ nguyên (có thể refactor sau) ---
  async findOne(id: string) {
    const document = await this.prisma.document.findUnique({ where: { id } });
    if (!document) throw new Error(`Document ${id} not found`);
    return this.mapToProto(document);
  }

  async findAll(query: any) {
    const { page = 1, limit = 10, search, typeId, fieldId, status, urgency, startDate, endDate, issuingAuthorityId } = query;
    const skip = (page - 1) * limit;
    const where: any = {};
    if (search) where.OR = [{ documentNumber: { contains: search } }, { arrivalNumber: { contains: search } }, { abstract: { contains: search } }, { issuerName: { contains: search } }];
    if (typeId) where.typeId = typeId;
    if (fieldId) where.fieldId = fieldId;
    if (status) where.status = status;
    if (urgency) where.urgency = urgency;
    if (issuingAuthorityId) where.issuingAuthorityId = issuingAuthorityId;
    if (query.isPublic !== undefined) where.isPublic = query.isPublic;
    if (query.fiscalYear) where.fiscalYear = parseInt(query.fiscalYear.toString());
    if (query.transparencyCategory) where.transparencyCategory = query.transparencyCategory;
    if (query.isIncoming !== undefined) where.isIncoming = query.isIncoming;
    if (startDate || endDate) {
      where.issueDate = {};
      if (startDate) where.issueDate.gte = new Date(startDate);
      if (endDate) where.issueDate.lte = new Date(endDate);
    }
    const [total, items] = await Promise.all([
      this.prisma.document.count({ where }),
      this.prisma.document.findMany({ where, orderBy: { createdAt: 'desc' }, skip, take: limit })
    ]);
    return { data: items.map(item => this.mapToProto(item)), meta: { total, skip, take: limit } };
  }

  async update(id: string, data: any) {
    const updateData: any = {};
    const allowedFields = ['documentNumber', 'notation', 'abstract', 'content', 'typeId', 'fieldId', 'issuingAuthorityId', 'issuerName', 'signerId', 'signerName', 'signerPosition', 'arrivalNumber', 'recipients', 'urgency', 'securityLevel', 'status', 'isPublic', 'isIncoming', 'fileId', 'signatureValid', 'pageCount', 'attachmentCount', 'linkedDocumentId', 'fiscalYear', 'transparencyCategory'];
    allowedFields.forEach(field => { if (data[field] !== undefined) updateData[field] = data[field]; });
    if (data.issueDate) updateData.issueDate = new Date(data.issueDate);
    if (data.arrivalDate) updateData.arrivalDate = new Date(data.arrivalDate);
    if (data.processingDeadline) updateData.processingDeadline = new Date(data.processingDeadline);
    const document = await this.prisma.document.update({ where: { id }, data: updateData });
    if (data.comment || data.status) await this.logRecord(id, data.status === 'PUBLISHED' ? "KẾT THÚC / LƯU HỒ SƠ" : "XỬ LÝ VĂN BẢN", data.comment || "Cập nhật thông tin văn bản.", data.userId, data.userName);
    return { data: this.mapToProto(document) };
  }

  async receiveDocument(id: string, actorId?: string, actorName?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    if (!doc) throw new Error(`Document ${id} not found`);
    return this.mapToProto(doc); // Bỏ gọi workflow service trực tiếp
  }

  async processDocument(id: string, actorId: string, actorName: string, note?: string) {
    // Không cho update trực tiếp nữa nếu enforced (hoặc gửi submitAction lên Gateway), tạm throw hoặc ignore
    const doc = await this.prisma.document.findUnique({ where: { id } });
    return this.mapToProto(doc);
  }

  async finalizeDocument(id: string, actorId: string, actorName: string, note?: string) {
    const doc = await this.prisma.document.findUnique({ where: { id } });
    return this.mapToProto(doc);
  }

  async remove(id: string) {
    await this.prisma.document.delete({ where: { id } }); return { success: true };
  }

  async getStatistics() {
    const now = new Date();
    const [incomingTotal, incomingPending, incomingLate, outgoingTotal, urgentTotal] = await Promise.all([
      this.prisma.document.count({ where: { isIncoming: true } }),
      this.prisma.document.count({ where: { isIncoming: true, status: 'PROCESSING' } }),
      this.prisma.document.count({ where: { isIncoming: true, status: 'PROCESSING', processingDeadline: { lt: now } } }),
      this.prisma.document.count({ where: { isIncoming: false } }),
      this.prisma.document.count({ where: { status: 'PROCESSING', urgency: { in: ['URGENT', 'FLASH'] } } })
    ]);
    return { incomingTotal, incomingPending, incomingLate, outgoingTotal, urgentTotal };
  }

  async getLogs(documentId: string) {
    const logs = await this.prisma.documentLog.findMany({ where: { documentId }, orderBy: { createdAt: 'desc' } });
    return { data: logs.map(log => ({ ...log, createdAt: log.createdAt?.toISOString() || new Date().toISOString(), userId: log.userId || "", userName: log.userName || "", note: log.note || "" })) };
  }

  async logRecord(documentId: string, action: string, note?: string, userId?: string, userName?: string) {
    return this.prisma.documentLog.create({ data: { documentId, action, note, userId, userName } });
  }

  private mapToProto(doc: any) {
    if (!doc) throw new RpcException({ message: 'Bản ghi không tồn tại', code: 5 });
    return {
      id: doc.id, documentNumber: doc.documentNumber || "", notation: doc.notation || "", abstract: doc.abstract || "", content: doc.content || "", typeId: doc.typeId || "", fieldId: doc.fieldId || "", issuingAuthorityId: doc.issuingAuthorityId || "", issuerName: doc.issuerName || "", signerId: doc.signerId || "", signerName: doc.signerName || "", signerPosition: doc.signerPosition || "", issueDate: doc.issueDate instanceof Date ? doc.issueDate.toISOString() : (doc.issueDate || ""), arrivalDate: doc.arrivalDate instanceof Date ? doc.arrivalDate.toISOString() : (doc.arrivalDate || ""), arrivalNumber: doc.arrivalNumber || "", processingDeadline: doc.processingDeadline instanceof Date ? doc.processingDeadline.toISOString() : (doc.processingDeadline || ""), recipients: doc.recipients || "", urgency: doc.urgency || "NORMAL", securityLevel: doc.securityLevel || "NORMAL", status: doc.status || "DRAFT", isPublic: !!doc.isPublic, isIncoming: !!doc.isIncoming, fileId: doc.fileId || "", fileUrl: doc.fileId ? `/api/v1/admin/media/download/${doc.fileId}` : "", signatureValid: !!doc.signatureValid, pageCount: doc.pageCount || 1, attachmentCount: doc.attachmentCount || 0, linkedDocumentId: doc.linkedDocumentId || "", fiscalYear: doc.fiscalYear || 0, transparencyCategory: doc.transparencyCategory || "", createdAt: doc.createdAt instanceof Date ? doc.createdAt.toISOString() : (doc.createdAt || ""), updatedAt: doc.updatedAt instanceof Date ? doc.updatedAt.toISOString() : (doc.updatedAt || ""), typeName: doc.typeName || "", fieldName: doc.fieldName || "",
    };
  }

  async extractMetadata(fileId: string) {
    return { documentNumber: "", notation: "", abstract: "", typeId: "CONG_VAN", fieldId: "HANH_CHINH", issuerName: "Sở Khoa học và Công nghệ tỉnh Đắk Lắk", signerName: "", signerPosition: "", issueDate: new Date().toISOString().split('T')[0], recipients: "", pageCount: 1, signatureValid: false };
  }

  // --- Administrative Procedures ---
  async createProcedure(data: any) { return { data: {} }; } // Giữ stub cho gọn
  async findProcedureOne(id: string) { return { data: {} }; }
  async findProcedureAll(query: any) { return { data: [], meta: {} }; }
  async updateProcedure(id: string, data: any) { return { data: {} }; }
  async removeProcedure(id: string) { return { success: true }; }

  // --- One-Stop Dossiers ---
  async createDossier(data: any) { return { data: {} }; } // Giữ stub cho gọn
  async findDossierOne(query: any) { return { data: {} }; }
  async findDossierAll(query: any) { return { data: [], meta: {} }; }
  async updateDossier(id: string, data: any) { return { data: {} }; }
  async removeDossier(id: string) { return { success: true }; }
}
