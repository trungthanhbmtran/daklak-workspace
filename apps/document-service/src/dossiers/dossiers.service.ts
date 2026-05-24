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
}
