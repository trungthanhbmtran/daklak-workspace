import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { MenusService } from './menus.service';

@Controller()
export class MenusController {
  constructor(private readonly menusService: MenusService) { }

  private mapMenuNode(node: any): any {
    return {
      id: node.id,
      code: node.code ?? '',
      name: node.name ?? '',
      route: node.route ?? '',
      icon: node.icon ?? '',
      order: node.order ?? 0,
      description: node.description ?? null,
      iconColor: node.iconColor ?? null,
      service: node.service ?? '',
      application: node.application ?? 'ADMIN_PORTAL',
      target: node.target ?? 'SELF',
      parentId: node.parentId ?? 0,
      isActive: node.isActive ?? true,
      requiredPermissionIds: node.requiredPermissionIds ?? [],
      children:
        node.children && node.children.length
          ? node.children.map((c: any) => this.mapMenuNode(c))
          : [],
    };
  }

  @GrpcMethod('MenuService', 'GetMyMenus')
  async getMyMenus(data: any) {
    const userId = data.userId ?? data.user_id;
    const app = data.app ?? 'ADMIN_PORTAL';
    const tree = await this.menusService.getMyMenus(
      typeof userId === 'number' ? userId : Number(userId),
      app,
    );
    return {
      items: tree.map((node: any) => this.mapMenuNode(node)),
    };
  }

  @GrpcMethod('MenuService', 'GetAll')
  async getAll(data: any = {}) {
    const app = data?.app ?? 'ADMIN_PORTAL';
    const items = await this.menusService.getAll(app);
    return { items };
  }

  @GrpcMethod('MenuService', 'GetOne')
  async getOne(data: { id: number }) {
    const menu = await this.menusService.getById(data.id);
    if (!menu) {
      throw new RpcException({
        code: GrpcStatus.NOT_FOUND,
        message: 'Menu not found',
      });
    }
    return { menu };
  }

  @GrpcMethod('MenuService', 'Create')
  async create(data: any) {
    try {
      const menu = await this.menusService.create({
        code: data.code,
        name: data.name,
        route: data.route,
        icon: data.icon,
        order: data.order,
        description: data.description,
        iconColor: data.iconColor,
        service: data.service,
        application: data.application,
        target: data.target,
        parentId: data.parentId === 0 ? null : data.parentId,
        requiredPermissionIds: data.requiredPermissionIds ?? [],
        isActive: data.isActive,
      });
      return { menu };
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e?.message ?? 'Lỗi tạo menu',
      });
    }
  }

  @GrpcMethod('MenuService', 'Update')
  async update(data: { id: number;[k: string]: any }) {
    try {
      const { id, ...rest } = data;
      const menu = await this.menusService.update(id, {
        code: rest.code,
        name: rest.name,
        route: rest.route,
        icon: rest.icon,
        order: rest.order,
        description: rest.description,
        iconColor: rest.iconColor,
        service: rest.service,
        application: rest.application,
        target: rest.target,
        parentId: rest.parentId === 0 ? null : rest.parentId,
        requiredPermissionIds: rest.requiredPermissionIds,
        isActive: rest.isActive,
      });
      if (!menu) {
        throw new RpcException({
          code: GrpcStatus.NOT_FOUND,
          message: 'Menu not found',
        });
      }
      return { menu };
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: e?.message ?? 'Lỗi cập nhật menu',
      });
    }
  }

  @GrpcMethod('MenuService', 'Delete')
  async delete(data: { id: number }) {
    try {
      const ok = await this.menusService.delete(data.id);
      return { success: ok, message: 'Đã xóa menu' };
    } catch (e: any) {
      if (e.message?.includes('menu con')) {
        throw new RpcException({
          code: GrpcStatus.FAILED_PRECONDITION,
          message: e.message,
        });
      }
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }
}
