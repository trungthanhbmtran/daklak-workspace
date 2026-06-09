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
import { RequirePermissions } from '../../core/decorators/permissions.decorator';
import { NotificationsService } from '../notifications/notifications.service';
import { sanitizeUserForClient } from '../../common/utils/user.util';

@ApiTags('Users')
@Controller('admin/users')
@UseGuards(JwtAuthGuard, PermissionsGuard)
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
  @RequirePermissions('USER:READ')
  @ApiOperation({ summary: 'Danh sÃ¡ch user' })
  @ApiResponse({
    status: 200,
    description:
      'Máº£ng user (id, email, username, fullName, phoneNumber, avatarUrl, isActive)',
  })
  async list(@Req() req: any) {
    const user = req?.user;
    const isAdmin = Array.isArray(user?.roles) && user.roles.some((r: any) => r.code === 'SUPER_ADMIN' || r.code === 'ADMIN');
    
    let unitCodeStartsWith: string | undefined;
    if (!isAdmin) {
      if (!user?.unitCode) {
        return { success: true, data: [], meta: { total: 0 } };
      }
      unitCodeStartsWith = user.unitCode;
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
  @RequirePermissions('USER:READ')
  @ApiOperation({ summary: 'Chi tiáº¿t user theo ID' })
  @ApiResponse({
    status: 200,
    description:
      'id, email, username, fullName, phoneNumber, avatarUrl, isActive (camelCase)',
  })
  async getDetail(@Param('id', ParseIntPipe) id: number) {
    const data = await firstValueFrom(this.userService.FindOne({ id }));
    return {
      success: true,
      data: sanitizeUserForClient(data),
    };
  }

  @Post()
  @RequirePermissions('USER:CREATE')
  @ApiOperation({
    summary:
      'Táº¡o user (email, username, password, fullName, phoneNumber, roleIds, cccd, employeeCode tá»« HRM)',
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
      const message = err?.details ?? err?.message ?? 'Lá»—i táº¡o tÃ i khoáº£n';
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
        'ÄÃ£ táº¡o tÃ i khoáº£n má»›i',
        `TÃ i khoáº£n Ä‘Ã£ Ä‘Æ°á»£c táº¡o: ${fullName || email} (${email}). ThÃ´ng bÃ¡o Ä‘Äƒng nháº­p Ä‘Ã£ gá»­i tá»›i email ngÆ°á»i dÃ¹ng.`,
      );
    }
    return created;
  }

  @Post(':id/assign-position')
  @RequirePermissions('USER:MANAGE')
  @ApiOperation({ summary: 'Bá»• nhiá»‡m chá»©c vá»¥ cho user (Ä‘Æ¡n vá»‹ + chá»©c danh)' })
  @ApiResponse({ status: 200, description: 'ThÃ´ng tin bá»• nhiá»‡m (camelCase)' })
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
  @RequirePermissions('USER:MANAGE')
  @ApiOperation({ summary: 'KhÃ³a hoáº·c má»Ÿ tÃ i khoáº£n (isActive: true/false)' })
  @ApiResponse({ status: 200, description: 'success, message' })
  async setActive(
    @Param('id', ParseIntPipe) id: number,
    @Body() body: { isActive: boolean },
  ) {
    return firstValueFrom(
      this.userService.SetUserActive({
        userId: id,
        isActive: body.isActive ?? false,
      }),
    );
  }

  @Post(':id/assign-roles')
  @RequirePermissions('USER:MANAGE')
  @ApiOperation({ summary: 'GÃ¡n láº¡i vai trÃ² cho user (roleIds: number[])' })
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
  @RequirePermissions('USER:UPDATE')
  @ApiOperation({ summary: 'Cáº­p nháº­t user (chÆ°a há»— trá»£)' })
  @ApiResponse({ status: 406 })
  async update(@Param('id') _id: string) {
    throw new NotAcceptableException('UserService má»›i chÆ°a há»— trá»£ UpdateUser.');
  }

  @Delete(':id')
  @RequirePermissions('USER:DELETE')
  @ApiOperation({ summary: 'XÃ³a user (chÆ°a há»— trá»£)' })
  @ApiResponse({ status: 406 })
  async delete(@Param('id') _id: string) {
    throw new NotAcceptableException('UserService má»›i chÆ°a há»— trá»£ DeleteUser.');
  }
}

