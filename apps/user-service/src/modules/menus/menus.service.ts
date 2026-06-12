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
  isActive?: boolean;
  /** PBAC chuẩn: resource.code để kiểm soát hiển thị menu */
  linkedResourceCode?: string | null;
};

export type UpdateMenuDto = Partial<CreateMenuDto>;

@Injectable()
export class MenusService {
  private menuCache = new Map<string, { data: any, expiresAt: number }>();
  private readonly CACHE_TTL_MS = 300 * 1000; // 5 minutes

  constructor(private prisma: PrismaService) { }

  async getAll(application = 'ADMIN_PORTAL') {
    const list = await this.prisma.menu.findMany({
      where: { application },
      orderBy: [{ order: 'asc' }, { id: 'asc' }],
    });
    return list.map((m) => this.toFlat(m));
  }

  async getById(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
    });
    if (!menu) return null;
    return this.toFlat(menu);
  }

  async create(dto: CreateMenuDto) {
    const code = (dto.code ?? '').trim();
    if (!code) throw new Error('Mã menu (code) không được để trống.');
    const existing = await this.prisma.menu.findUnique({ where: { code } });
    if (existing) throw new Error(`Mã menu "${code}" đã tồn tại.`);

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
        linkedResourceCode: dto.linkedResourceCode ?? null,
      },
    });

    this.menuCache.clear();
    return this.toFlat(menu);
  }

  async update(id: number, dto: UpdateMenuDto) {
    const menu = await this.prisma.menu.findUnique({ where: { id } });
    if (!menu) return null;

    if (dto.code !== undefined) {
      const code = String(dto.code).trim();
      if (!code) throw new Error('Mã menu (code) không được để trống.');
      const existing = await this.prisma.menu.findUnique({ where: { code } });
      if (existing && existing.id !== id)
        throw new Error(`Mã menu "${code}" đã được sử dụng bởi menu khác.`);
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
        ...(dto.parentId !== undefined && {
          parentId:
            dto.parentId === null || dto.parentId === 0 ? null : dto.parentId,
        }),
        ...(dto.isActive !== undefined && { isActive: dto.isActive }),
        // PBAC chuẩn: cập nhật linkedResourceCode (null = công khai)
        ...(dto.linkedResourceCode !== undefined && {
          linkedResourceCode: dto.linkedResourceCode || null,
        }),
      },
    });

    this.menuCache.clear();
    return this.toFlat(updated);
  }

  async delete(id: number) {
    const menu = await this.prisma.menu.findUnique({
      where: { id },
      include: { children: true },
    });
    if (!menu) return false;
    if (menu.children.length > 0) {
      throw new Error(
        'Không thể xóa menu có menu con. Hãy xóa menu con trước.',
      );
    }
    await this.prisma.menu.delete({ where: { id } });
    this.menuCache.clear();
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
    linkedResourceCode?: string | null;
  }) {
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
      linkedResourceCode: m.linkedResourceCode ?? null,
      isActive: m.isActive,
    };
  }

  async getMyMenus(userId: number, application = 'ADMIN_PORTAL') {
    // 1. Lấy tất cả quyền của User
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        roles: { include: { policies: { include: { resource: true } } } },
      },
    });

    const isSuperAdmin = user?.roles?.some(r => r.code === 'SUPER_ADMIN') ?? false;

    // PBAC chuẩn: Set resource codes mà user có quyền (bất kỳ action nào)
    const allowedResources = new Set<string>();

    for (const role of user?.roles ?? []) {
      for (const p of role.policies ?? []) {
        if (p.resource?.code) {
          allowedResources.add(p.resource.code);
        }
      }
    }

    // 2. Query Menu
    const rawMenus = await this.prisma.menu.findMany({
      where: { application, isActive: true },
      orderBy: { order: 'asc' },
    });

    const visibleMenus = rawMenus.filter((menu) => {
      if (isSuperAdmin) return true;

      // PBAC chuẩn: dùng linkedResourceCode (ưu tiên)
      if (menu.linkedResourceCode) {
        return allowedResources.has(menu.linkedResourceCode);
      }

      // Nếu không cấu hình resource (public)
      return true;
    });

    // 3. Dựng cây
    const menuTree = buildTree(visibleMenus, null);

    // 4. Cắt tỉa menu cha rỗng
    const result = pruneEmptyParents(menuTree);

    return result;
  }
}
