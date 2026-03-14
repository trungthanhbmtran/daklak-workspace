import { Injectable, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { RpcException } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import * as bcrypt from 'bcrypt';
import { randomBytes } from 'crypto';
import { PrismaService } from '@/database/prisma.service';
import { ClientProxy } from '@nestjs/microservices';

const GRPC = { INVALID_ARGUMENT: 3, NOT_FOUND: 5, UNAUTHENTICATED: 16 } as const;

const REFRESH_TOKEN_PREFIX = 'refresh:';
const REFRESH_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 ngày

@Injectable()
export class UsersService {
  constructor(
    private prisma: PrismaService,
    private config: ConfigService,
    private jwt: JwtService,
    @Inject(CACHE_MANAGER) private cache: Cache,
    @Inject('NOTIFICATION_SERVICE') private readonly notiClient: ClientProxy,
  ) {}

  // Bổ nhiệm nhân sự (Assign Job Position)
  async assignPosition(dto: { userId: number; unitId: number; jobTitleId: number; isPrimary: boolean }) {

    // 1. Kiểm tra Định biên (Staffing Check)
    const staffing = await this.prisma.organizationStaffing.findUnique({
      where: {
        unitId_jobTitleId: { unitId: dto.unitId, jobTitleId: dto.jobTitleId },
      },
    });

    if (!staffing) {
      throw new RpcException({ message: 'Đơn vị này chưa có chỉ tiêu (Định biên) cho chức danh này.', code: GRPC.INVALID_ARGUMENT });
    }

    // 2. Logic so sánh: Nếu Đã dùng >= Chỉ tiêu -> Chặn
    if (staffing.currentCount >= staffing.quantity) {
      throw new RpcException({
        message: `Đã hết chỉ tiêu định biên! (Hiện có: ${staffing.currentCount}/${staffing.quantity})`,
        code: GRPC.INVALID_ARGUMENT,
      });
    }

    // 3. Thực hiện bổ nhiệm
    // Trigger SQL sẽ tự động +1 currentCount sau khi lệnh này chạy xong
    const newPosition = await this.prisma.jobPosition.create({
      data: {
        userId: dto.userId,
        unitId: dto.unitId,
        jobTitleId: dto.jobTitleId,
        isPrimary: dto.isPrimary,
      },
      // Include để lấy tên Unit và JobTitle gửi thông báo
      include: {
        unit: true,
        jobTitle: true,
        user: true,
      }
    });

    // 3. 🚀 BẮN SỰ KIỆN RABBITMQ (FIRE & FORGET)
    // Notification Service sẽ lắng nghe sự kiện này
    this.notiClient.emit('notification.position_assigned', {
      email: newPosition.user.email,
      fullName: newPosition.user.fullName,
      position: newPosition.jobTitle.name,
      department: newPosition.unit.name,
      timestamp: new Date(),
    });

    console.log(`📡 Đã bắn event bổ nhiệm cho User ${dto.userId}`);

    return newPosition;
  }

  async createUser(data: {
    email: string;
    username?: string;
    password?: string;
    fullName?: string | null;
    phoneNumber?: string | null;
    roleIds?: number[];
    cccd?: string | null;
    employeeCode?: string | null;
    createdByUserId?: number;
    createdByEmail?: string;
  }) {
    if (data.username) {
      const existing = await this.prisma.user.findUnique({ where: { username: data.username } });
      if (existing) throw new RpcException({ message: 'Username đã tồn tại', code: GRPC.INVALID_ARGUMENT });
    }
    const roleIds = (data.roleIds ?? []).filter((id) => id > 0);
    let user;
    try {
      user = await this.prisma.user.create({
        data: {
          email: data.email,
          username: data.username || null,
          fullName: data.fullName?.trim() || null,
          phoneNumber: data.phoneNumber?.trim() || null,
          cccd: data.cccd?.trim() || null,
          employeeCode: data.employeeCode?.trim() || null,
          ...(roleIds.length > 0 && { roles: { connect: roleIds.map((id) => ({ id })) } }),
        },
      });
    } catch (e: any) {
      if (e?.code === 'P2002') {
        const target = Array.isArray(e?.meta?.target) ? e.meta.target[0] : 'email';
        throw new RpcException({
          message: target === 'email' ? 'Email đã tồn tại' : target === 'username' ? 'Username đã tồn tại' : 'Dữ liệu trùng lặp',
          code: GRPC.INVALID_ARGUMENT,
        });
      }
      throw e;
    }
    if (data.password && data.password.trim()) {
      const hash = await bcrypt.hash(data.password, 10);
      await this.prisma.credential.create({
        data: { userId: user.id, passwordHash: hash },
      });
    }

    const tempPassword = data.password?.trim() ? data.password : undefined;
    const newUserDisplay = user.fullName?.trim() || user.username || user.email;

    try {
      if (data.createdByEmail?.trim()) {
        this.notiClient.emit('notification', {
          channel: 'email',
          recipient: data.createdByEmail.trim(),
          subject: 'Đã tạo tài khoản mới trên hệ thống',
          body: `Bạn đã tạo tài khoản thành công.\n\nNgười dùng: ${newUserDisplay}\nEmail: ${user.email}\nTên đăng nhập: ${user.username ?? user.email}\n\nThông báo đăng nhập đã được gửi tới email người dùng.`,
          metadata: { type: 'user_created', createdByUserId: data.createdByUserId, newUserId: user.id },
        });
      }
      this.notiClient.emit('notification', {
        channel: 'email',
        recipient: user.email,
        subject: 'Thông tin tài khoản đăng nhập',
        body: `Chào bạn,\n\nTài khoản đăng nhập hệ thống đã được tạo cho bạn.\n\nTên đăng nhập: ${user.username ?? user.email}\n${tempPassword ? `Mật khẩu tạm: ${tempPassword}\n\nVui lòng đổi mật khẩu sau lần đăng nhập đầu tiên.` : 'Vui lòng sử dụng chức năng "Quên mật khẩu" hoặc liên hệ quản trị để được cấp mật khẩu.'}\n\nTrân trọng.`,
        metadata: { type: 'user_created', newUserId: user.id },
      });
      console.log(`📡 Đã gửi thông báo tới phụ trách và email đăng nhập cho ${user.email}.`);
    } catch (err) {
      console.warn('Gửi thông báo email thất bại (RabbitMQ/notification service có thể chưa chạy):', (err as Error)?.message ?? err);
    }

    return this.toUserResponse(user);
  }

  /** Chuyển JWT expiresIn (vd "24h", "7d") sang số giây */
  private getAccessTokenExpiresInSeconds(): number {
    const raw = this.config.get('JWT_EXPIRES_IN', '24h');
    const str = String(raw).trim();
    const match = str.match(/^(\d+)(s|m|h|d)$/i);
    if (!match) return 24 * 60 * 60;
    const num = parseInt(match[1], 10);
    const unit = match[2].toLowerCase();
    if (unit === 's') return num;
    if (unit === 'm') return num * 60;
    if (unit === 'h') return num * 60 * 60;
    if (unit === 'd') return num * 24 * 60 * 60;
    return 24 * 60 * 60;
  }

  /** Đăng nhập bằng username hoặc email + mật khẩu. Refresh token lưu Redis. */
  async login(data: {
    usernameOrEmail: string;
    password: string;
    deviceInfo?: string;
    ipAddress?: string;
  }) {
    const key = String(data.usernameOrEmail ?? '').trim();
    const pwd = String(data.password ?? '').trim();
    if (!key || !pwd) {
      throw new RpcException({ message: 'Thiếu username/email hoặc mật khẩu', code: GRPC.UNAUTHENTICATED });
    }
    const user = await this.prisma.user.findFirst({
      where: {
        isActive: true,
        OR: [{ email: key }, { username: key }],
      },
      include: {
        credential: true,
        jobPositions: { include: { unit: true }, orderBy: [{ isPrimary: 'desc' }] },
      },
    });
    if (!user) {
      throw new RpcException({ message: 'Tài khoản không tồn tại', code: GRPC.UNAUTHENTICATED });
    }
    if (!user.credential) {
      throw new RpcException({ message: 'Tài khoản chưa đặt mật khẩu. Dùng SSO hoặc đặt mật khẩu trước.', code: GRPC.UNAUTHENTICATED });
    }
    const ok = await bcrypt.compare(pwd, user.credential.passwordHash);
    if (!ok) {
      throw new RpcException({ message: 'Mật khẩu sai', code: GRPC.UNAUTHENTICATED });
    }
    const refreshToken = randomBytes(40).toString('hex');
    await this.cache.set(
      REFRESH_TOKEN_PREFIX + refreshToken,
      String(user.id),
      REFRESH_TTL_SECONDS,
    );
    const jwtExpiresIn = this.config.get('JWT_EXPIRES_IN', '24h');
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: jwtExpiresIn },
    );
    const firstPosition = user.jobPositions?.[0];
    const unitName = firstPosition?.unit?.name ?? null;
    const expiresIn = this.getAccessTokenExpiresInSeconds();

    return {
      accessToken,
      refreshToken,
      userId: user.id,
      email: user.email,
      username: user.username ?? '',
      fullName: user.fullName ?? '',
      unitName: unitName ?? '',
      expiresIn,
      refreshTokenExpiresIn: REFRESH_TTL_SECONDS,
    };
  }

  /** Làm mới access_token bằng refresh_token (rotation). Refresh token lưu Redis. */
  async refresh(data: {
    refreshToken: string;
    deviceInfo?: string;
    ipAddress?: string;
  }) {
    const token = String(data.refreshToken ?? '').trim();
    if (!token) {
      throw new RpcException({ message: 'Thiếu refresh_token', code: GRPC.UNAUTHENTICATED });
    }
    const redisKey = REFRESH_TOKEN_PREFIX + token;
    const userIdStr = await this.cache.get<string>(redisKey);
    if (!userIdStr) {
      throw new RpcException({ message: 'Refresh token không hợp lệ hoặc đã hết hạn', code: GRPC.UNAUTHENTICATED });
    }
    const userId = parseInt(userIdStr, 10);
    await this.cache.del(redisKey);
    const user = await this.prisma.user.findFirst({
      where: { id: userId, isActive: true },
      include: { jobPositions: { include: { unit: true }, orderBy: [{ isPrimary: 'desc' }] } },
    });
    if (!user) {
      throw new RpcException({ message: 'User không tồn tại', code: GRPC.UNAUTHENTICATED });
    }
    const newRefreshToken = randomBytes(40).toString('hex');
    await this.cache.set(
      REFRESH_TOKEN_PREFIX + newRefreshToken,
      String(user.id),
      REFRESH_TTL_SECONDS,
    );
    const jwtExpiresIn = this.config.get('JWT_EXPIRES_IN', '24h');
    const accessToken = this.jwt.sign(
      { sub: user.id, email: user.email },
      { expiresIn: jwtExpiresIn },
    );
    const firstPosition = user.jobPositions?.[0];
    const unitName = firstPosition?.unit?.name ?? null;
    const expiresIn = this.getAccessTokenExpiresInSeconds();

    return {
      accessToken,
      refreshToken: newRefreshToken,
      userId: user.id,
      email: user.email,
      username: user.username ?? '',
      fullName: user.fullName ?? '',
      unitName: unitName ?? '',
      expiresIn,
      refreshTokenExpiresIn: REFRESH_TTL_SECONDS,
    };
  }

  /** Thu hồi refresh_token (đăng xuất thiết bị). Xóa khỏi Redis. */
  async revokeRefreshToken(data: { refreshToken: string }) {
    const token = String(data.refreshToken ?? '').trim();
    if (!token) return { success: true };
    await this.cache.del(REFRESH_TOKEN_PREFIX + token);
    return { success: true };
  }

  async setPassword(data: { userId: number; newPassword: string }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId }, include: { credential: true } });
    if (!user) throw new RpcException({ message: 'User not found', code: GRPC.NOT_FOUND });
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
    return { success: true };
  }

  async findOne(data: { id: number }) {
    const user = await this.prisma.user.findUnique({
      where: { id: data.id },
      include: { roles: true },
    });
    if (!user) {
      throw new RpcException({ message: `User with id ${data.id} not found`, code: GRPC.NOT_FOUND });
    }
    const base = this.toUserResponse(user);
    const roles = (user as { roles?: Array<{ id: number; name?: string | null; code?: string }> }).roles ?? [];
    const roleNames = roles.map((r) => (r.name && r.name.trim() !== '' ? r.name : r.code) ?? '');

    const roleIds = roles.map((r) => r.id);
    const policies: Array<{ description: string; resource: string }> = [];
    if (roleIds.length > 0) {
      const permissions = await this.prisma.permission.findMany({
        where: { roles: { some: { id: { in: roleIds } } } },
        include: { resource: true },
        distinct: ['id'],
      });
      for (const perm of permissions) {
        const res = perm.resource;
        const resourceCode = res?.code ?? '';
        const resourceName = res?.name ?? resourceCode;
        const description = `${perm.action} - ${resourceName}`.trim();
        policies.push({ description, resource: resourceCode });
      }
    }

    return {
      ...base,
      roleNames,
      role_names: roleNames,
      policies,
    };
  }

  /** Danh sách user (trả về id, email, username, fullName, phoneNumber, avatarUrl, isActive) */
  async listUsers(data: { skip?: number; take?: number } = {}) {
    const skip = data.skip ?? 0;
    const take = data.take && data.take > 0 ? Math.min(data.take, 500) : 500;
    const users = await this.prisma.user.findMany({
      skip,
      take,
      orderBy: { id: 'asc' },
    });
    return {
      items: users.map((u) => this.toUserResponse(u)),
    };
  }

  /** Khóa/mở tài khoản (isActive = false/true) */
  async setUserActive(data: { userId: number; isActive: boolean }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new RpcException({ message: `User with id ${data.userId} not found`, code: GRPC.NOT_FOUND });
    }
    await this.prisma.user.update({
      where: { id: data.userId },
      data: { isActive: data.isActive },
    });
    return { success: true, message: data.isActive ? 'Đã mở khóa tài khoản.' : 'Đã khóa tài khoản.' };
  }

  /** Gán lại vai trò cho user (thay thế toàn bộ role hiện tại). Lưu vào bảng _RoleToUser (quan hệ User-Role). */
  async assignRoles(data: { userId: number; roleIds?: number[]; role_ids?: number[] }) {
    const user = await this.prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      throw new RpcException({ message: `User with id ${data.userId} not found`, code: GRPC.NOT_FOUND });
    }
    const rawIds = data.roleIds ?? data.role_ids ?? [];
    const roleIds = Array.isArray(rawIds) ? rawIds.filter((id: number) => Number(id) > 0).map(Number) : [];
    await this.prisma.user.update({
      where: { id: data.userId },
      data: {
        roles: roleIds.length > 0 ? { set: roleIds.map((id) => ({ id })) } : { set: [] },
      },
    });
    return { success: true, message: 'Đã cập nhật vai trò.' };
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