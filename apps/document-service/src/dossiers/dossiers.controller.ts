import { RpcException } from '@nestjs/microservices';
import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DossiersService } from './dossiers.service';

@Controller()
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) { }

  @GrpcMethod('DossierService', 'GetDossiers')
  async getDossiers() {
    const res = await this.dossiersService.getDossiers();
    return {
      data: res.map(d => ({
        ...d,
        createdAt: d.createdAt.toISOString(),
        updatedAt: d.updatedAt.toISOString(),
      }))
    };
  }

  @GrpcMethod('DossierService', 'GetDossier')
  async getDossier(data: { id: string }) {
    const d = await this.dossiersService.getDossier(data.id);
    if (!d) throw new RpcException({ message: 'Bản ghi không tồn tại', code: 5 });
    return {
      ...d,
      createdAt: d.createdAt.toISOString(),
      updatedAt: d.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('DossierService', 'GetComponents')
  async getComponents(data: { id: string }) {
    const res = await this.dossiersService.getComponents(data.id);
    return {
      data: res.map(c => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
        updatedAt: c.updatedAt.toISOString(),
      }))
    };
  }

  @GrpcMethod('DossierService', 'UpdateComponent')
  async updateComponent(data: any) {
    const c = await this.dossiersService.updateComponent(data.id, data);
    return {
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }

  @GrpcMethod('DossierService', 'CreateDossierFromTemplate')
  async createDossierFromTemplate(data: { procedureId: string, senderName: string }) {
    // createDossierFromTemplate in service already returns strings for dates, wait!
    // No, createDossierFromTemplate in service: `createdAt: dossier.createdAt.toISOString()`
    // So it's already strings!
    return this.dossiersService.createDossierFromTemplate(data.procedureId, data.senderName);
  }

  @GrpcMethod('DossierService', 'CreateBlankDossier')
  async createBlankDossier(data: { procedureName: string, senderName: string }) {
    return this.dossiersService.createBlankDossier(data.procedureName, data.senderName);
  }

  @GrpcMethod('DossierService', 'AddComponentFromCabinet')
  async addComponentFromCabinet(data: { dossierId: string, name: string, fileUrl: string }) {
    const c = await this.dossiersService.addComponentFromCabinet(data.dossierId, data.name, data.fileUrl);
    return {
      ...c,
      createdAt: c.createdAt.toISOString(),
      updatedAt: c.updatedAt.toISOString(),
    };
  }
}
