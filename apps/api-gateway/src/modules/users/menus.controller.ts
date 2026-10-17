import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiQuery,
  ApiBody,
} from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { MenusService, MenuDto } from './menus.service';

@ApiTags('Menu')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class MenusController {
  constructor(
    private readonly menusService: MenusService,
    private readonly issuer: TokenIssuerService,
  ) {}

  private getGrpcMetadata(req: any) {
    const meta = new Metadata();
    meta.set(
      'authorization',
      'Bearer ' +
        this.issuer.signDelegation(req.user, {
          requestId: randomUUID(),
          ipAddress: clientIp(req),
        }),
    );
    return meta;
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách menu (flat) cho trang quản lý menu' })
  @ApiResponse({ status: 200, description: 'Mảng menu phẳng' })
  async getAll(@Req() req: any, @Query('app') app?: string) {
    return this.menusService.getAll(app, this.getGrpcMetadata(req));
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy danh sách menu dưới dạng cây' })
  @ApiResponse({ status: 200, description: 'Cây menu' })
  async getMenuTree(@Req() req: any, @Query('app') app?: string) {
    return this.menusService.getMenuTree(app, this.getGrpcMetadata(req));
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
    return this.menusService.getMyMenus(
      req.user,
      app,
      this.getGrpcMetadata(req),
    );
  }

  @Get('hub')
  @ApiOperation({
    summary: 'Danh sách phân hệ cho trang Hub (chỉ root cards, không sidebar)',
  })
  @ApiQuery({ name: 'app', required: false, example: 'ADMIN_PORTAL' })
  @ApiResponse({ status: 200, description: 'Mảng AppItem cho Hub' })
  async getHubApps(@Req() req: any, @Query('app') app?: string) {
    return this.menusService.getHubApps(
      req.user,
      app,
      this.getGrpcMetadata(req),
    );
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
    return this.menusService.getServiceSidebar(
      req.user,
      code,
      app,
      this.getGrpcMetadata(req),
    );
  }

  @Post()
  @ApiOperation({ summary: 'Tạo menu mới (PBAC: quyền gắn với Permission)' })
  @ApiBody({ description: 'Thông tin menu' })
  @ApiResponse({ status: 201, description: 'Menu đã tạo' })
  async create(@Req() req: any, @Body() body: MenuDto) {
    return this.menusService.create(body, this.getGrpcMetadata(req));
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật menu (PBAC: quyền gắn với Permission)' })
  @ApiResponse({ status: 200, description: 'Menu đã cập nhật' })
  async update(
    @Req() req: any,
    @Param('id', ParseIntPipe) id: number,
    @Body() body: MenuDto,
  ) {
    return this.menusService.update(id, body, this.getGrpcMetadata(req));
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa menu' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
  async delete(@Req() req: any, @Param('id', ParseIntPipe) id: number) {
    return this.menusService.delete(id, this.getGrpcMetadata(req));
  }
}
