import {
  Controller,
  Get,
  Post,
  Put,
  Patch,
  Delete,
  Body,
  Param,
  Req,
  Inject,
  UseGuards,
  OnModuleInit,
  BadRequestException,
  NotAcceptableException,
  ParseIntPipe,
} from '@nestjs/common';
import {
  ApiTags,
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
} from '@nestjs/swagger';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { NotificationsService } from '../notifications/notifications.service';
import { sanitizeUserForClient } from '../../common/utils/user.util';
import { RedisService } from '../../core/redis/redis.service';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
@ApiBearerAuth('JWT-auth')
export class UserController implements OnModuleInit {
  private userService: any;
  private employeeService: any;

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly employeeClient: any,
    private readonly notificationsService: NotificationsService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.userService = this.client.getService(MICROSERVICES.USER.SERVICE);
    this.employeeService = this.employeeClient.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
  }

  @Get()
  @ApiOperation({ summary: 'Danh sách user' })
  @ApiResponse({
    status: 200,
    description:
      'Mảng user (id, email, username, fullName, phoneNumber, avatarUrl, isActive)',
  })
  async list(@Req() req: any) {
    const userId = req?.user?.id;

    // Gọi FindOne để lấy roles và unitCode của người đang đăng nhập
    const userInfo: any = userId
      ? await firstValueFrom(this.userService.FindOne({ id: userId })).catch(
          () => null,
        )
      : null;

    const isSuperAdmin = userInfo?.roles?.some((r: any) => r.code === 'SUPER_ADMIN');
    const isAdmin: boolean = isSuperAdmin || !!userInfo?.permissionsFlatten?.includes('USER:MANAGE');

    let unitCodeStartsWith: string | undefined;
    if (!isAdmin) {
      if (!userInfo?.unitCode) {
        return { success: true, data: [], meta: { total: 0 } };
      }
      unitCodeStartsWith = userInfo!.unitCode;
    }

    const response = (await firstValueFrom(
      this.userService.ListUsers({ unitCodeStartsWith }),
    )) as any;
    return {
      success: true,
      data: response.data || [],
      meta: response.meta,
    };
  }

  @Get(':id')
  @ApiOperation({ summary: 'Chi tiết user theo ID' })
  @ApiResponse({
    status: 200,
    description:
      'id, email, username, fullName, phoneNumber, avatarUrl, isActive (camelCase)',
  })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const data: any = await firstValueFrom(this.userService.FindOne({ id }));
    if (!data) return { success: true, data: null };



    return {
      success: true,
      data: {
        id: data.id,
        email: data.email,
        username: data.username,
        fullName: data.fullName ?? data.full_name,
        phoneNumber: data.phoneNumber ?? data.phone_number,
        avatarUrl: data.avatarUrl ?? data.avatar_url,
        isActive: data.isActive ?? data.is_active ?? true,
        cccd: data.cccd,
        employeeCode: data.employeeCode ?? data.employee_code,
        lastLogin: data.lastLogin ?? data.last_login,
        roles: data.roles,
      },
    };
  }

  @Get(':id/policies')
  @ApiOperation({ summary: 'Chính sách hiệu lực của user (lazy load)' })
  @ApiResponse({
    status: 200,
    description: 'Danh sách policies từ tất cả roles của user',
  })
  async getUserPolicies(@Param('id', ParseIntPipe) id: number) {
    const data: any = await firstValueFrom(this.userService.FindOne({ id }));
    if (!data) return { success: true, data: [] };

    const policies: any[] = Array.isArray(data.policies) ? data.policies : [];

    const policiesMap = new Map<string, any>();
    for (const p of policies) {
      const key = `${p.resource}-${p.action}`;
      if (!policiesMap.has(key)) {
        policiesMap.set(key, {
          description: p.description,
          resource: p.resource,
          action: p.action,
          effect: p.effect ?? 'ALLOW',
        });
      }
    }

    return {
      success: true,
      data: Array.from(policiesMap.values()),
    };
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
      throw new BadRequestException(
        typeof message === 'string' ? message : String(message),
      );
    }
    if (createdByUserId && created) {
      const email = (created as { email?: string }).email ?? body.email;
      const fullName =
        (created as { fullName?: string }).fullName ?? body.fullName ?? '';
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
    const result = await firstValueFrom(
      this.userService.AssignPosition({
        userId: id,
        unitId: body.unitId,
        jobTitleId: body.jobTitleId,
        isPrimary: body.isPrimary ?? false,
      }),
    );
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on assignPosition:', err);
    }
    return result;
  }

  @Patch(':id/active')
  @ApiOperation({ summary: 'Khóa hoặc mở tài khoản (isActive: true/false)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    const result = await firstValueFrom(
      this.userService.SetUserActive({
        userId: id,
        isActive: body.isActive ?? false,
      }),
    );
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on setActive:', err);
    }
    return result;
  }

  @Post(':id/assign-roles')
  @ApiOperation({ summary: 'Gán lại vai trò cho user (roleIds: number[])' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async assignRoles(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { roleIds?: number[] },
  ) {
    const roleIds = Array.isArray(body?.roleIds) ? body.roleIds : [];
    const result = await firstValueFrom(
      this.userService.AssignRoles({ userId: id, roleIds }),
    );
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on assignRoles:', err);
    }
    return result;
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
