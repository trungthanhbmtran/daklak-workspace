import {
  Injectable,
  Inject,
  OnModuleInit,
  BadRequestException,
  InternalServerErrorException
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { sanitizeUserForClient } from '../../common/utils/user.util';

export interface MenuDto {
  id?: number;
  code?: string;
  name?: string;
  path?: string;
  route?: string;
  icon?: string;
  parentId?: number | null;
  target?: string;
  sort?: number;
  order?: number;
  active?: number;
  isActive?: boolean;
  description?: string | null;
  iconColor?: string | null;
  linkedResourceCode?: string | null;
  type?: string;
  [key: string]: unknown;
}

export function toFrontendItem(m: MenuDto): MenuDto {
  return {
    id: m.id,
    code: m.code ?? '',
    name: m.name ?? '',
    path: m.route ?? '',
    icon: m.icon ?? '',
    parentId: m.parentId === 0 ? null : m.parentId,
    target: m.target ?? 'SELF',
    sort: m.order ?? 0,
    active: m.isActive ? 1 : 0,
    description: m.description ?? null,
    iconColor: m.iconColor ?? null,
    linkedResourceCode: m.linkedResourceCode ?? null,
    type: m.type ?? 'MENU',
  };
}

export function buildMenuTree(items: MenuDto[]): any[] {
  const itemMap = new Map();
  items.forEach((item) => itemMap.set(item.id, { ...item, children: [] }));

  const tree: any[] = [];
  itemMap.forEach((item) => {
    if (item.parentId && itemMap.has(item.parentId)) {
      itemMap.get(item.parentId).children.push(item);
    } else {
      tree.push(item);
    }
  });
  return tree;
}

export const joinPath = (base: string, path: string) => {
  return `${base}/${path}`.replace(/\/+/g, '/');
};

export const getRealBranches = (nodes: any[]): any[] => {
  if (
    nodes.length === 1 &&
    !nodes[0].route &&
    Array.isArray(nodes[0].children)
  ) {
    return nodes[0].children;
  }
  return nodes;
};

export const flattenMenus = (nodes: any[], basePath: string): any[] => {
  return nodes.reduce<any[]>((acc, node) => {
    const route = (node.route ?? '').trim();
    if (route !== '') {
      const href = route.startsWith('/') ? route : joinPath(basePath, route);
      acc.push({
        name: (node.name ?? '').trim(),
        href,
        icon: node.icon ?? '',
        order: node.order ?? 0,
      });
    }
    if (Array.isArray(node.children) && node.children.length > 0) {
      acc.push(...flattenMenus(node.children, basePath));
    }
    return acc;
  }, []);
};

@Injectable()
export class MenusService implements OnModuleInit {
  private menuGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.MENU.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.menuGrpcService = this.client.getService(MICROSERVICES.MENU.SERVICE);
  }

  async getAll(app?: string) {
    const res = (await firstValueFrom(this.menuGrpcService.GetAll({})).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    const items = res?.data ?? [];
    return items.map(toFrontendItem);
  }

  async getMenuTree(app?: string) {
    const res = (await firstValueFrom(this.menuGrpcService.GetAll({})).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    const items = res?.data ?? [];
    const frontendItems = items.map(toFrontendItem);
    const tree = buildMenuTree(frontendItems);
    return tree;
  }

  async getMyMenus(user: any, app?: string) {
    const rawId = user?.id ?? user?.userId;
    const userId =
      rawId != null && rawId !== ''
        ? typeof rawId === 'number'
          ? rawId
          : parseInt(String(rawId), 10)
        : 0;
    const response: any = await firstValueFrom(
      this.menuGrpcService.GetMyMenus({
        userId: Number.isNaN(userId) ? 0 : userId,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });

    if (response) {
      if (!response.meta) response.meta = {};
      response.meta.currentUser = sanitizeUserForClient(user);
      const branches = getRealBranches(response.data ?? []);
      response.hubApps = this.buildHubApps(branches);
      response.sidebarMenus = this.buildSidebarMenus(branches);
    }
    return response;
  }

  async getHubApps(user: any, app?: string) {
    const rawId = user?.id ?? user?.userId;
    const userId =
      rawId != null && rawId !== ''
        ? typeof rawId === 'number'
          ? rawId
          : parseInt(String(rawId), 10)
        : 0;
    const response: any = await firstValueFrom(
      this.menuGrpcService.GetMyMenus({
        userId: Number.isNaN(userId) ? 0 : userId,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    const branches = getRealBranches(response?.data ?? []);
    return { apps: this.buildHubApps(branches) };
  }

  async getServiceSidebar(user: any, code: string, app?: string) {
    const rawId = user?.id ?? user?.userId;
    const userId =
      rawId != null && rawId !== ''
        ? typeof rawId === 'number'
          ? rawId
          : parseInt(String(rawId), 10)
        : 0;
    const response: any = await firstValueFrom(
      this.menuGrpcService.GetMyMenus({
        userId: Number.isNaN(userId) ? 0 : userId,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    const branches = getRealBranches(response?.data ?? []);
    const sidebarMenus = this.buildSidebarMenus(branches);
    const sidebar =
      sidebarMenus.find((s: any) => s.serviceCode === code) ?? null;
    return { sidebar };
  }

  private buildHubApps(branches: any[]) {
    return branches
      .filter((b: any) => b.type === 'SERVICE_ITEM')
      .map((b: any) => {
        const basePath = (b.route ?? '').trim();
        const menuCode = (b.code ?? '').trim();
        let href = basePath;
        if (b.children?.length) {
          const firstChild = [...b.children].sort(
            (x, y) => (x.order || 0) - (y.order || 0),
          )[0];
          if (firstChild.route) {
            href = firstChild.route.startsWith('/')
              ? firstChild.route
              : `${basePath}/${firstChild.route}`;
          }
        }
        href = href.replace(/([^:])\/\//g, '$1/');
        return {
          id: menuCode,
          title: (b.name ?? '').trim() || menuCode,
          desc: (b.description ?? '').trim() || 'Phân hệ nghiệp vụ',
          href,
          icon: b.icon ?? '',
          iconColor: (b.iconColor ?? '').trim() || null,
          disabled: false,
        };
      });
  }

  private buildSidebarMenus(branches: any[]) {
    return branches
      .filter((b: any) => b.type === 'SERVICE_ITEM')
      .map((b: any) => {
        const menuCode = (b.code ?? '').trim();
        const basePath = (b.route ?? '').trim();
        const items = flattenMenus(b.children ?? [], basePath).sort(
          (a: any, b: any) => a.order - b.order,
        );
        return {
          serviceCode: menuCode,
          serviceName: (b.name ?? '').trim() || menuCode,
          serviceIcon: b.icon ?? '',
          basePath,
          items,
        };
      });
  }

  private toCreatePayload(body: MenuDto) {
    return {
      code: body.code,
      name: body.name,
      route: body.path,
      icon: body.icon,
      order: body.sort,
      description: body.description,
      iconColor: body.iconColor,
      target: body.target ?? 'SELF',
      parentId: body.parentId ?? 0,
      isActive: body.active !== 0,
      linkedResourceCode: body.linkedResourceCode ?? null,
      type: body.type ?? 'MENU',
    };
  }

  async create(body: MenuDto) {
    try {
      const payload = this.toCreatePayload(body);
      const res = (await firstValueFrom(
        this.menuGrpcService.Create(payload),
      )) as any;
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi tạo menu';
      throw new BadRequestException(
        typeof message === 'string' ? message : message,
      );
    }
  }

  private toUpdatePayload(id: number, body: MenuDto) {
    const payload: any = {
      id,
      code: body.code,
      name: body.name,
      route: body.path,
      icon: body.icon,
      order: body.sort,
      description: body.description,
      iconColor: body.iconColor,
      target: body.target ?? 'SELF',
      linkedResourceCode: body.linkedResourceCode ?? null,
      type: body.type,
    };
    if (body.parentId !== undefined) payload.parentId = body.parentId ?? 0;
    if (body.active !== undefined) payload.isActive = body.active !== 0;

    return payload;
  }

  async update(id: number, body: MenuDto) {
    try {
      const payload = this.toUpdatePayload(id, body);
      const res = (await firstValueFrom(
        this.menuGrpcService.Update(payload),
      )) as any;
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi cập nhật menu';
      throw new BadRequestException(
        typeof message === 'string' ? message : message,
      );
    }
  }

  async delete(id: number) {
    const res = (await firstValueFrom(this.menuGrpcService.Delete({ id })).catch(
      (e) => {
        throw new InternalServerErrorException(e.message || 'RPC Call Failed');
      },
    )) as any;
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'Đã xóa menu',
    };
  }
}
