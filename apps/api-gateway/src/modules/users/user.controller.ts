import { Controller, Get, Post, Put, Patch, Delete, Body, Param, Req, Inject, UseGuards, OnModuleInit, BadRequestException, NotAcceptableException, ParseIntPipe } from '@nestjs/common';
import { ApiTags, ApiBearerAuth, ApiOperation, ApiResponse } from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { NotificationsService } from '../notifications/notifications.service';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard)
@ApiBearerAuth('JWT-auth')
export class UserController implements OnModuleInit {
  private userService: any;

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly client: any,
    private readonly notificationsService: NotificationsService,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService(MICROSERVICES.USER.SERVICE);
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách user' })
  @ApiResponse({ status: 200, description: 'Mảng user (id, email, username, fullName, phoneNumber, avatarUrl, isActive)' })
  async list() {
    const res = await firstValueFrom(this.userService.ListUsers({}));
    const items = Array.isArray((res as { items?: unknown[] })?.items)
      ? (res as { items: unknown[] }).items
      : [];
    return items;
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user theo ID' })
  @ApiResponse({ status: 200, description: 'id, email, username, fullName, phoneNumber, avatarUrl, isActive (camelCase)' })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    return firstValueFrom(this.userService.FindOne({ id }));
  }

  @Post()
  @ApiOperation({ summary: 'Tạo user (email, username, password, fullName, phoneNumber, roleIds, cccd, employeeCode từ HRM)' })
  @ApiResponse({ status: 201, description: 'id, email, username, fullName, phoneNumber, cccd, employeeCode, ...' })
  async create(
    @Req() req: { user?: { id?: string | number; email?: string } },
    @Body() body: {
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
    const createdByUserId = req.user?.id != null ? Number(req.user.id) : 0;
    const createdByEmail = req.user?.email ?? '';
    let created: unknown;
    try {
      created = await firstValueFrom(
        this.userService.CreateUser({
          email: body.email,
          username: body.username,
          password: body.password,
          fullName: body.fullName,
          phoneNumber: body.phoneNumber,
          roleIds: body.roleIds,
          cccd: body.cccd,
          employeeCode: body.employeeCode,
          createdByUserId: createdByUserId || undefined,
          createdByEmail: createdByEmail || undefined,
        }),
      );
    } catch (err: any) {
      const message = err?.details ?? err?.message ?? 'Lỗi tạo tài khoản';
      throw new BadRequestException(typeof message === 'string' ? message : String(message));
    }
    if (createdByUserId && created) {
      const email = (created as { email?: string }).email ?? body.email;
      const fullName = (created as { fullName?: string }).fullName ?? body.fullName ?? '';
      this.notificationsService.push(
        String(createdByUserId),
        'Đã tạo tài khoản mới',
        `Tài khoản đã được tạo: ${fullName || email} (${email}). Thông báo đăng nhập đã gửi tới email người dùng.`,
      );
    }
    return created;
  }

  @Post(':id/assign-position')
  @ApiOperation({ summary: 'Bổ nhiệm chức vụ cho user (đơn vị + chức danh)' })
  @ApiResponse({ status: 200, description: 'Thông tin bổ nhiệm (camelCase)' })
  async assignPosition(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { unitId: number; jobTitleId: number; isPrimary?: boolean },
  ) {
    return firstValueFrom(
      this.userService.AssignPosition({
        userId: id,
        unitId: body.unitId,
        jobTitleId: body.jobTitleId,
        isPrimary: body.isPrimary ?? false,
      }),
    );
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Khóa hoặc mở tài khoản (isActive: true/false)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return firstValueFrom(
      this.userService.SetUserActive({ userId: id, isActive: body.isActive ?? false }),
    );
  }

  @Post(':id/assign-roles')
  @ApiOperation({ summary: 'Gán lại vai trò cho user (roleIds: number[])' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { roleIds?: number[] },
  ) {
    const roleIds = Array.isArray(body?.roleIds) ? body.roleIds : [];
    return firstValueFrom(
      this.userService.AssignRoles({ userId: id, roleIds }),
    );
  }

  @Put(':id')
  @ApiOperation({ summary: 'Cập nhật user (chưa hỗ trợ)' })
  @ApiResponse({ status: 406 })
  async update(@Param('id') _id: string) {
    throw new NotAcceptableException('UserService mới chưa hỗ trợ UpdateUser.');
  }

  @Delete(':id')
  @ApiOperation({ summary: 'Xóa user (chưa hỗ trợ)' })
  @ApiResponse({ status: 406 })
  async delete(@Param('id') _id: string) {
    throw new NotAcceptableException('UserService mới chưa hỗ trợ DeleteUser.');
  }
}
