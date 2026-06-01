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

/** Map flat menu từ gRPC sang frontend. */
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
  @ApiOperation({ summary: 'Danh sách menu (flat) cho trang quản lý menu' })
  @ApiResponse({ status: 200, description: 'Mảng menu phẳng' })
  async getAll(@Query('app') app?: string) {
    const res = (await firstValueFrom(
      this.menuService.GetAll({ app: app || 'ADMIN_PORTAL' }),
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
        app: app || 'ADMIN_PORTAL',
      }),
    );
    
    // Bổ sung meta chứa currentUser để Frontend (HubClient) dùng
    if (response) {
      if (!response.meta) response.meta = {};
      response.meta.currentUser = req.user;
    }
    
    return response;
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
