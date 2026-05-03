import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { PortalMenuService } from './portal-menu.service';

@Controller()
export class PortalMenuController {
  constructor(private readonly service: PortalMenuService) {}

  @GrpcMethod('PortalMenuService', 'CreatePortalMenu')
  async create(data: any) {
    const result = await this.service.create(data);
    return this.mapToProto(result);
  }

  @GrpcMethod('PortalMenuService', 'GetPortalMenu')
  async findOne(data: { id: string }) {
    const result = await this.service.findOne(data.id);
    return this.mapToProto(result);
  }

  @GrpcMethod('PortalMenuService', 'ListPortalMenus')
  async findAll(data: { onlyActive: boolean, position?: string }) {
    const items = await this.service.findAll(data.onlyActive, data.position);
    return { data: items.map(i => this.mapToProto(i)) };
  }

  @GrpcMethod('PortalMenuService', 'UpdatePortalMenu')
  async update(data: any) {
    const { id, ...updateData } = data;
    const result = await this.service.update(id, updateData);
    return this.mapToProto(result);
  }

  @GrpcMethod('PortalMenuService', 'DeletePortalMenu')
  async delete(data: { id: string }) {
    return this.service.delete(data.id);
  }

  private mapToProto(menu: any) {
    if (!menu) return null;
    return {
      ...menu,
      createdAt: menu.createdAt?.toISOString(),
      updatedAt: menu.updatedAt?.toISOString(),
      children: menu.children?.map((c: any) => this.mapToProto(c)) || [],
    };
  }
}
