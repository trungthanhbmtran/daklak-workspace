import { Injectable } from '@nestjs/common';
import { PrismaService } from '@/database/prisma.service';
import { buildTree, pruneEmptyParents } from '@/common/utils/tree.util';

export type CreateMenuDto = {
  code: string;
  name: string;
  route?: string;
  icon?: string;
  order?: number;
  description?: string | null;
  iconColor?: string | null;
  service?: string;
  application?: string;
  target?: string;
  parentId?: number | null;
  requiredPermissionIds?: number[];
  isActive?: boolean;
};

export type UpdateMenuDto = Partial<CreateMenuDto>;

@Injectable()
export class MenusService {
  constructor(private prisma: PrismaService) {}

  async getAll(application = 'ADMIN_PORTAL') {
    const list = await this.prisma.menu.findMany({
      where: { application },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
      include: { requiredPermissions: { select: { permissionId: true } } },
    });
    return list.map((m) => this.toFlat(m));
  }

  async getById(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { requiredPermissions: { select: { permissionId: true } } },
    });
    if (!menu) return null;
    return this.toFlat(menu);
  }

  async create(dto: CreateMenuDto) {
    const code = (dto.code ?? '').trim();
    if (!code) throw new Error('Mã menu (code) không được để trống.');
    const existing = await this.prisma.menu.findUnique({ where: { code } });
    if (existing) throw new Error(`Mã menu "${code}" đã tồn tại.`);

    const permIds = (dto.requiredPermissionIds ?? []).filter((id) => id != null && id !== 0);
    if (permIds.length > 0) {
      const found = await this.prisma.permission.findMany({ where: { id: { in: permIds } } });
      const foundIds = new Set(found.map((p) => p.id));
      const missing = permIds.filter((id) => !foundIds.has(id));
      if (missing.length > 0) {
        throw new Error(`Quyền (Permission) id=${missing.join(', ')} không tồn tại trong hệ thống PBAC.`);
      }
    }

    const menu = await this.prisma.menu.create({
      data: {
        code,
        name: dto.name ?? '',
        route: dto.route ?? null,
        icon: dto.icon ?? null,
        order: dto.order ?? 0,
        description: dto.description ?? null,
        iconColor: dto.iconColor ?? null,
        service: dto.service ?? null,
        application: dto.application ?? 'ADMIN_PORTAL',
        target: dto.target ?? 'SELF',
        parentId: dto.parentId ?? null,
        isActive: dto.isActive ?? true,
        requiredPermissions: permIds.length > 0 ? { create: permIds.map((permissionId) => ({ permissionId })) } : undefined,
      },
    });
    const withPerms = await this.prisma.menu.findUnique({
      where: { id: menu.id },
      include: { requiredPermissions: { select: { permissionId: true } } },
    });
    return this.toFlat(withPerms ?? menu);
  }

  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) return null;

    if (dto.code !== undefined) {
      const code = String(dto.code).trim();
      if (!code) throw new Error('Mã menu (code) không được để trống.');
      const existing = await this.prisma.menu.findUnique({ where: { code } });
      if (existing && existing.id !== id) throw new Error(`Mã menu "${code}" đã được sử dụng bởi menu khác.`);
    }

    if (dto.requiredPermissionIds !== undefined) {
      const permIds = (dto.requiredPermissionIds ?? []).filter((id) => id != null && id !== 0);
      if (permIds.length > 0) {
        const found = await this.prisma.permission.findMany({ where: { id: { in: permIds } } });
        const foundIds = new Set(found.map((p) => p.id));
        const missing = permIds.filter((id) => !foundIds.has(id));
        if (missing.length > 0) {
          throw new Error(`Quyền (Permission) id=${missing.join(', ')} không tồn tại trong hệ thống PBAC.`);
        }
      }
      await (this.prisma as any).menuRequiredPermission.deleteMany({ where: { menuId: id } });
      if (permIds.length > 0) {
        await (this.prisma as any).menuRequiredPermission.createMany({
          data: permIds.map((permissionId: number) => ({ menuId: id, permissionId })),
        });
      }
    }

    const updated = await this.prisma.menu.update({
      where: { id },
      data: {
        ...(dto.code !== undefined && { code: String(dto.code).trim() }),
        ...(dto.name !== undefined && { name: dto.name }),
        ...(dto.route !== undefined && { route: dto.route }),
        ...(dto.icon !== undefined && { icon: dto.icon }),
        ...(dto.order !== undefined && { order: dto.order }),
        ...(dto.description !== undefined && { description: dto.description }),
        ...(dto.iconColor !== undefined && { iconColor: dto.iconColor }),
        ...(dto.service !== undefined && { service: dto.service }),
        ...(dto.application !== undefined && { application: dto.application }),
        ...(dto.target !== undefined && { target: dto.target }),
        ...(dto.parentId !== undefined && { parentId: dto.parentId === null || dto.parentId === 0 ? null : dto.parentId }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
      },
    });
    const withPerms = await this.prisma.menu.findUnique({
      where: { id: updated.id },
      include: { requiredPermissions: { select: { permissionId: true } } },
    });
    return this.toFlat(withPerms ?? updated);
  }

  async delete(id: number) {
    const menu = await this.prisma.menu.findUnique({ where: { id }, include: { children: true } });
    if (!menu) return false;
    if (menu.children.length > 0) {
      throw new Error('Không thể xóa menu có menu con. Hãy xóa menu con trước.');
    }
    await this.prisma.menu.delete({ where: { id } });
    return true;
  }

  private toFlat(m: {
    id: number;
    code: string;
    name: string;
    route: string | null;
    icon: string | null;
    order: number;
    description?: string | null;
    iconColor?: string | null;
    service: string | null;
    application: string;
    target: string;
    parentId: number | null;
    isActive: boolean;
    requiredPermissions?: { permissionId: number }[];
  }) {
    const requiredPermissionIds = m.requiredPermissions?.map((rp) => rp.permissionId) ?? [];
    return {
      id: m.id,
      code: m.code,
      name: m.name,
      route: m.route ?? '',
      icon: m.icon ?? '',
      order: m.order,
      description: m.description ?? null,
      iconColor: m.iconColor ?? null,
      service: m.service ?? '',
      application: m.application,
      target: m.target,
      parentId: m.parentId ?? 0,
      requiredPermissionIds,
      isActive: m.isActive,
    };
  }

  async getMyMenus(userId: number, application = 'ADMIN_PORTAL') {
    // 1. Lấy tất cả quyền của User
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { permissions: true } },
      },
    });

    const permissionIds = (user?.roles ?? [])
      .flatMap((r) => r.permissions ?? [])
      .map((p) => p.id);

    // 2. Query Menu: hiển thị nếu công khai (không yêu cầu quyền) HOẶC user có ít nhất 1 quyền trong danh sách yêu cầu
    const rawMenus = await this.prisma.menu.findMany({
      where: { application, isActive: true },
      orderBy: { order: 'asc' },
      include: { requiredPermissions: { select: { permissionId: true } } },
    });
    const userPermSet = new Set(permissionIds ?? []);
    const visibleMenus = rawMenus.filter((menu) => {
      const requiredIds = menu.requiredPermissions?.map((rp) => rp.permissionId) ?? [];
      if (requiredIds.length === 0) return true; // công khai
      return requiredIds.some((pid) => userPermSet.has(pid));
    });

    // 3. Dựng cây (dùng danh sách đã lọc theo quyền)
    const menuTree = buildTree(visibleMenus, null);

    // 4. Cắt tỉa menu cha rỗng (Quan trọng)
    return pruneEmptyParents(menuTree);
  }
}