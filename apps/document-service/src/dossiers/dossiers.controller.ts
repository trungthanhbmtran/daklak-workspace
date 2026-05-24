import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DossiersService } from './dossiers.service';

@Controller()
export class DossiersController {
  constructor(private readonly dossiersService: DossiersService) {}

  @GrpcMethod('DossierService', 'GetDossiers')
  async getDossiers() {
    const res = await this.dossiersService.getDossiers();
    return { data: res };
  }

  @GrpcMethod('DossierService', 'GetDossier')
  async getDossier(data: { id: string }) {
    return this.dossiersService.getDossier(data.id);
  }

  @GrpcMethod('DossierService', 'GetComponents')
  async getComponents(data: { id: string }) {
    const res = await this.dossiersService.getComponents(data.id);
    return { data: res };
  }

  @GrpcMethod('DossierService', 'UpdateComponent')
  async updateComponent(data: any) {
    return this.dossiersService.updateComponent(data.id, data);
  }

  @GrpcMethod('DossierService', 'CreateDossierFromTemplate')
  async createDossierFromTemplate(data: { procedureId: string, senderName: string }) {
    return this.dossiersService.createDossierFromTemplate(data.procedureId, data.senderName);
  }

  @GrpcMethod('DossierService', 'CreateBlankDossier')
  async createBlankDossier(data: { procedureName: string, senderName: string }) {
    return this.dossiersService.createBlankDossier(data.procedureName, data.senderName);
  }

  @GrpcMethod('DossierService', 'AddComponentFromCabinet')
  async addComponentFromCabinet(data: { dossierId: string, name: string, fileUrl: string }) {
    return this.dossiersService.addComponentFromCabinet(data.dossierId, data.name, data.fileUrl);
  }
}
