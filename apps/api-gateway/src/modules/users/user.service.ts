import {
  Injectable,
  Inject,
  OnModuleInit,
  BadRequestException,
  NotAcceptableException,
  InternalServerErrorException
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class UserService implements OnModuleInit {
  private userGrpcService: any;
  private employeeGrpcService: any;

  constructor(
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly client: any,
    @Inject(MICROSERVICES.EMPLOYEE.SYMBOL) private readonly employeeClient: any,
    private readonly notificationsService: NotificationsService,
    private readonly redisService: RedisService,
  ) {}

  onModuleInit() {
    this.userGrpcService = this.client.getService(MICROSERVICES.USER.SERVICE);
    this.employeeGrpcService = this.employeeClient.getService(MICROSERVICES.EMPLOYEE.SERVICE);
  }

  async list(user: any, pageStr?: string, limitStr?: string, search?: string) {
    const userId = user?.id;
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const skip = (page - 1) * limit;
    const take = limit;

    const userInfo: any = userId
      ? await firstValueFrom(this.userGrpcService.FindOne({ id: userId })).catch(
          () => null,
        )
      : null;

    const isSuperAdmin = userInfo?.roles?.some(
      (r: any) => r.code === 'SUPER_ADMIN',
    );
    const isAdmin: boolean =
      isSuperAdmin || !!userInfo?.permissionsFlatten?.includes('USER:MANAGE');

    let unitCodeStartsWith: string | undefined;
    if (!isAdmin) {
      if (!userInfo?.unitCode) {
        return { success: true, data: [], meta: { total: 0 } };
      }
      unitCodeStartsWith = userInfo!.unitCode;
    }

    const response = (await firstValueFrom(
      this.userGrpcService.ListUsers({ skip, take, search, unitCodeStartsWith }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    })) as any;
    return {
      success: true,
      data: response?.data,
      meta: response?.meta,
    };
  }

  async getDetail(id: number) {
    const data: any = await firstValueFrom(
      this.userGrpcService.FindOne({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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

  async getUserPolicies(id: number) {
    const data: any = await firstValueFrom(
      this.userGrpcService.FindOne({ id }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
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

  async create(user: any, body: any) {
    const createdByUserId = user?.id != null ? Number(user.id) : 0;
    const createdByEmail = user?.email ?? '';
    let created: unknown;
    try {
      created = await firstValueFrom(
        this.userGrpcService.CreateUser({
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

  async assignPosition(id: number, body: any) {
    const result = await firstValueFrom(
      this.userGrpcService.AssignPosition({
        userId: id,
        unitId: body.unitId,
        jobTitleId: body.jobTitleId,
        isPrimary: body.isPrimary ?? false,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on assignPosition:', err);
    }
    return result;
  }

  async setActive(id: number, isActive: boolean) {
    const result = await firstValueFrom(
      this.userGrpcService.SetUserActive({
        userId: id,
        isActive: isActive ?? false,
      }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on setActive:', err);
    }
    return result;
  }

  async assignRoles(id: number, roleIds?: number[]) {
    const roles = Array.isArray(roleIds) ? roleIds : [];
    const result = await firstValueFrom(
      this.userGrpcService.AssignRoles({ userId: id, roleIds: roles }),
    ).catch((e) => {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    });
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on assignRoles:', err);
    }
    return result;
  }

  async update(id: string) {
    throw new NotAcceptableException('UserService mới chưa hỗ trợ UpdateUser.');
  }

  async delete(id: string) {
    throw new NotAcceptableException('UserService mới chưa hỗ trợ DeleteUser.');
  }
}
