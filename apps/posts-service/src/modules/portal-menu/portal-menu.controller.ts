import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PortalMenuService } from './portal-menu.service';

@Controller()
export class PortalMenuController {
  constructor(private readonly portalMenuService: PortalMenuService) {}

  @GrpcMethod('PortalMenuService', 'Create')
  async create(data: any) {
    const result = await this.portalMenuService.create(data);
    return { data: result };
  }

  @GrpcMethod('PortalMenuService', 'GetOne')
  async getOne(data: { id: string }) {
    const result = await this.portalMenuService.findOne(data.id);
    return { data: result };
  }

  @GrpcMethod('PortalMenuService', 'GetAll')
  async getAll(query: any) {
    const result = await this.portalMenuService.findAll(query);
    return { data: result };
  }

  @GrpcMethod('PortalMenuService', 'Update')
  async update(data: any) {
    const { id, ...rest } = data;
    const result = await this.portalMenuService.update(id, rest);
    return { data: result };
  }

  @GrpcMethod('PortalMenuService', 'Delete')
  async delete(data: { id: string }) {
    await this.portalMenuService.remove(data.id);
    return { success: true };
  }

  @GrpcMethod('PortalMenuService', 'GetTree')
  async getTree(data: { position?: string }) {
    const result = await this.portalMenuService.getTree(data.position);
    return { data: result };
  }
}
