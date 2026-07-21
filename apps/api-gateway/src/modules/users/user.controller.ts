import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Query,
  Param,
  Req,
  UseGuards,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { UserService } from './user.service';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Get()
  @ApiOperation({ summary: 'Danh sách user' })
  @ApiResponse({
    status: 200,
    description:
      'Mảng user (id, email, username, fullName, phoneNumber, avatarUrl, isActive)',
  })
  async list(
    @Req() req: any,
    @Query('page') pageStr?: string,
    @Query('limit') limitStr?: string,
    @Query('search') search?: string,
  ) {
    return this.userService.list(req.user, pageStr, limitStr, search);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user theo ID' })
  @ApiResponse({
    status: 200,
    description:
      'id, email, username, fullName, phoneNumber, avatarUrl, isActive (camelCase)',
  })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getDetail(id);
  }

  @Get(':id/policies')
  @ApiOperation({ summary: 'Chính sách hiệu lực của user (lazy load)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách policies từ tất cả roles của user',
  })
  async getUserPolicies(@Param('id', ParseIntPipe) id: number) {
    return this.userService.getUserPolicies(id);
  }

  @Post()
  @ApiOperation({
    summary:
      'Tạo user (email, username, password, fullName, phoneNumber, roleIds, cccd, employeeCode từ HRM)',
  })
  @ApiResponse({
    status: 201,
    description:
      'id, email, username, fullName, phoneNumber, cccd, employeeCode, ...',
  })
  async create(
    @Req() req: { user?: { id?: string | number; email?: string } },
    @Body()
    body: {
      email: string;
      username?: string;
      password?: string;
      fullName?: string;
      phoneNumber?: string;
      roleIds?: number[];
      cccd?: string;
      employeeCode?: string;
    },
  ) {
    return this.userService.create(req.user, body);
  }

  @Post(':id/assign-position')
  @ApiOperation({ summary: 'Bổ nhiệm chức vụ cho user (đơn vị + chức danh)' })
  @ApiResponse({ status: 200, description: 'Thông tin bổ nhiệm (camelCase)' })
  async assignPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { unitId: number; jobTitleId: number; isPrimary?: boolean },
  ) {
    return this.userService.assignPosition(id, body);
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Khóa hoặc mở tài khoản (isActive: true/false)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return this.userService.setActive(id, body.isActive);
  }

  @Post(':id/assign-roles')
  @ApiOperation({ summary: 'Gán lại vai trò cho user (roleIds: number[])' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { roleIds?: number[] },
  ) {
    return this.userService.assignRoles(id, body.roleIds);
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật user (chưa hỗ trợ)' })
  @ApiResponse({ status: 406 })
  async update(@Param('id') id: string) {
    return this.userService.update(id);
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user (chưa hỗ trợ)' })
  @ApiResponse({ status: 406 })
  async delete(@Param('id') id: string) {
    return this.userService.delete(id);
  }
}
