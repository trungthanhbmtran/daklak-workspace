import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Inject,
  Req,
  UseGuards,
  OnModuleInit,
  ParseIntPipe,
  BadRequestException,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { sanitizeUserForClient } from '../../common/utils/user.util';

interface MenuDto {
  id?: number;
  code?: string;
  name?: string;
  path?: string;
  route?: string;
  icon?: string;
  parentId?: number | null;
  service?: string;
  portal?: string;
  application?: string;
  target?: string;
  sort?: number;
  order?: number;
  active?: number;
  isActive?: boolean;
  description?: string | null;
  iconColor?: string | null;
  requiredPermissionIds?: number[];
  [key: string]: unknown;
}

/** Map flat menu tá»« gRPC sang frontend. */
function toFrontendItem(m: MenuDto): MenuDto {
  return {
    id: m.id,
    code: m.code ?? '',
    name: m.name ?? '',
    path: m.route ?? '',
    icon: m.icon ?? '',
    parentId: m.parentId === 0 ? null : m.parentId,
    service: m.service ?? '',
    portal: m.application ?? 'ADMIN_PORTAL',
    target: m.target ?? 'SELF',
    sort: m.order ?? 0,
    active: m.isActive ? 1 : 0,
    description: m.description ?? null,
    iconColor: m.iconColor ?? null,
    requiredPermissionIds: m.requiredPermissionIds ?? [],
  };
}

const joinPath = (base: string, path: string) => {
  return `${base}/${path}`.replace(/\/+/g, '/');
};

const getRealBranches = (nodes: any[]): any[] => {
  if (
    nodes.length === 1 &&
    !nodes[0].route &&
    Array.isArray(nodes[0].children)
  ) {
    return nodes[0].children;
  }
  return nodes;
};

const flattenMenus = (nodes: any[], basePath: string): any[] => {
  return nodes.reduce<any[]>((acc, node) => {
    const route = (node.route ?? '').trim();
    if (route !== undefined && route !== null) {
      acc.push({
        name: (node.name ?? '').trim(),
        href: joinPath(basePath, route),
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

@ApiTags('Menu')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class MenusController implements OnModuleInit {
  private menuService: any;

  constructor(
    @Inject(MICROSERVICES.MENU.SYMBOL) private readonly client: any,
  ) { }

  onModuleInit() {
    this.menuService = this.client.getService(MICROSERVICES.MENU.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách menu (flat) cho trang qu?n lý menu' })
  @ApiResponse({ status: 200, description: 'M?ng menu ph?ng' })
  async getAll(@Query('app') app?: string) {
    const res = (await firstValueFrom(
      this.menuService.GetAll({ app: app || 'ADMIN_PORTAL' }),
    )) as any;
    const items = res?.items ?? [];
    return items.map(toFrontendItem);
  }

  @Get('me')
  @ApiOperation({ summary: 'Menu sidebar theo user dang nh?p và ?ng d?ng' })
  @ApiQuery({
    name: 'app',
    required: false,
    description: 'ADMIN_PORTAL | CITIZEN_PORTAL',
    example: 'ADMIN_PORTAL',
  })
  @ApiResponse({ status: 200, description: 'Cây menu (ch? m?c user có quy?n)' })
  async getMyMenus(@Req() req: any, @Query('app') app?: string) {
    const rawId = req.user?.id ?? req.user?.userId;
    const userId =
      rawId != null && rawId !== ''
        ? typeof rawId === 'number'
          ? rawId
          : parseInt(String(rawId), 10)
        : 0;
    const response: any = await firstValueFrom(
      this.menuService.GetMyMenus({
        userId: Number.isNaN(userId) ? 0 : userId,
        app: app || 'ADMIN_PORTAL',
      }),
    );

    // Bá»• sung meta chá»©a currentUser Ä‘á»ƒ Frontend (HubClient) dÃ¹ng
    if (response) {
      if (!response.meta) response.meta = {};
      response.meta.currentUser = sanitizeUserForClient(req.user);

      // --- BFF Logic: TÃ­nh toÃ¡n cáº¥u trÃºc hiá»ƒn thá»‹ cho Frontend ---
      const branches = getRealBranches(response.items ?? []);

      response.hubApps = branches
        .filter((b: any) => (b.service ?? '').trim() !== '')
        .map((b: any) => {
          const svcCode = (b.service ?? '').trim();
          const basePath =
            (b.route ?? '').trim() ||
            `/services/${svcCode.toLowerCase().replace('_service', '')}`;

          let href = basePath;
          if (b.children && b.children.length > 0) {
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
            id: svcCode,
            title: (b.name ?? '').trim() || svcCode,
            desc: (b.description ?? '').trim() || 'Phân h? nghi?p v?',
            href,
            icon: b.icon ?? '',
            iconColor: (b.iconColor ?? '').trim() || null,
            disabled: false,
          };
        });

      response.sidebarMenus = branches.map((b: any) => {
        const svcCode = (b.service ?? '').trim();
        const basePath = (b.route ?? '').trim();
        const items = flattenMenus(b.children ?? [], basePath).sort(
          (a: any, b: any) => a.order - b.order,
        );

        return {
          serviceCode: svcCode,
          serviceName: (b.name ?? '').trim() || svcCode,
          serviceIcon: b.icon ?? '',
          basePath,
          items,
        };
      });
    }

    return response;
  }

  /** Chuáº©n hÃ³a body tá»« frontend sang payload gRPC */
  private toCreatePayload(body: MenuDto) {
    return {
      code: body.code,
      name: body.name,
      route: body.path,
      icon: body.icon,
      order: body.sort,
      description: body.description,
      iconColor: body.iconColor,
      service: body.service,
      application: body.portal,
      target: body.target,
      parentId: body.parentId ?? 0,
      requiredPermissionIds: Array.isArray(body.requiredPermissionIds)
        ? body.requiredPermissionIds.map(Number).filter(Boolean)
        : [],
      isActive: body.active !== 0,
    };
  }

  @Post()
  @ApiOperation({ summary: 'T?o menu m?i (PBAC: quy?n gán v?i Permission)' })
  @ApiBody({ description: 'Thông tin menu' })
  @ApiResponse({ status: 201, description: 'Menu dã t?o' })
  async create(@Body() body: MenuDto) {
    try {
      const payload = this.toCreatePayload(body);
      const res = (await firstValueFrom(
        this.menuService.Create(payload),
      )) as any;
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'L?i t?o menu';
      throw new BadRequestException(
        typeof message === 'string' ? message : message,
      );
    }
  }

  /** Chuáº©n hÃ³a body cáº­p nháº­t sang gRPC */
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
      service: body.service,
      application: body.portal,
      target: body.target,
    };
    if (body.parentId !== undefined) payload.parentId = body.parentId ?? 0;
    if (body.requiredPermissionIds !== undefined) {
      payload.requiredPermissionIds = Array.isArray(body.requiredPermissionIds)
        ? body.requiredPermissionIds.map(Number).filter(Boolean)
        : [];
    }
    if (body.active !== undefined) payload.isActive = body.active !== 0;

    return payload;
  }

  @Put(':id')
  @ApiOperation({ summary: 'C?p nh?t menu (PBAC: quy?n gán v?i Permission)' })
  @ApiResponse({ status: 200, description: 'Menu dã c?p nh?t' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: MenuDto) {
    try {
      const payload = this.toUpdatePayload(id, body);
      const res = (await firstValueFrom(
        this.menuService.Update(payload),
      )) as any;
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'L?i c?p nh?t menu';
      throw new BadRequestException(
        typeof message === 'string' ? message : message,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa menu' })
  @ApiResponse({ status: 200, description: 'Ðã xóa' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(this.menuService.Delete({ id }))) as any;
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'Ðã xóa menu',
    };
  }
}
