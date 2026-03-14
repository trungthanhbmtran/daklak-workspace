import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { MenusService } from './menus.service';

@Controller()
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  private normalizePermissionIds(raw: number[] | number | undefined): number[] {
    if (raw == null) return [];
    const arr = Array.isArray(raw) ? raw : [raw];
    return arr.map(Number).filter((id) => id > 0);
  }

  private mapMenuNode(node: any): any {
    const parentId = node.parentId ?? node.parent_id ?? 0;
    return {
      id: node.id,
      code: node.code ?? '',
      name: node.name ?? '',
      route: node.route ?? '',
      icon: node.icon ?? '',
      order: Number(node.order ?? 0),
      description: node.description ?? null,
      iconColor: node.iconColor ?? node.icon_color ?? null,
      service: node.service ?? '',
      application: node.application ?? 'ADMIN_PORTAL',
      target: node.target ?? 'SELF',
      parentId,
      isActive: node.isActive ?? node.is_active ?? true,
      children: (node.children && node.children.length)
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
      throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Menu not found' });
    }
    return { menu };
  }

  @GrpcMethod('MenuService', 'Create')
  async create(data: any) {
    try {
      const rawParentId = data.parentId ?? data.parent_id;
      const parentId = rawParentId === undefined || rawParentId === 0 ? null : Number(rawParentId);
      const requiredPermissionIds = this.normalizePermissionIds(data.requiredPermissionIds ?? data.required_permission_ids);
      const isActive = data.isActive ?? data.is_active;
      const menu = await this.menusService.create({
        code: String(data.code ?? '').trim() || `MENU_${Date.now()}`,
        name: String(data.name ?? '').trim() || 'Menu mới',
        route: data.route ?? undefined,
        icon: data.icon ?? undefined,
        order: Number(data.order ?? 0) || 0,
        description: data.description ?? undefined,
        iconColor: data.iconColor ?? data.icon_color ?? undefined,
        service: data.service ?? undefined,
        application: data.application ?? 'ADMIN_PORTAL',
        target: data.target ?? 'SELF',
        parentId,
        requiredPermissionIds,
        isActive: isActive === undefined ? true : Boolean(isActive),
      });
      return { menu };
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: e?.message ?? 'Lỗi tạo menu' });
    }
  }

  @GrpcMethod('MenuService', 'Update')
  async update(data: { id: number; [k: string]: any }) {
    try {
      const { id, ...rest } = data;
      const rawParentId = rest.parentId ?? rest.parent_id;
      const parentId = rawParentId === undefined ? undefined : (rawParentId === 0 ? null : Number(rawParentId));
      const requiredPermissionIds = rest.requiredPermissionIds !== undefined || rest.required_permission_ids !== undefined
        ? this.normalizePermissionIds(rest.requiredPermissionIds ?? rest.required_permission_ids ?? [])
        : undefined;
      const isActiveRaw = rest.isActive ?? rest.is_active;
      const order = rest.order !== undefined ? Number(rest.order) : undefined;
      const menu = await this.menusService.update(id, {
        code: rest.code != null ? String(rest.code).trim() : undefined,
        name: rest.name != null ? String(rest.name).trim() : undefined,
        route: rest.route,
        icon: rest.icon,
        order,
        description: rest.description !== undefined ? rest.description : undefined,
        iconColor: rest.iconColor ?? rest.icon_color,
        service: rest.service,
        application: rest.application,
        target: rest.target,
        parentId,
        requiredPermissionIds,
        isActive: isActiveRaw === undefined ? undefined : Boolean(isActiveRaw),
      });
      if (!menu) {
        throw new RpcException({ code: GrpcStatus.NOT_FOUND, message: 'Menu not found' });
      }
      return { menu };
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: e?.message ?? 'Lỗi cập nhật menu' });
    }
  }

  @GrpcMethod('MenuService', 'Delete')
  async delete(data: { id: number }) {
    try {
      const ok = await this.menusService.delete(data.id);
      return { success: ok, message: 'Đã xóa menu' };
    } catch (e: any) {
      if (e.message?.includes('menu con')) {
        throw new RpcException({ code: GrpcStatus.FAILED_PRECONDITION, message: e.message });
      }
      throw new RpcException({ code: GrpcStatus.INTERNAL, message: e.message });
    }
  }
}
