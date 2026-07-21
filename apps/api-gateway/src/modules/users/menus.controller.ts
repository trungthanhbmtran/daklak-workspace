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
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { MenusService, MenuDto } from './menus.service';

@ApiTags('Menu')
@Controller('admin/menus')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class MenusController {
  constructor(private readonly menusService: MenusService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách menu (flat) cho trang quản lý menu' })
  @ApiResponse({ status: 200, description: 'Mảng menu phẳng' })
  async getAll(@Query('app') app?: string) {
    return this.menusService.getAll(app);
  }

  @Get('tree')
  @ApiOperation({ summary: 'Lấy danh sách menu dưới dạng cây' })
  @ApiResponse({ status: 200, description: 'Cây menu' })
  async getMenuTree(@Query('app') app?: string) {
    return this.menusService.getMenuTree(app);
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
    return this.menusService.getMyMenus(req.user, app);
  }

  @Get('hub')
  @ApiOperation({
    summary: 'Danh sách phân hệ cho trang Hub (chỉ root cards, không sidebar)',
  })
  @ApiQuery({ name: 'app', required: false, example: 'ADMIN_PORTAL' })
  @ApiResponse({ status: 200, description: 'Mảng AppItem cho Hub' })
  async getHubApps(@Req() req: any, @Query('app') app?: string) {
    return this.menusService.getHubApps(req.user, app);
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
    return this.menusService.getServiceSidebar(req.user, code, app);
  }

  @Post()
  @ApiOperation({ summary: 'Tạo menu mới (PBAC: quyền gắn với Permission)' })
  @ApiBody({ description: 'Thông tin menu' })
  @ApiResponse({ status: 201, description: 'Menu đã tạo' })
  async create(@Body() body: MenuDto) {
    return this.menusService.create(body);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật menu (PBAC: quyền gắn với Permission)' })
  @ApiResponse({ status: 200, description: 'Menu đã cập nhật' })
  async update(@Param('id', ParseIntPipe) id: number, @Body() body: MenuDto) {
    return this.menusService.update(id, body);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa menu' })
  @ApiResponse({ status: 200, description: 'Đã xóa' })
  async delete(@Param('id', ParseIntPipe) id: number) {
    return this.menusService.delete(id);
  }
}
