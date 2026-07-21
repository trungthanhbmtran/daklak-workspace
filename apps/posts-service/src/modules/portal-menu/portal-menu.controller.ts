import { Controller } from '@nestjs/common';
import {  GrpcMethod , Payload } from '@nestjs/microservices';
import { PortalMenuService } from './portal-menu.service';

@Controller()
export class PortalMenuController {
  constructor(private readonly service: PortalMenuService) { }

  @GrpcMethod('PortalMenuService', 'CreatePortalMenu')
  async create(@Payload() data: Record<string, any>) {
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
    return { data: items.map(i => this.mapToProto(i)).filter(i => !!i) };
  }

  @GrpcMethod('PortalMenuService', 'UpdatePortalMenu')
  async update(@Payload() data: Record<string, any>) {
    const { id, ...updateData } = data;
    const result = await this.service.update(id, updateData);
    return this.mapToProto(result);
  }

  @GrpcMethod('PortalMenuService', 'DeletePortalMenu')
  async delete(data: { id: string }) {
    return this.service.delete(data.id);
  }

  @GrpcMethod('PortalMenuService', 'GetQuickSetupData')
  async getQuickSetupData() {
    const result = await this.service.getQuickSetupData();
    return {
      docGroups: (result.docGroups || []).map(i => this.sanitizeQuickSetupItem(i)),
      complianceModules: (result.complianceModules || []).map(i => this.sanitizeQuickSetupItem(i)),
      defaultPages: (result.defaultPages || []).map(i => this.sanitizeQuickSetupItem(i)),
    };
  }

  private sanitizeQuickSetupItem(item: any) {
    return {
      id: item.id || '',
      name: item.name || '',
      path: item.path || '',
      icon: item.icon || '',
      order: Number(item.order) || 0,
    };
  }

  private mapToProto(menu: any): any {
    if (!menu) {
      return {
        id: '',
        name: '',
        nameEn: '',
        description: '',
        descriptionEn: '',
        icon: '',
        link: '',
        order: 0,
        parentId: '',
        isActive: false,
        target: '_self',
        type: 'URL',
        referenceId: '',
        position: 'HORIZONTAL',
        children: [],
        createdAt: '',
        updatedAt: '',
      };
    }
    return {
      id: menu.id || '',
      name: menu.name || '',
      description: menu.description || '',
      translations: menu.translations ? JSON.stringify(menu.translations) : '{}',
      icon: menu.icon || '',
      link: menu.link || '',
      order: Number(menu.order) || 0,
      parentId: menu.parentId || '',
      isActive: !!menu.isActive,
      target: menu.target || '_self',
      type: menu.type || 'URL',
      referenceId: menu.referenceId || '',
      position: menu.position || 'HORIZONTAL',
      children: Array.isArray(menu.children)
        ? menu.children.filter((c: any) => !!c).map((c: any) => this.mapToProto(c))
        : [],
      createdAt: menu.createdAt ? (typeof menu.createdAt === 'string' ? menu.createdAt : menu.createdAt.toISOString()) : '',
      updatedAt: menu.updatedAt ? (typeof menu.updatedAt === 'string' ? menu.updatedAt : menu.updatedAt.toISOString()) : '',
    };
  }
}
