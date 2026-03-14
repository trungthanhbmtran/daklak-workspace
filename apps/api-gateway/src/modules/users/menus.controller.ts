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
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse, ApiQuery, ApiBody } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

/** Map flat menu từ gRPC (camelCase/snake_case) sang frontend; trả requiredPermissionIds (mảng). */
function toFrontendItem(m: any): any {
  const parentId = m.parentId ?? m.parent_id;
  const rawIds = m.requiredPermissionIds ?? m.required_permission_ids;
  const requiredPermissionIds = Array.isArray(rawIds)
    ? rawIds.map(Number).filter((id: number) => id > 0)
    : (m.requiredPermissionId ?? m.required_permission_id) != null && (m.requiredPermissionId ?? m.required_permission_id) !== 0
      ? [Number(m.requiredPermissionId ?? m.required_permission_id)]
      : [];
  const order = m.order ?? m.sort ?? 0;
  const application = m.application ?? m.portal ?? 'ADMIN_PORTAL';
  return {
    id: m.id,
    code: m.code ?? '',
    name: m.name ?? '',
    path: m.route ?? m.path ?? '',
    icon: m.icon ?? '',
    parentId: parentId === 0 || parentId === undefined ? null : Number(parentId),
    service: m.service ?? '',
    portal: application,
    target: m.target ?? 'SELF',
    sort: Number(order),
    active: (m.isActive ?? m.is_active ?? true) ? 1 : 0,
    description: m.description ?? null,
    iconColor: m.iconColor ?? m.icon_color ?? null,
    requiredPermissionIds,
  };
}

@ApiTags('Menu')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard)
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
      this.menuService.GetAll({ app: app || 'ADMIN_PORTAL' }),
    )) as { items?: any[] };
    const items = res?.items ?? [];
    return items.map(toFrontendItem);
  }

  @Get('me')
  @ApiOperation({ summary: 'Menu sidebar theo user đăng nhập và ứng dụng' })
  @ApiQuery({ name: 'app', required: false, description: 'ADMIN_PORTAL | CITIZEN_PORTAL', example: 'ADMIN_PORTAL' })
  @ApiResponse({ status: 200, description: 'Cây menu (chỉ mục user có quyền)' })
  async getMyMenus(@Req() req: any, @Query('app') app?: string) {
    const rawId = req.user?.id ?? req.user?.userId;
    const userId = rawId != null && rawId !== '' ? (typeof rawId === 'number' ? rawId : parseInt(String(rawId), 10)) : 0;
    return firstValueFrom(
      this.menuService.GetMyMenus({
        userId: Number.isNaN(userId) ? 0 : userId,
        app: app || 'ADMIN_PORTAL',
      }),
    );
  }

  /** Chuẩn hóa body từ frontend sang payload gRPC (camelCase; đọc cả path/route, sort/order, portal/application, active) */
  private toCreatePayload(body: any) {
    const code = String(body.code ?? '').trim() || `MENU_${Date.now()}`;
    const name = String(body.name ?? '').trim() || 'Menu mới';
    const route = body.path ?? body.route ?? '';
    const icon = body.icon ?? '';
    const order = Number(body.sort ?? body.order ?? 0) || 0;
    const service = body.service ?? '';
    const application = body.portal ?? body.application ?? 'ADMIN_PORTAL';
    const target = body.target ?? 'SELF';
    const parentId = body.parentId ?? body.parent_id;
    const rawIds = body.requiredPermissionIds ?? body.required_permission_ids;
    const requiredPermissionIds = Array.isArray(rawIds)
      ? rawIds.map(Number).filter((id: number) => id > 0)
      : (body.requiredPermissionId ?? body.required_permission_id) != null && (body.requiredPermissionId ?? body.required_permission_id) !== 0
        ? [Number(body.requiredPermissionId ?? body.required_permission_id)]
        : [];
    const isActive =
      body.active !== undefined ? Boolean(Number(body.active)) :
      body.is_active !== undefined ? !!body.is_active : true;
    return {
      code,
      name,
      route,
      icon,
      order,
      description: body.description ?? undefined,
      iconColor: body.iconColor ?? body.icon_color ?? undefined,
      service,
      application,
      target,
      parentId: parentId === null || parentId === undefined ? 0 : Number(parentId),
      requiredPermissionIds,
      isActive,
    };
  }

  @Post()
  @ApiOperation({ summary: 'Tạo menu mới (PBAC: quyền gắn với Permission)' })
  @ApiBody({ description: 'Thông tin menu' })
  @ApiResponse({ status: 201, description: 'Menu đã tạo' })
  async create(@Body() body: any) {
    try {
      const payload = this.toCreatePayload(body);
      const res = (await firstValueFrom(this.menuService.Create(payload))) as { menu?: any };
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi tạo menu';
      throw new BadRequestException(typeof message === 'string' ? message : message);
    }
  }

  /** Chuẩn hóa body cập nhật: gRPC camelCase; đọc path/route, sort/order, portal/application, active/is_active */
  private toUpdatePayload(id: number, body: any) {
    const parentId = body.parentId ?? body.parent_id;
    const rawIds = body.requiredPermissionIds ?? body.required_permission_ids;
    const requiredPermissionIds = rawIds !== undefined
      ? (Array.isArray(rawIds) ? rawIds.map(Number).filter((id: number) => id > 0) : [])
      : undefined;
    const payload: any = {
      id,
      code: body.code != null ? String(body.code).trim() : undefined,
      name: body.name != null ? String(body.name).trim() : undefined,
      route: body.path ?? body.route,
      icon: body.icon,
      order: body.sort !== undefined || body.order !== undefined ? Number(body.sort ?? body.order ?? 0) : undefined,
      description: body.description,
      iconColor: body.iconColor ?? body.icon_color,
      service: body.service,
      application: body.portal ?? body.application,
      target: body.target,
    };
    if (parentId !== undefined) payload.parentId = parentId === null ? 0 : Number(parentId);
    if (requiredPermissionIds !== undefined) payload.requiredPermissionIds = requiredPermissionIds;
    if (body.active !== undefined || body.is_active !== undefined) {
      payload.isActive = body.active !== undefined ? Boolean(Number(body.active)) : !!body.is_active;
    }
    return payload;
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật menu (PBAC: quyền gắn với Permission)' })
  @ApiResponse({ status: 200, description: 'Menu đã cập nhật' })
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: any,
  ) {
    try {
      const payload = this.toUpdatePayload(id, body);
      const res = (await firstValueFrom(this.menuService.Update(payload))) as { menu?: any };
      return toFrontendItem(res?.menu ?? {});
    } catch (err: any) {
      const message = err?.message ?? err?.details ?? 'Lỗi cập nhật menu';
      throw new BadRequestException(typeof message === 'string' ? message : message);
    }
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa menu' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    const res = (await firstValueFrom(this.menuService.Delete({ id }))) as { success?: boolean; message?: string };
    return { success: res?.success ?? true, message: res?.message ?? 'Đã xóa menu' };
  }
}
