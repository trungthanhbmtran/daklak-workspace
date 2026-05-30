import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { IntegrationService } from './integration.service';

@Controller()
export class IntegrationController {
  constructor(private readonly integrationService: IntegrationService) {}

  @GrpcMethod('IntegrationService', 'FindAll')
  async findAll(data: any) {
    return this.integrationService.findAll(data);
  }

  @GrpcMethod('IntegrationService', 'Create')
  async create(data: any) {
    return this.integrationService.create(data);
  }

  @GrpcMethod('IntegrationService', 'Update')
  async update(data: any) {
    return this.integrationService.update(data);
  }

  @GrpcMethod('IntegrationService', 'Delete')
  async delete(data: { id: number }) {
    return this.integrationService.delete(data.id);
  }

  @GrpcMethod('IntegrationService', 'ToggleActive')
  async toggleActive(data: { id: number; isActive: boolean }) {
    return this.integrationService.toggleActive(data.id, data.isActive);
  }

  @GrpcMethod('IntegrationService', 'SyncDocuments')
  async syncDocuments(data: any) {
    return this.integrationService.syncDocuments(data);
  }

  @GrpcMethod('IntegrationService', 'SendDocument')
  async sendDocument(data: any) {
    return this.integrationService.sendDocument(data);
  }
}
