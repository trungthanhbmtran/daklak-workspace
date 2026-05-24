import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';

@Injectable()
export class DossiersService {
  constructor(private readonly prisma: PrismaService) {}

  async getDossiers() {
    return this.prisma.oneStopDossier.findMany({
      orderBy: { createdAt: 'desc' },
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
    } catch {
      requiredDocs = [];
    }

    // 2. Tạo Hồ sơ mới
    const dossier = await this.prisma.oneStopDossier.create({
      data: {
        code: `HS-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
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
}
