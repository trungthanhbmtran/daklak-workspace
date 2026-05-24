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
}
