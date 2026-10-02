import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { IntegrationAuthService } from '../integration-config/integration-auth.service';
import { AuthSessionStore, RefreshConflictError } from './auth-session.store';
import { RpcException, ClientGrpc } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import {
  AUTH_DEFAULTS,
  RefreshSession,
} from '../../../../../shared/core/auth-session';
import { PrismaService } from '@/database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

const GRPC = {
  INVALID_ARGUMENT: 3,
  NOT_FOUND: 5,
  UNAUTHENTICATED: 16,
} as const;

const DUMMY_PASSWORD_HASH = bcrypt.hashSync('not-a-real-account-password', 10);

@Injectable()
export class UsersService implements OnModuleInit {
  private readonly logger = new Logger(UsersService.name);
  private workflowEngine: any;

  constructor(
    private prisma: PrismaService,
    private readonly auth: IntegrationAuthService,
    private readonly sessions: AuthSessionStore,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject('NOTIFICATION_SERVICE') private readonly notiClient: ClientProxy,
    @Inject('WORKFLOW_SERVICE') private readonly workflowClient: ClientGrpc,
  ) {}

  onModuleInit() {
    this.workflowEngine =
      this.workflowClient.getService<any>('WorkflowService');
  }

  private async triggerWorkflow(trigger: string, context: any) {
    if (!this.workflowEngine) return;
    try {
      await firstValueFrom(
        this.workflowEngine.TriggerWorkflow({
          trigger,
          initialContext: context,
        }),
      );
    } catch (e: any) {
      this.logger.error(`Failed to trigger workflow ${trigger}: ${e.message}`);
    }
  }

  // Bổ nhiệm nhân sự (Assign Job Position)
  async assignPosition(dto: {
    userId: number;
    unitId: number;
    jobTitleId: number;
    isPrimary: boolean;
  }) {
    const newPosition = await this.prisma.$transaction(async (tx: any) => {
      await this.checkStaffingLimitTx(tx, dto.unitId, dto.jobTitleId);

      const pos = await this.createJobPositionRecordTx(tx, dto);

      if (pos.user?.employeeCode) {
        const employeeCode = pos.user.employeeCode;
        const staffing = await tx.organizationStaffing.findUnique({
          where: {
            unitId_jobTitleId: {
              unitId: dto.unitId,
              jobTitleId: dto.jobTitleId,
            },
          },
        });
        if (staffing) {
          const availableSlot = await tx.staffingSlot.findFirst({
            where: {
              staffingId: staffing.id,
              OR: [
                { assignedEmployeeCode: null },
                { assignedEmployeeCode: '' },
              ],
            },
            orderBy: { slotOrder: 'asc' },
          });

          if (availableSlot) {
            await tx.staffingSlot.update({
              where: { id: availableSlot.id },
              data: { assignedEmployeeCode: employeeCode },
            });

            await tx.organizationStaffing.update({
              where: { id: staffing.id },
              data: { currentCount: { increment: 1 } },
            });
          }
        }
      }

      return pos;
    });

    this.notifyPositionAssigned(newPosition);
    await this.clearUserProfileCache(dto.userId);

    return newPosition;
  }

  private async checkStaffingLimitTx(
    tx: any,
    unitId: number,
    jobTitleId: number,
  ) {
    const staffing = await tx.organizationStaffing.findUnique({
      where: { unitId_jobTitleId: { unitId, jobTitleId } },
    });

    if (!staffing) {
      throw new RpcException({
        message: 'Đơn vị này chưa có chỉ tiêu (Định biên) cho chức danh này.',
        code: GRPC.INVALID_ARGUMENT,
      });
    }

    if (staffing.currentCount >= staffing.quantity) {
      throw new RpcException({
        message: `Đã hết chỉ tiêu định biên! (Hiện có: ${staffing.currentCount}/${staffing.quantity})`,
        code: GRPC.INVALID_ARGUMENT,
      });
    }
  }

  private createJobPositionRecordTx(
    tx: any,
    dto: {
      userId: number;
      unitId: number;
      jobTitleId: number;
      isPrimary: boolean;
    },
  ) {
    return tx.jobPosition.create({
      data: {
        userId: dto.userId,
        unitId: dto.unitId,
        jobTitleId: dto.jobTitleId,
        isPrimary: dto.isPrimary,
      },
      include: {
        unit: true,
        jobTitle: true,
        user: true,
      },
    });
  }

  private async checkStaffingLimit(unitId: number, jobTitleId: number) {
    const staffing = await this.prisma.organizationStaffing.findUnique({
      where: { unitId_jobTitleId: { unitId, jobTitleId } },
    });

    if (!staffing) {
      throw new RpcException({
        message: 'Đơn vị này chưa có chỉ tiêu (Định biên) cho chức danh này.',
        code: GRPC.INVALID_ARGUMENT,
      });
    }

    if (staffing.currentCount >= staffing.quantity) {
      throw new RpcException({
        message: `Đã hết chỉ tiêu định biên! (Hiện có: ${staffing.currentCount}/${staffing.quantity})`,
        code: GRPC.INVALID_ARGUMENT,
      });
    }
  }

  private async createJobPositionRecord(dto: {
    userId: number;
    unitId: number;
    jobTitleId: number;
    isPrimary: boolean;
  }) {
    return this.prisma.jobPosition.create({
      data: {
        userId: dto.userId,
        unitId: dto.unitId,
        jobTitleId: dto.jobTitleId,
        isPrimary: dto.isPrimary,
      },
      include: {
        unit: true,
        jobTitle: true,
        user: true,
      },
    });
  }

  private notifyPositionAssigned(newPosition: any) {
    // Thông báo cho hệ thống notification (người dùng)
    this.notiClient.emit('notification.position_assigned', {
      email: newPosition.user.email,
      fullName: newPosition.user.fullName,
      position: newPosition.jobTitle.name,
      department: newPosition.unit.name,
      timestamp: new Date(),
    });

    // Thông báo cho các microservice khác (như hrm-service) để đồng bộ data
    this.notiClient.emit('user.position.assigned', {
      userId: newPosition.userId,
      employeeCode: newPosition.user?.employeeCode,
      unitId: newPosition.unitId,
      jobTitleId: newPosition.jobTitleId,
      timestamp: new Date(),
    });
    console.log(`📡 Đã bắn event bổ nhiệm cho User ${newPosition.userId}`);
  }

  private async clearUserProfileCache(userId: number) {
    await this.cache.del(`user:profile:${userId}`);
  }

  async createUser(data: {
    email: string;
    username?: string;
    password?: string;
    fullName?: string | null;
    phoneNumber?: string | null;

    cccd?: string | null;
    employeeCode?: string | null;
    createdByUserId?: number;
    createdByEmail?: string;
  }) {
    if (data.password) this.assertPasswordPolicy(data.password);
    await this.validateUsername(data.username);

    const user = await this.insertUserRecord(data);

    await this.createCredential(user.id, data.password);

    this.sendUserCreationNotifications(user, data);

    await this.triggerUserCreatedWorkflow(user, data.createdByUserId);

    return this.toUserResponse(user);
  }

  async updateUser(data: {
    id: number;
    email?: string;
    username?: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    cccd?: string | null;
    employeeCode?: string | null;
  }) {
    if (data.username) {
      const existing = await this.prisma.user.findFirst({
        where: { username: data.username, id: { not: data.id } },
      });
      if (existing) {
        throw new RpcException({
          message: 'Username đã tồn tại',
          code: GRPC.INVALID_ARGUMENT,
        });
      }
    }

    try {
      const user = await this.prisma.user.update({
        where: { id: data.id },
        data: {
          ...(data.email && { email: data.email }),
          ...(data.username && { username: data.username }),
          ...(data.fullName !== undefined && { fullName: data.fullName }),
          ...(data.phoneNumber !== undefined && {
            phoneNumber: data.phoneNumber,
          }),
          ...(data.cccd !== undefined && { cccd: data.cccd }),
          ...(data.employeeCode !== undefined && {
            employeeCode: data.employeeCode,
          }),
        },
      });
      await this.clearUserProfileCache(data.id);
      return this.toUserResponse(user);
    } catch (e: any) {
      if (e?.code === 'P2002') {
        throw new RpcException({
          message: 'Email hoặc Username đã tồn tại',
          code: GRPC.INVALID_ARGUMENT,
        });
      }
      throw e;
    }
  }

  async deleteUser(id: number) {
    const user = await this.prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new RpcException({
        message: 'Tài khoản không tồn tại',
        code: GRPC.NOT_FOUND,
      });
    }

    await this.prisma.user.delete({ where: { id } });
    await this.clearUserProfileCache(id);
    return true;
  }

  private async validateUsername(username?: string) {
    if (!username) return;
    const existing = await this.prisma.user.findUnique({
      where: { username },
    });
    if (existing) {
      throw new RpcException({
        message: 'Username đã tồn tại',
        code: GRPC.INVALID_ARGUMENT,
      });
    }
  }

  private async insertUserRecordTx(tx: any, data: any) {
    try {
      return await tx.user.create({
        data: {
          email: data.email,
          username: data.username || null,
          fullName: data.fullName?.trim() || null,
          phoneNumber: data.phoneNumber?.trim() || null,
          cccd: data.cccd?.trim() || null,
          employeeCode: data.employeeCode?.trim() || null,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        const target = Array.isArray(e?.meta?.target)
          ? e.meta.target[0]
          : 'email';
        throw new RpcException({
          message:
            target === 'email'
              ? 'Email đã tồn tại'
              : target === 'username'
                ? 'Username đã tồn tại'
                : 'Dữ liệu trùng lặp',
          code: GRPC.INVALID_ARGUMENT,
        });
      }
      throw e;
    }
  }

  private async createCredentialTx(tx: any, userId: number, password?: string) {
    if (password && password.trim()) {
      this.assertPasswordPolicy(password);
      const hash = await bcrypt.hash(password, 10);
      await tx.credential.create({
        data: { userId, passwordHash: hash },
      });
    }
  }

  private async insertUserRecord(data: any) {
    try {
      return await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username || null,
          fullName: data.fullName?.trim() || null,
          phoneNumber: data.phoneNumber?.trim() || null,
          cccd: data.cccd?.trim() || null,
          employeeCode: data.employeeCode?.trim() || null,
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        const target = Array.isArray(e?.meta?.target)
          ? e.meta.target[0]
          : 'email';
        throw new RpcException({
          message:
            target === 'email'
              ? 'Email đã tồn tại'
              : target === 'username'
                ? 'Username đã tồn tại'
                : 'Dữ liệu trùng lặp',
          code: GRPC.INVALID_ARGUMENT,
        });
      }
      throw e;
    }
  }

  private async createCredential(userId: number, password?: string) {
    if (password && password.trim()) {
      this.assertPasswordPolicy(password);
      const hash = await bcrypt.hash(password, 10);
      await this.prisma.credential.create({
        data: { userId, passwordHash: hash },
      });
    }
  }

  private sendUserCreationNotifications(user: any, data: any) {
    const tempPassword = data.password?.trim() ? data.password : undefined;
    const newUserDisplay = user.fullName?.trim() || user.username || user.email;

    try {
      if (data.createdByEmail?.trim()) {
        this.notiClient.emit('notification', {
          channel: 'email',
          recipient: data.createdByEmail.trim(),
          subject: 'Đã tạo tài khoản mới trên hệ thống',
          body: `Bạn đã tạo tài khoản thành công.\n\nNgười dùng: ${newUserDisplay}\nEmail: ${user.email}\nTên đăng nhập: ${user.username ?? user.email}\n\nThông báo đăng nhập đã được gửi tới email người dùng.`,
          metadata: {
            type: 'user_created',
            createdByUserId: data.createdByUserId,
            newUserId: user.id,
          },
        });
      }
      this.notiClient.emit('notification', {
        channel: 'email',
        recipient: user.email,
        subject: 'Thông tin tài khoản đăng nhập',
        body: `Chào bạn,\n\nTài khoản đăng nhập hệ thống đã được tạo cho bạn.\n\nTên đăng nhập: ${user.username ?? user.email}\n${tempPassword ? `Mật khẩu tạm: ${tempPassword}\n\nVui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.` : 'Vui lòng sử dụng chức năng "Quên mật khẩu" hoặc liên hệ quản trị để được cấp mật khẩu.'}\n\nTrân trọng.`,
        metadata: { type: 'user_created', newUserId: user.id },
      });
      console.log(
        `📡 Đã gửi thông báo tới phụ trách và email đăng nhập cho ${user.email}.`,
      );
    } catch (err) {
      console.warn(
        'Gửi thông báo email thất bại (RabbitMQ/notification service có thể chưa chạy):',
        (err as Error)?.message ?? err,
      );
    }
  }

  private async triggerUserCreatedWorkflow(
    user: any,
    createdByUserId?: number,
  ) {
    await this.triggerWorkflow('USER_CREATED', {
      userId: user.id,
      email: user.email,
      username: user.username,
      fullName: user.fullName,
      initiatorId: createdByUserId?.toString() || 'system',
    });
  }

  /** Credentials stay inside user-service; callers receive a generic failure. */
  async login(data: {
    usernameOrEmail: string;
    password: string;
    deviceInfo?: string;
    ipAddress?: string;
  }) {
    const account =
      typeof data.usernameOrEmail === 'string'
        ? data.usernameOrEmail.trim()
        : '';
    if (!(await this.sessions.assertLoginAllowed(account))) {
      this.auditAuth('LOGIN_THROTTLED');
      throw new RpcException({
        code: 8,
        message: 'Tạm thời không thể đăng nhập. Vui lòng thử lại sau.',
      });
    }
    let user: any;
    try {
      user = await this.validateUserCredentials(account, data.password);
    } catch (error) {
      if (
        error instanceof RpcException &&
        (error.getError() as any)?.code === GRPC.UNAUTHENTICATED
      ) {
        await this.sessions.recordLoginFailure(account);
        this.auditAuth('LOGIN_FAILED');
      }
      throw error;
    }
    await this.sessions.clearLoginFailures(account);
    const session = await this.sessions.createSession(user.id);
    const tokens = this.generateAuthTokens(session);
    const profile = await this.findOne({ id: user.id });
    await this.sessions.setSession(
      user.id,
      profile,
      tokens.refreshTokenExpiresIn,
    );
    await this.sessions.setRefresh(
      tokens.refreshToken,
      session,
      tokens.refreshTokenExpiresIn,
    );
    this.auditAuth('LOGIN_SUCCEEDED', user.id);
    return this.formatAuthResponse(user, tokens);
  }

  async refresh(data: {
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
  }) {
    const session = await this.validateRefreshTokenString(data.refreshToken);
    const user = await this.prisma.user.findFirst({
      where: { id: session.userId, isActive: true },
      include: {
        policies: { include: { resource: true } },
        jobPositions: {
          include: { unit: true, jobTitle: true },
          orderBy: [{ isPrimary: 'desc' }],
        },
      },
    });
    if (!user)
      throw new RpcException({
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        code: GRPC.UNAUTHENTICATED,
      });
    const tokens = this.generateAuthTokens(session);
    const profile = await this.findOne({ id: user.id });
    await this.sessions.setSession(
      user.id,
      profile,
      tokens.refreshTokenExpiresIn,
    );
    if (
      !(await this.sessions.rotateRefresh(
        data.refreshToken.trim(),
        tokens.refreshToken,
        session,
        tokens.refreshTokenExpiresIn,
      ))
    ) {
      await this.readRefreshSession(data.refreshToken.trim());
      throw new RpcException({
        code: GRPC.UNAUTHENTICATED,
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
      });
    }
    this.auditAuth('SESSION_REFRESHED', user.id);
    return this.formatAuthResponse(user, tokens);
  }

  private async validateUserCredentials(
    usernameOrEmail?: string,
    password?: string,
  ) {
    const key = String(usernameOrEmail ?? '').trim();
    const pwd = typeof password === 'string' ? password : '';
    const reject = () =>
      new RpcException({
        message: 'Tên đăng nhập hoặc mật khẩu không hợp lệ',
        code: GRPC.UNAUTHENTICATED,
      });
    if (
      !key ||
      !pwd ||
      key.length > AUTH_DEFAULTS.loginIdentifierMaxLength ||
      Buffer.byteLength(pwd, 'utf8') > 72
    )
      throw reject();
    const user = await this.prisma.user.findFirst({
      where: { isActive: true, OR: [{ email: key }, { username: key }] },
      include: {
        credential: true,
        policies: { include: { resource: true } },
        jobPositions: {
          include: { unit: true, jobTitle: true },
          orderBy: [{ isPrimary: 'desc' }],
        },
      },
    });
    // Run the same password work for missing/disabled accounts to reduce account enumeration.
    const ok = await bcrypt.compare(
      pwd,
      user?.credential?.passwordHash || DUMMY_PASSWORD_HASH,
    );
    if (!user?.credential || !ok) throw reject();
    return user;
  }

  private async readRefreshSession(
    token: string,
  ): Promise<RefreshSession | null> {
    try {
      return await this.sessions.getRefresh(token);
    } catch (error) {
      if (error instanceof RefreshConflictError) {
        throw new RpcException({
          code: 10,
          message: 'Phiên đang được làm mới. Vui lòng thử lại.',
        });
      }
      throw error;
    }
  }
  private async validateRefreshTokenString(
    refreshToken?: string,
  ): Promise<RefreshSession> {
    const token = typeof refreshToken === 'string' ? refreshToken.trim() : '';
    if (!/^[a-f0-9]{80}$/.test(token))
      throw new RpcException({
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        code: GRPC.UNAUTHENTICATED,
      });
    const session = await this.readRefreshSession(token);
    if (!session || !(await this.sessions.touchSession(session))) {
      this.auditAuth('REFRESH_REJECTED');
      throw new RpcException({
        message: 'Phiên đăng nhập không hợp lệ hoặc đã hết hạn',
        code: GRPC.UNAUTHENTICATED,
      });
    }
    return session;
  }

  private generateAuthTokens(session: RefreshSession) {
    const refreshTokenExpiresIn =
      session.expiresAt - Math.floor(Date.now() / 1000);
    if (refreshTokenExpiresIn <= 0)
      throw new RpcException({
        code: GRPC.UNAUTHENTICATED,
        message: 'Phiên đăng nhập đã hết hạn',
      });
    const expiresIn = Math.min(
      this.sessions.policy.accessSeconds,
      refreshTokenExpiresIn,
    );
    const refreshToken = randomBytes(40).toString('hex');
    const accessToken = this.auth.signAccessToken(
      session.userId,
      expiresIn,
      session.sessionId,
    );
    return { accessToken, refreshToken, expiresIn, refreshTokenExpiresIn };
  }

  private formatAuthResponse(user: any, tokens: any) {
    return {
      ...tokens,
      ...this.toUserResponse(user),
      userId: user.id,
      unitName: user.jobPositions?.[0]?.unit?.name ?? '',
    };
  }

  async revokeRefreshToken(data: { refreshToken: string }) {
    const token =
      typeof data.refreshToken === 'string' ? data.refreshToken.trim() : '';
    if (token) await this.sessions.revokeRefresh(token);
    this.auditAuth('LOGOUT');
    return { success: true };
  }

  private auditAuth(event: string, userId?: number) {
    this.logger.log(
      JSON.stringify({
        type: 'AUTH_AUDIT',
        event,
        userId,
        timestamp: new Date().toISOString(),
      }),
    );
  }

  async setPassword(data: { userId: number; newPassword: string }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
      include: { credential: true },
    });
    if (!user)
      throw new RpcException({
        message: 'User not found',
        code: GRPC.NOT_FOUND,
      });
    this.assertPasswordPolicy(data.newPassword);
    const hash = await bcrypt.hash(data.newPassword, 10);
    if (user.credential) {
      await this.prisma.credential.update({
        where: { userId: data.userId },
        data: { passwordHash: hash },
      });
    } else {
      await this.prisma.credential.create({
        data: { userId: data.userId, passwordHash: hash },
      });
    }
    await this.sessions.revokeAllForUser(data.userId);
    this.auditAuth('PASSWORD_CHANGED', data.userId);
    return { success: true };
  }

  private assertPasswordPolicy(password: string) {
    if (
      typeof password !== 'string' ||
      password.length < AUTH_DEFAULTS.passwordMinLength ||
      Buffer.byteLength(password, 'utf8') > AUTH_DEFAULTS.passwordMaxBytes ||
      !password.trim()
    ) {
      throw new RpcException({
        code: GRPC.INVALID_ARGUMENT,
        message: 'Mật khẩu phải có ít nhất 12 ký tự và tối đa 72 byte UTF-8.',
      });
    }
  }

  async findOne(data: { id: number }) {
    const cacheKey = `user:profile:${data.id}`;
    const cachedData = await this.cache.get<any>(cacheKey);
    if (cachedData) {
      return cachedData;
    }

    const user = await this.fetchUserWithRelations(data.id);
    const response = this.mapUserPermissionsAndRoles(user);

    await this.cache.set(cacheKey, response, 600000);

    return response;
  }

  private async fetchUserWithRelations(id: number) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      include: {
        policies: { include: { resource: true } },
        UserToUserGroup: {
          include: {
            user_groups: {
              include: {
                policies: { include: { resource: true } },
              },
            },
          },
        },
        jobPositions: {
          where: { endDate: null },
          include: { unit: true, jobTitle: true },
          orderBy: [{ isPrimary: 'desc' }],
        },
      },
    });

    if (!user) {
      throw new RpcException({
        message: `User with id ${id} not found`,
        code: GRPC.NOT_FOUND,
      });
    }
    return user;
  }

  private mapUserPermissionsAndRoles(user: any) {
    const base = this.toUserResponse(user);
    const roleNames: string[] = [];
    const permissionsFlattenSet = new Set<string>();
    const policiesList: any[] = [];

    const allPolicies = [...(user.policies ?? [])];
    if (user.UserToUserGroup) {
      for (const utg of user.UserToUserGroup) {
        if (utg.user_groups && utg.user_groups.policies) {
          allPolicies.push(...utg.user_groups.policies);
          roleNames.push(utg.user_groups.name);
        }
      }
    }

    for (const policy of allPolicies) {
      const resourceCode = policy.resource?.code ?? '';
      if (resourceCode && policy.action) {
        permissionsFlattenSet.add(`${resourceCode}:${policy.action}`);
        if (policy.action === '*') {
          const commonActions = [
            'READ',
            'CREATE',
            'UPDATE',
            'DELETE',
            'VIEW',
            'MANAGE',
            'PUBLISH',
            'APPROVE',
            'ASSIGN',
            'PARTICIPATE',
          ];
          commonActions.forEach((a) => {
            permissionsFlattenSet.add(`${resourceCode}:${a}`);
            permissionsFlattenSet.add(`${resourceCode}.${a}`);
          });
          permissionsFlattenSet.add(`${resourceCode}.*`);
        }
      }
      policiesList.push({
        description: `${policy.action} trên ${policy.resource?.name ?? policy.resource?.code ?? policy.resourceId ?? '—'}`,
        resource: policy.resource?.code ?? String(policy.resourceId ?? '—'),
        action: policy.action,
        effect: policy.effect ?? 'ALLOW',
      });
    }

    const permissionsFlatten = Array.from(permissionsFlattenSet);

    const firstPosition = user.jobPositions?.[0];
    const unitId = firstPosition?.unit?.id ?? null;
    const unitCode = firstPosition?.unit?.code ?? null;
    const jobTitleCode = firstPosition?.jobTitle?.code ?? null;

    return {
      ...base,
      roleNames,
      role_names: roleNames,
      policies: policiesList,
      permissionsFlatten,
      permissions_flatten: permissionsFlatten,
      unitId,
      unit_id: unitId,
      jobTitleCode,
      job_title_code: jobTitleCode,
      unitCode,
      unit_code: unitCode,
    };
  }

  /** Danh sách user (trả về id, email, username, fullName, phoneNumber, avatarUrl, isActive) */
  async listUsers(
    data: {
      skip?: number;
      take?: number;
      unitCodeStartsWith?: string;
      search?: string;
    } = {},
  ) {
    const skip = data.skip ?? 0;
    const take = data.take && data.take > 0 ? Math.min(data.take, 500) : 500;

    const whereCondition: any = {};
    if (data.unitCodeStartsWith) {
      whereCondition.jobPositions = {
        some: {
          unit: {
            code: {
              startsWith: data.unitCodeStartsWith,
            },
          },
        },
      };
    }

    if (data.search) {
      whereCondition.OR = [
        { email: { contains: data.search } },
        { username: { contains: data.search } },
        { fullName: { contains: data.search } },
        { phoneNumber: { contains: data.search } },
      ];
    }

    const [total, allUsers] = await Promise.all([
      this.prisma.user.count({ where: whereCondition }),
      this.prisma.user.findMany({
        where: whereCondition,
        orderBy: { id: 'asc' },
        skip,
        take,
        include: {
          jobPositions: {
            where: { endDate: null },
            include: {
              unit: { select: { id: true, code: true, name: true } },
              jobTitle: {
                select: { id: true, code: true, name: true, rank: true },
              },
            },
          },
        },
      }),
    ]);

    return {
      data: allUsers.map((u: any) => this.toUserResponse(u)),
      meta: {
        total,
        skip,
        take,
      },
    };
  }

  /**
   * Truy vấn thông tin của nhiều user cùng lúc dựa vào mảng ID (dùng cho API Gateway aggregate data).
   */
  async getUsersByIds(data: { ids: number[] }) {
    if (!data.ids || data.ids.length === 0) {
      return { data: [] };
    }
    const validIds = data.ids.filter((id) => id > 0);
    if (validIds.length === 0) {
      return { data: [] };
    }

    const users = await this.prisma.user.findMany({
      where: { id: { in: validIds } },
      include: {
        jobPositions: {
          include: { unit: true, jobTitle: true },
          orderBy: [{ isPrimary: 'desc' }],
        },
      },
    });

    const results = users.map((u: any) => {
      const base = this.toUserResponse(u);
      const firstPos = u.jobPositions?.[0];
      const roleNames: string[] = [];
      return {
        ...base,
        roleNames,
        role_names: roleNames,
        unitName: firstPos?.unit?.name ?? '',
        unit_name: firstPos?.unit?.name ?? '',
        jobTitleName: firstPos?.jobTitle?.name ?? '',
        job_title_name: firstPos?.jobTitle?.name ?? '',
        unitCode: firstPos?.unit?.code ?? null,
        unit_code: firstPos?.unit?.code ?? null,
      };
    });

    return { data: results };
  }

  /** Khóa/mở tài khoản (isActive = false/true) */
  async setUserActive(data: { userId: number; isActive: boolean }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.userId },
    });
    if (!user) {
      throw new RpcException({
        message: `User with id ${data.userId} not found`,
        code: GRPC.NOT_FOUND,
      });
    }
    await this.prisma.user.update({
      where: { id: data.userId },
      data: { isActive: data.isActive },
    });
    if (!data.isActive) await this.sessions.revokeAllForUser(data.userId);
    await this.cache.del(`user:profile:${data.userId}`);
    this.auditAuth(
      data.isActive ? 'ACCOUNT_ENABLED' : 'ACCOUNT_DISABLED',
      data.userId,
    );
    return {
      success: true,
      message: data.isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.',
    };
  }

  async assignUserGroups(data: { userId: number; userGroupIds: number[] }) {
    await this.prisma.$transaction(async (tx: any) => {
      await tx.userToUserGroup.deleteMany({
        where: { A: data.userId },
      });
      if (data.userGroupIds && data.userGroupIds.length > 0) {
        await tx.userToUserGroup.createMany({
          data: data.userGroupIds.map((groupId) => ({
            A: data.userId,
            B: groupId,
          })),
        });
      }
    });

    await this.clearUserProfileCache(data.userId);

    return {
      success: true,
      message: 'Đã cập nhật nhóm quyền.',
    };
  }

  async getSubordinates(data: { userId: number }) {
    const user = await this.fetchUserForSubordinates(data.userId);
    const activeJobPositions = user.jobPositions.filter(
      (pos: any) => pos.unitId && pos.jobTitle,
    );
    const unitIds = activeJobPositions.map((pos: any) => pos.unitId);

    const result = {
      deptIds: new Set<number>(),
      empCodes: new Set<string>(),
      domainIds: new Set<number>(),
    };

    const userPolicies: any[] = [...(user.policies || [])];
    if (user.UserToUserGroup) {
      user.UserToUserGroup.forEach((utg: any) => {
        if (utg.user_groups?.policies) {
          userPolicies.push(...utg.user_groups.policies);
        }
      });
    }
    const delegatePolicies = userPolicies
      .filter((p: any) => p.action === 'DELEGATE' && p.effect === 'ALLOW')
      .map((p) => ({
        ...p,
        conditionsParsed: p.conditions
          ? typeof p.conditions === 'string'
            ? JSON.parse(p.conditions)
            : p.conditions
          : {},
      }));

    if (unitIds.length > 0) {
      const orgData = await this.fetchOrganizationDataForSubordinates(
        unitIds,
        activeJobPositions,
      );

      for (const pos of activeJobPositions) {
        this.processJobPositionSubordinates(
          pos,
          orgData,
          user.employeeCode ?? null,
          result,
          delegatePolicies,
        );
      }
    }

    await this.processChildUnitsPositions(result);

    if (user.employeeCode) {
      result.empCodes.delete(user.employeeCode);
    }

    return this.formatSubordinatesResponse(result);
  }

  async findUsersByConditions(data: {
    callerUserId: number;
    unitScope: string;
    rankOperator: string;
    rankValue?: string;
  }) {
    const user = await this.fetchUserForSubordinates(data.callerUserId);
    const activeJobPositions = user.jobPositions.filter(
      (pos: any) => pos.unitId && pos.jobTitle,
    );
    const unitIds = activeJobPositions.map((pos: any) => pos.unitId);

    const result = {
      deptIds: new Set<number>(),
      empCodes: new Set<string>(),
      domainIds: new Set<number>(),
    };

    if (unitIds.length > 0) {
      const orgData = await this.fetchOrganizationDataForSubordinates(
        unitIds,
        activeJobPositions,
      );

      for (const pos of activeJobPositions) {
        this.processJobPositionSubordinates(
          pos,
          orgData,
          user.employeeCode ?? null,
          result,
          [
            {
              action: 'DELEGATE',
              effect: 'ALLOW',
              conditionsParsed: {
                unitScope: data.unitScope,
                targetRankOperator: data.rankOperator,
                targetRankValue: data.rankValue,
              },
            },
          ],
        );
      }
    }

    await this.processChildUnitsPositions(result);

    if (user.employeeCode) {
      result.empCodes.delete(user.employeeCode);
    }

    return this.formatSubordinatesResponse(result);
  }

  private async fetchUserForSubordinates(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
      include: {
        jobPositions: {
          where: { endDate: null },
          include: { jobTitle: true, unit: true },
        },
        policies: { include: { resource: true } },
        UserToUserGroup: {
          include: {
            user_groups: {
              include: {
                policies: { include: { resource: true } },
              },
            },
          },
        },
      },
    });
    if (!user) {
      throw new RpcException({
        message: 'User không tồn tại',
        code: GRPC.NOT_FOUND,
      });
    }
    return user;
  }

  private async fetchOrganizationDataForSubordinates(
    unitIds: number[],
    activeJobPositions: any[],
  ) {
    const [allRanksData, childUnitsData, staffingsData] = await Promise.all([
      this.prisma.jobPosition.findMany({
        where: {
          unitId: { in: unitIds },
          endDate: null,
          user: { is: { isActive: true } },
        },
        include: { jobTitle: true, user: true },
      }),
      this.prisma.organizationUnit.findMany({
        where: { parentId: { in: unitIds } },
      }),
      this.prisma.organizationStaffing.findMany({
        where: {
          OR: activeJobPositions.map((pos) => ({
            unitId: pos.unitId,
            jobTitleId: pos.jobTitleId,
          })),
        },
        include: {
          slots: { include: { monitoredUnits: true, domains: true } },
        },
      }),
    ]);
    return { allRanksData, childUnitsData, staffingsData };
  }

  private processJobPositionSubordinates(
    pos: any,
    orgData: any,
    employeeCode: string | null,
    result: {
      deptIds: Set<number>;
      empCodes: Set<string>;
      domainIds: Set<number>;
    },
    delegatePolicies: any[] = [],
  ) {
    const { allRanksData, childUnitsData, staffingsData } = orgData;
    const myRank = pos.jobTitle.rank;
    const allRanksInUnit = allRanksData.filter(
      (p: any) => p.unitId === pos.unitId,
    );

    const distinctRanksInUnit = [
      ...new Set(allRanksInUnit.map((p: any) => p.jobTitle.rank)),
    ].sort((a: any, b: any) => a - b) as number[];
    const minRank =
      distinctRanksInUnit.length > 0 ? distinctRanksInUnit[0] : myRank;
    const secondMinRank =
      distinctRanksInUnit.length > 1 ? distinctRanksInUnit[1] : minRank;

    const childUnits = childUnitsData.filter(
      (c: any) => c.parentId === pos.unitId,
    );
    const hasChildUnits = childUnits.length > 0;

    // 1 & 2. Giao việc bằng Policy Động (Dynamic PBAC) hoặc Hardcode (Fallback)
    let hasDynamicPolicies = false;
    for (const policy of delegatePolicies) {
      const cond = policy.conditionsParsed;
      if (!cond) continue;
      hasDynamicPolicies = true;

      // 1. Giao trong cùng đơn vị
      if (cond.unitScope === 'SAME_UNIT' || cond.unitScope === 'ALL') {
        allRanksInUnit.forEach((p: any) => {
          let isValid = false;
          const targetRank = p.jobTitle.rank;
          if (cond.targetRankOperator === 'lt') isValid = targetRank > myRank;
          if (cond.targetRankOperator === 'lte') isValid = targetRank >= myRank;
          if (cond.targetRankOperator === 'any') isValid = true;
          if (cond.targetRankOperator === 'exact' && cond.targetRankValue) {
            const exactValue =
              cond.targetRankValue === 'minRank'
                ? minRank
                : cond.targetRankValue === 'secondMinRank'
                  ? secondMinRank
                  : Number(cond.targetRankValue);
            isValid = targetRank === exactValue;
          }
          if (isValid && p.user?.employeeCode)
            result.empCodes.add(p.user.employeeCode);
        });
      }

      // 2. Đối với đơn vị cấp dưới
      if (cond.unitScope === 'CHILD_UNIT' || cond.unitScope === 'ALL') {
        childUnits.forEach((child: any) => result.deptIds.add(child.id));
      }
    }

    if (!hasDynamicPolicies) {
      // Logic cũ (Fallback)
      const sameUnitSubordinates = this.getSubordinatesInSameUnitMemory(
        pos,
        myRank,
        distinctRanksInUnit,
        hasChildUnits,
        allRanksInUnit,
      );
      sameUnitSubordinates.forEach((code) => result.empCodes.add(code));

      const isHead = myRank === minRank;
      const isDeputy = myRank === secondMinRank && myRank > minRank;
      if (isHead || isDeputy) {
        childUnits.forEach((child: any) => result.deptIds.add(child.id));
      }
    }

    // 3. Xác định các đơn vị được phân công theo dõi (Staffing slots) - Đã tối ưu O(N) functional
    staffingsData
      .filter(
        (st: any) =>
          st.unitId === pos.unitId && st.jobTitleId === pos.jobTitleId,
      )
      .flatMap((st: any) => st.slots || [])
      .filter((slot: any) => slot.assignedEmployeeCode === employeeCode)
      .forEach((slot: any) => {
        (slot.monitoredUnits || []).forEach((mu: any) =>
          result.deptIds.add(mu.unitId),
        );
        (slot.domains || []).forEach((d: any) =>
          result.domainIds.add(d.domainId),
        );
      });
  }

  private async processChildUnitsPositions(result: {
    deptIds: Set<number>;
    empCodes: Set<string>;
    domainIds: Set<number>;
  }) {
    const deptIdsArray = Array.from(result.deptIds);
    if (deptIdsArray.length === 0) return;

    const allChildPositions = await this.prisma.jobPosition.findMany({
      where: {
        unitId: { in: deptIdsArray },
        endDate: null,
        user: { is: { isActive: true } },
      },
      select: {
        unitId: true,
        jobTitle: { select: { rank: true } },
        user: { select: { employeeCode: true } },
      },
    });

    const positionsByUnit = new Map<number, any[]>();
    allChildPositions.forEach((pos: any) => {
      if (!positionsByUnit.has(pos.unitId)) positionsByUnit.set(pos.unitId, []);
      positionsByUnit.get(pos.unitId)!.push(pos);
    });

    for (const positions of positionsByUnit.values()) {
      const topRank = Math.min(
        ...positions.map((p) => p.jobTitle?.rank ?? Infinity),
      );
      positions
        .filter((p) => p.jobTitle?.rank === topRank && p.user?.employeeCode)
        .forEach((p) => result.empCodes.add(p.user.employeeCode));
    }
  }

  private formatSubordinatesResponse(result: {
    deptIds: Set<number>;
    empCodes: Set<string>;
    domainIds: Set<number>;
  }) {
    const deptIds = Array.from(result.deptIds);
    const empCodes = Array.from(result.empCodes);
    const domainIds = Array.from(result.domainIds);
    return {
      allowedDepartmentIds: deptIds,
      allowedEmployeeCodes: empCodes,
      allowedDomainIds: domainIds,
      allowed_department_ids: deptIds,
      allowed_employee_codes: empCodes,
      allowed_domain_ids: domainIds,
    };
  }

  private getSubordinatesInSameUnitMemory(
    pos: any,
    myRank: number,
    distinctRanksInUnit: number[],
    hasChildUnits: boolean,
    allRanksInUnit: any[],
  ): string[] {
    const minRank =
      distinctRanksInUnit.length > 0 ? distinctRanksInUnit[0] : myRank;
    const secondMinRank =
      distinctRanksInUnit.length > 1 ? distinctRanksInUnit[1] : minRank;
    const isHead = myRank === minRank;
    const isDeputy = myRank === secondMinRank && myRank > minRank;

    // Trường hợp 1: Phòng ban cụ thể / cuối cùng (không có đơn vị con)
    // -> Thấy TẤT CẢ chức vụ thấp hơn trong cùng đơn vị
    if (!hasChildUnits) {
      return allRanksInUnit
        .filter((p) => p.jobTitle.rank > myRank && p.user?.employeeCode)
        .map((p) => p.user.employeeCode) as string[];
    }

    // Trường hợp 2: Đơn vị cấp trên (có đơn vị con) - Logic phân cấp chặt chẽ cũ
    // Cấp trưởng giao cho phó (cùng đơn vị, hoặc rank liền kề nếu không có phó)
    if (isHead) {
      if (distinctRanksInUnit.length <= 1) return [];
      return allRanksInUnit
        .filter(
          (p) => p.jobTitle.rank === secondMinRank && p.user?.employeeCode,
        )
        .map((p) => p.user.employeeCode) as string[];
    }

    // Cấp phó không giao việc cho chuyên viên trong cùng đơn vị (theo logic cũ)
    if (isDeputy) {
      return [];
    }

    // Chuyên viên không giao cho ai
    return [];
  }

  async getEmployeesByScope(domainId?: number, monitoredUnitId?: number) {
    const employeeCodes = new Set<string>();

    if (!domainId && !monitoredUnitId) {
      return { employeeCodes: [] };
    }

    const whereObj: any = {};
    if (domainId) {
      whereObj.domains = { some: { domainId } };
    }
    if (monitoredUnitId) {
      whereObj.monitoredUnits = { some: { unitId: monitoredUnitId } };
    }

    const slots = await this.prisma.staffingSlot.findMany({
      where: whereObj,
      select: { assignedEmployeeCode: true },
    });

    for (const slot of slots) {
      if (slot.assignedEmployeeCode) {
        employeeCodes.add(slot.assignedEmployeeCode);
      }
    }

    return { employeeCodes: Array.from(employeeCodes) };
  }

  private toUserResponse(user: {
    id: number;
    email: string;
    username: string | null;
    fullName: string | null;
    phoneNumber: string | null;
    avatarUrl: string | null;
    isActive: boolean | null;
    cccd?: string | null;
    employeeCode?: string | null;
  }) {
    return {
      id: user.id,
      email: user.email,
      username: user.username ?? '',
      fullName: user.fullName ?? '',
      phoneNumber: user.phoneNumber ?? '',
      avatarUrl: user.avatarUrl ?? '',
      isActive: user.isActive ?? true,
      cccd: user.cccd ?? '',
      employeeCode: user.employeeCode ?? '',
    };
  }
}
