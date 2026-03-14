import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { PbacService } from './pbac.service';

@Controller()
export class PbacController {
  constructor(private readonly pbacService: PbacService) {}

  private toRoleResponse(role: { id: number; code: string; name: string | null; description: string | null }) {
    return {
      id: role.id,
      code: role.code,
      name: role.name ?? '',
      description: role.description ?? '',
    };
  }

  @GrpcMethod('PbacService', 'CreateRole')
  async createRole(data: { code: string; name: string; description?: string; permissionIds?: number[] }) {
    const role = await this.pbacService.createRole({
      code: data.code,
      name: data.name,
      description: data.description,
      permissionIds: data.permissionIds,
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
        permissionsCount: r._count?.permissions ?? 0,
      })),
    };
  }

  @GrpcMethod('PbacService', 'FindOneRole')
  async findOneRole(data: { id: number }) {
    const role = await this.pbacService.findOneRole(data.id);
    if (!role) return { id: 0, code: '', name: '', description: '', permissions: [] };
    return {
      id: role.id,
      code: role.code,
      name: role.name ?? '',
      description: role.description ?? '',
      permissions: (role.permissions ?? []).map((p: any) => ({
        id: p.id,
        action: p.action,
        resourceId: p.resourceId,
      })),
    };
  }

  @GrpcMethod('PbacService', 'UpdateRole')
  async updateRole(data: { id: number; name?: string; description?: string; permissionIds?: number[] }) {
    const role = await this.pbacService.updateRole(data.id, {
      name: data.name,
      description: data.description,
      permissionIds: data.permissionIds,
    });
    return this.toRoleResponse(role);
  }

  @GrpcMethod('PbacService', 'DeleteRole')
  async deleteRole(data: { id: number }) {
    const role = await this.pbacService.deleteRole(data.id);
    return this.toRoleResponse(role);
  }

  @GrpcMethod('PbacService', 'GetPermissionMatrix')
  async getPermissionMatrix() {
    const resources = await this.pbacService.getPermissionMatrix();
    return {
      resources: resources.map((r: any) => ({
        id: r.id,
        code: r.code,
        name: r.name,
        permissions: (r.permissions ?? []).map((p: any) => ({
          id: p.id,
          action: p.action,
          resourceId: p.resourceId,
        })),
      })),
    };
  }

  @GrpcMethod('PbacService', 'CreateResource')
  async createResource(data: { code: string; name: string }) {
    const resource = await this.pbacService.createResource(data);
    return { id: resource.id, code: resource.code, name: resource.name };
  }

  @GrpcMethod('PbacService', 'UpdateResource')
  async updateResource(data: { id: number; code?: string; name?: string }) {
    const resource = await this.pbacService.updateResource(data.id, { code: data.code, name: data.name });
    if (!resource) throw new RpcException({ message: 'Resource not found', code: 5 });
    return { id: resource.id, code: resource.code, name: resource.name };
  }

  @GrpcMethod('PbacService', 'DeleteResource')
  async deleteResource(data: { id: number }) {
    const ok = await this.pbacService.deleteResource(data.id);
    return { success: ok, message: ok ? 'Đã xóa tài nguyên' : 'Không tìm thấy' };
  }

  @GrpcMethod('PbacService', 'CreatePermission')
  async createPermission(data: { resourceId?: number; resource_id?: number; action: string }) {
    const resourceId = data.resourceId ?? data.resource_id;
    if (!resourceId) throw new RpcException({ message: 'resource_id required', code: 3 });
    const permission = await this.pbacService.createPermission({ resourceId, action: data.action });
    return { id: permission.id, action: permission.action, resource_id: permission.resourceId };
  }

  @GrpcMethod('PbacService', 'DeletePermission')
  async deletePermission(data: { id: number }) {
    const ok = await this.pbacService.deletePermission(data.id);
    return { success: ok, message: ok ? 'Đã xóa quyền' : 'Không tìm thấy' };
  }
}
