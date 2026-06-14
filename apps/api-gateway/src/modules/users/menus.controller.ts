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
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { sanitizeUserForClient } from '../../common/utils/user.util';

interface MenuDto {
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

/** Map flat menu từ gRPC sang frontend. */
function toFrontendItem(m: MenuDto): MenuDto {
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
    // Chỉ thêm node vào danh sách khi có route thực sự (không rỗng)
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

@ApiTags('Menu')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class MenusController implements OnModuleInit {
  private menuService: any;

  constructor(
    @Inject(MICROSERVICES.MENU.SYMBOL) private readonly client: any,
  ) {}

  onModuleInit() {
    this.menuService = this.client.getService(MICROSERVICES.MENU.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách menu (flat) cho trang quản lý menu' })
  @ApiResponse({ status: 200, description: 'Mảng menu phẳng' })
  async getAll(@Query('app') app?: string) {
    const res = (await firstValueFrom(
      this.menuService.GetAll({}),
    )) as any;
    const items = res?.items ?? [];
    return items.map(toFrontendItem);
  }

  @Get('me')
  @ApiOperation({ summary: 'Menu sidebar theo user đăng nhập và ứng dụng' })
  @ApiQuery({
    name: 'app',
    required: false,
    description: 'ADMIN_PORTAL | CITIZEN_PORTAL',
    example: 'ADMIN_PORTAL',
  })
  @ApiResponse({ status: 200, description: 'Cây menu (chỉ mục user có quyền)' })
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
      }),
    );

    if (response) {
      if (!response.meta) response.meta = {};
      response.meta.currentUser = sanitizeUserForClient(req.user);
      const branches = getRealBranches(response.items ?? []);
      response.hubApps = this.buildHubApps(branches);
      response.sidebarMenus = this.buildSidebarMenus(branches);
    }
    return response;
  }

  @Get('hub')
  @ApiOperation({
    summary: 'Danh sách phân hệ cho trang Hub (chỉ root cards, không sidebar)',
  })
  @ApiQuery({ name: 'app', required: false, example: 'ADMIN_PORTAL' })
  @ApiResponse({ status: 200, description: 'Mảng AppItem cho Hub' })
  async getHubApps(@Req() req: any, @Query('app') app?: string) {
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
      }),
    );
    const branches = getRealBranches(response?.items ?? []);
    return { apps: this.buildHubApps(branches) };
  }

  @Get('sidebar')
  @ApiOperation({
    summary: 'Sidebar items theo service (load khi user chọn phân hệ)',
  })
  @ApiQuery({
    name: 'code',
    required: true,
    description: 'Menu code của service root (VD: HRM_GROUP)',
    example: 'HRM_GROUP',
  })
  @ApiQuery({ name: 'app', required: false, example: 'ADMIN_PORTAL' })
  @ApiResponse({ status: 200, description: 'Sidebar items cho 1 service' })
  async getServiceSidebar(
    @Req() req: any,
    @Query('code') code: string,
    @Query('app') app?: string,
  ) {
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
      }),
    );
    const branches = getRealBranches(response?.items ?? []);
    const sidebarMenus = this.buildSidebarMenus(branches);
    const sidebar =
      sidebarMenus.find((s: any) => s.serviceCode === code) ?? null;
    return { sidebar };
  }

  // ---- Private BFF helpers ----

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

  /** Chuẩn hóa body từ frontend sang payload gRPC */
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

  @Post()
  @ApiOperation({ summary: 'Tạo menu mới (PBAC: quyền gắn với Permission)' })
  @ApiBody({ description: 'Thông tin menu' })
  @ApiResponse({ status: 201, description: 'Menu đã tạo' })
  async create(@Body() body: MenuDto) {
    try {
      const payload = this.toCreatePayload(body);
      const res = (await firstValueFrom(
        this.menuService.Create(payload),
      )) as any;
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi tạo menu';
      throw new BadRequestException(
        typeof message === 'string' ? message : message,
      );
    }
  }

  /** Chuẩn hóa body cập nhật sang gRPC */
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

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật menu (PBAC: quyền gắn với Permission)' })
  @ApiResponse({ status: 200, description: 'Menu đã cập nhật' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: MenuDto) {
    try {
      const payload = this.toUpdatePayload(id, body);
      const res = (await firstValueFrom(
        this.menuService.Update(payload),
      )) as any;
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi cập nhật menu';
      throw new BadRequestException(
        typeof message === 'string' ? message : message,
      );
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa menu' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(this.menuService.Delete({ id }))) as any;
    return {
      success: res?.success ?? true,
      message: res?.message ?? 'Đã xóa menu',
    };
  }
}
