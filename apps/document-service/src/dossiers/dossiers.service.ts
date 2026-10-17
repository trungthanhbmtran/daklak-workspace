import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { randomUUID } from 'crypto';

@Injectable()
export class DossiersService {
  private readonly logger = new Logger(DossiersService.name);

  constructor(private readonly prisma: PrismaService) {}

  async getDossiers() {
    // Ledger #29: proto DossierService.GetDossiers dùng common.EmptyRequest — chưa có
    // tham số pagination trên contract. Cap mặc định 100 + sort mới nhất để tránh unbounded.
    // TODO(proto): thêm pagination (skip/limit) vào dossier.proto khi được phép sửa contract.
    return this.prisma.oneStopDossier.findMany({
      orderBy: { createdAt: 'desc' },
      take: 100,
    });
  }

  async getDossier(id: string) {
    return this.prisma.oneStopDossier.findUnique({
      where: { id }
    });
  }

  async getComponents(dossierId: string) {
    return this.prisma.dossierComponent.findMany({
      where: { dossierId },
    });
  }

  async updateComponent(id: string, data: any) {
    return this.prisma.dossierComponent.update({
      where: { id },
      data,
    });
  }

  async createDossierFromTemplate(procedureId: string, senderName: string) {
    // 1. Lấy thông tin Thủ tục hành chính (Mẫu hồ sơ)
    const procedure = await this.prisma.administrativeProcedure.findUnique({
      where: { id: procedureId }
    });

    if (!procedure) throw new Error("Procedure not found");

    let requiredDocs: any[] = [];
    try {
      requiredDocs = typeof procedure.requiredDocs === 'string' ? JSON.parse(procedure.requiredDocs) : procedure.requiredDocs;
    } catch (error: any) {
      // Ledger #27: không nuốt lặng lẽ lỗi parse — ghi log để truy vết dữ liệu rác
      this.logger.warn(
        `createDossierFromTemplate: failed to parse requiredDocs of procedure ${procedureId}, fallback to empty — ${error?.message}`,
      );
      requiredDocs = [];
    }

    // Ledger #29: mã hồ sơ dùng 8-hex từ randomUUID (ít nhất ~2^32 tổ hợp) thay
    // Math.random()*9000 gây collision ~100 hồ sơ/năm. Giữ format HS-{year}-{suffix}.
    const dossier = await this.prisma.oneStopDossier.create({
      data: {
        code: this.generateDossierCode(),
        procedureName: procedure.name,
        senderName: senderName || "Người nộp",
        receiveDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Mặc định 7 ngày
        status: "PROCESSING",
        currentStep: 1,
        stepDetails: "[]",
      }
    });

    // 3. Tạo các thành phần hồ sơ rỗng dựa trên requiredDocs
    if (requiredDocs.length > 0) {
      await this.prisma.dossierComponent.createMany({
        data: requiredDocs.map(doc => ({
          dossierId: dossier.id,
          name: doc.name || "Tài liệu",
          isRequired: doc.isRequired !== undefined ? doc.isRequired : true,
          sampleFileUrl: doc.sampleFileUrl || null,
          status: "MISSING",
        }))
      });
    }

    return {
      id: dossier.id,
      code: dossier.code,
      procedureName: dossier.procedureName,
      senderName: dossier.senderName,
      status: dossier.status,
      createdAt: dossier.createdAt.toISOString()
    };
  }

  async createBlankDossier(procedureName: string, senderName: string) {
    const dossier = await this.prisma.oneStopDossier.create({
      data: {
        code: this.generateDossierCode(),
        procedureName: procedureName || "Hồ sơ mới",
        senderName: senderName || "Người nộp",
        receiveDate: new Date(),
        dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // Mặc định 7 ngày
        status: "PROCESSING",
        currentStep: 1,
        stepDetails: "[]",
      }
    });

    return {
      id: dossier.id,
      code: dossier.code,
      procedureName: dossier.procedureName,
      senderName: dossier.senderName,
      status: dossier.status,
      createdAt: dossier.createdAt.toISOString()
    };
  }

  private generateDossierCode(): string {
    // Ledger #29: 8-hex từ randomUUID — entropy đủ lớn, tránh collision của
    // `Math.random()*9000` (~100 hồ sơ/năm). Format giữ theo comment: HS-{year}-{suffix}.
    return `HS-${new Date().getFullYear()}-${randomUUID().replace(/-/g, '').slice(0, 8)}`;
  }

  async addComponentFromCabinet(dossierId: string, name: string, fileUrl: string) {
    return this.prisma.dossierComponent.create({
      data: {
        dossierId,
        name: name || "Thành phần hồ sơ",
        isRequired: true,
        sampleFileUrl: fileUrl,
        status: "MISSING",
      }
    });
  }
}

