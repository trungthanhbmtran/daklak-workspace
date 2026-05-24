import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { CabinetService } from './cabinet.service';

@Controller()
export class CabinetController {
  constructor(private readonly cabinetService: CabinetService) {}

  @GrpcMethod('CabinetService', 'ListFiles')
  async listFiles(data: { userId?: string, orgId?: string }) {
    const res = await this.cabinetService.listFiles(data.userId, data.orgId);
    return { data: res };
  }

  @GrpcMethod('CabinetService', 'AddFile')
  async addFile(data: any) {
    return this.cabinetService.addFile(data);
  }

  @GrpcMethod('CabinetService', 'DeleteFile')
  async deleteFile(data: { id: string }) {
    await this.cabinetService.deleteFile(data.id);
    return {};
  }
}
