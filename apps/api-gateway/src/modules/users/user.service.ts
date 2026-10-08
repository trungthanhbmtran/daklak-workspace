import {
  Injectable,
  Inject,
  OnModuleInit,
  BadRequestException,
  NotAcceptableException,
  InternalServerErrorException,
  NotFoundException,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { NotificationsService } from '../notifications/notifications.service';
import { RedisService } from '../../core/redis/redis.service';

@Injectable()
export class UserService implements OnModuleInit {
  private handleRpcError(e: any, defaultMsg = 'RPC Call Failed'): never {
    const code = e?.code;
    const message = e?.details || e?.message || defaultMsg;
    if (code === 16) throw new UnauthorizedException(message);
    if (code === 7) throw new ForbiddenException(message);
    if (code === 5) throw new NotFoundException(message);
    if (code === 6) throw new ConflictException(message);
    if (code === 3) throw new BadRequestException(message);
    throw new InternalServerErrorException(message);
  }

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
    this.employeeGrpcService = this.employeeClient.getService(
      MICROSERVICES.EMPLOYEE.SERVICE,
    );
  }

  async list(user: any, pageStr?: string, limitStr?: string, search?: string) {
    const userId = user?.id;
    const page = parseInt(pageStr || '1', 10);
    const limit = parseInt(limitStr || '10', 10);
    const skip = (page - 1) * limit;
    const take = limit;

    const userInfo: any = userId
      ? await firstValueFrom(
          this.userGrpcService.FindOne({ id: userId }),
        ).catch((err: any) => {
          if (err?.code !== 5) this.handleRpcError(err);
          return null;
        })
      : null;

    const isAdmin: boolean =
      !!userInfo?.permissionsFlatten?.includes('USER:MANAGE');

    let unitCodeStartsWith: string | undefined;
    if (!isAdmin) {
      if (!userInfo?.unitCode) {
        return { data: [], meta: { total: 0 } };
      }
      unitCodeStartsWith = userInfo!.unitCode;
    }

    const response = (await firstValueFrom(
      this.userGrpcService.ListUsers({
        skip,
        take,
        search,
        unitCodeStartsWith,
      }),
    ).catch((e) => this.handleRpcError(e))) as any;
    return {
      data: response?.data,
      meta: response?.meta,
    };
  }

  async getDetail(id: number) {
    const data: any = await firstValueFrom(
      this.userGrpcService.FindOne({ id }),
    ).catch((e) => this.handleRpcError(e));
    if (!data) return { data: null };

    return {
      data: {
        id: data.id,
        email: data.email,
        username: data.username,
        fullName: data.fullName,
        phoneNumber: data.phoneNumber,
        avatarUrl: data.avatarUrl,
        isActive: data.isActive ?? true,
        cccd: data.cccd,
        employeeCode: data.employeeCode,
        lastLogin: data.lastLogin,
        policies: data.policies,
        userGroups: data.userGroups,
        userGroupIds: (data.userGroups || []).map((g: any) => g.id),
      },
    };
  }

  async getUserPolicies(id: number) {
    const data: any = await firstValueFrom(
      this.userGrpcService.FindOne({ id }),
    ).catch((e) => this.handleRpcError(e));
    if (!data) return { data: [] };

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
      void this.notificationsService.push(
        String(createdByUserId),
        'Đã tạo tài khoản mới',
        `Tài khoản đã được tạo: ${fullName || email} (${email}). Thông báo đăng nhập đã gửi tới email người dùng.`,
      );
    }
    return { data: created };
  }

  async assignPosition(id: number, body: any) {
    const result = await firstValueFrom(
      this.userGrpcService.AssignPosition({
        userId: id,
        unitId: body.unitId,
        jobTitleId: body.jobTitleId,
        isPrimary: body.isPrimary ?? false,
      }),
    ).catch((e) => this.handleRpcError(e));
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on assignPosition:', err);
    }
    return { data: result };
  }

  async setActive(id: number, isActive: boolean) {
    const result = await firstValueFrom(
      this.userGrpcService.SetUserActive({
        userId: id,
        isActive: isActive ?? false,
      }),
    ).catch((e) => this.handleRpcError(e));
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on setActive:', err);
    }
    return { data: result };
  }

  async assignUserGroups(id: number, userGroupIds: number[]) {
    const result = await firstValueFrom(
      this.userGrpcService.AssignUserGroups({
        userId: id,
        userGroupIds: userGroupIds,
      }),
    ).catch((e) => this.handleRpcError(e));
    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on assignUserGroups:', err);
    }
    return { data: result };
  }

  async update(id: string, body: any) {
    const result = await firstValueFrom(
      this.userGrpcService.UpdateUser({
        id: parseInt(id, 10),
        email: body.email,
        username: body.username,
        fullName: body.fullName,
        phoneNumber: body.phoneNumber,
        cccd: body.cccd,
        employeeCode: body.employeeCode,
      }),
    ).catch((e) => {
      throw new BadRequestException(e.message || 'Lỗi cập nhật người dùng');
    });

    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on update:', err);
    }
    return { data: result };
  }

  async delete(id: string) {
    await firstValueFrom(
      this.userGrpcService.DeleteUser({
        id: parseInt(id, 10),
      }),
    ).catch((e) => {
      throw new BadRequestException(e.message || 'Lỗi xóa người dùng');
    });

    try {
      await this.redisService.getClient().del(`user:profile:${id}`);
    } catch (err) {
      console.error('Failed to clear user cache on delete:', err);
    }
    return { };
  }
}
