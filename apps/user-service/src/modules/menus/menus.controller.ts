import { Controller } from '@nestjs/common';
import {  GrpcMethod, RpcException , Payload } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { MenusService } from './menus.service';

@Controller()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

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
      target: node.target ?? 'SELF',
      parentId: node.parentId ?? 0,
      isActive: node.isActive ?? true,
      linkedResourceCode: node.linkedResourceCode ?? null,
      type: node.type ?? 'MENU',
      children:
        node.children && node.children.length
          ? node.children.map((c: any) => this.mapMenuNode(c))
          : [],
    };
  }

  @GrpcMethod('MenuService', 'GetMyMenus')
  async getMyMenus(@Payload() data: Record<string, any>) {
    const userId = data.userId ?? data.user_id;
    const tree = await this.menusService.getMyMenus(
      typeof userId === 'number' ? userId : Number(userId),
    );
    return {
      data: tree.map((node: any) => this.mapMenuNode(node)),
    };
  }

  @GrpcMethod('MenuService', 'GetAll')
  async getAll() {
    const items = await this.menusService.getAll();
    return { data: items };
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
  async create(@Payload() data: Record<string, any>) {
    try {
      const menu = await this.menusService.create({
        code: data.code,
        name: data.name,
        route: data.route,
        icon: data.icon,
        order: data.order,
        description: data.description,
        iconColor: data.iconColor,
        target: data.target,
        parentId: data.parentId === 0 ? null : data.parentId,
        isActive: data.isActive,
        linkedResourceCode: data.linkedResourceCode,
        type: data.type,
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
  async update(data: { id: number; [k: string]: any }) {
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
        target: rest.target,
        parentId: rest.parentId === 0 ? null : rest.parentId,
        isActive: rest.isActive,
        linkedResourceCode: rest.linkedResourceCode,
        type: rest.type,
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
