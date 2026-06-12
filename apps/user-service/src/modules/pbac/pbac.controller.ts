import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PbacService } from './pbac.service';

@Controller()
export class PbacController {
  constructor(private readonly pbacService: PbacService) { }

  private toRoleResponse(role: {
    id: number;
    code: string;
    name: string | null;
    description: string | null;
  }) {
    return {
      id: role.id,
      code: role.code,
      name: role.name ?? '',
      description: role.description ?? '',
    };
  }

  @GrpcMethod('PbacService', 'CreateRole')
  async createRole(data: {
    code: string;
    name: string;
    description?: string;
    policies?: any[];
  }) {
    const role = await this.pbacService.createRole({
      code: data.code,
      name: data.name,
      description: data.description,
      policies: data.policies,
    });
    return this.toRoleResponse(role);
  }

  @GrpcMethod('PbacService', 'FindAllRoles')
  async findAllRoles() {
    const list = await this.pbacService.findAllRoles();
    return {
      roles: list.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name ?? '',
        description: r.description ?? '',
        usersCount: r._count?.users ?? 0,
        permissionsCount: r._count?.policies ?? 0,
      })),
    };
  }

  @GrpcMethod('PbacService', 'FindOneRole')
  async findOneRole(data: { id: number }) {
    const role = await this.pbacService.findOneRole(data.id);
    if (!role)
      return { id: 0, code: '', name: '', description: '', policies: [] };
    return {
      id: role.id,
      code: role.code,
      name: role.name ?? '',
      description: role.description ?? '',
      policies: (role.policies ?? []).map((p: any) => ({
        id: p.id,
        action: p.action,
        resourceId: p.resourceId,
        effect: p.effect,
        conditions: p.conditions,
      })),
    };
  }

  @GrpcMethod('PbacService', 'UpdateRole')
  async updateRole(data: {
    id: number;
    name?: string;
    description?: string;
    policies?: any[];
  }) {
    const role = await this.pbacService.updateRole(data.id, {
      name: data.name,
      description: data.description,
      policies: data.policies,
    });
    return this.toRoleResponse(role);
  }

  @GrpcMethod('PbacService', 'DeleteRole')
  async deleteRole(data: { id: number }) {
    const role = await this.pbacService.deleteRole(data.id);
    return this.toRoleResponse(role);
  }

  @GrpcMethod('PbacService', 'GetResources')
  async getResources() {
    const resources = await this.pbacService.getResources();
    return { resources: resources.map(r => ({ id: r.id, code: r.code, name: r.name, service_code: r.serviceCode })) };
  }

  @GrpcMethod('PbacService', 'CreateResource')
  async createResource(data: { code: string; name: string; serviceCode?: string }) {
    const resource = await this.pbacService.createResource(data);
    return { id: resource.id, code: resource.code, name: resource.name };
  }

  @GrpcMethod('PbacService', 'UpdateResource')
  async updateResource(data: { id: number; code?: string; name?: string; serviceCode?: string }) {
    const resource = await this.pbacService.updateResource(data.id, {
      code: data.code,
      name: data.name,
      serviceCode: data.serviceCode,
    });
    if (!resource)
      throw new RpcException({ message: 'Resource not found', code: 5 });
    return { id: resource.id, code: resource.code, name: resource.name };
  }

  @GrpcMethod('PbacService', 'DeleteResource')
  async deleteResource(data: { id: number }) {
    const ok = await this.pbacService.deleteResource(data.id);
    return {
      success: ok,
      message: ok ? 'Đã xóa tài nguyên' : 'Không tìm thấy',
    };
  }
}
