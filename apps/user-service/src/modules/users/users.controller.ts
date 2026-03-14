import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException } from '@nestjs/microservices';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(data: {
    email?: string;
    username?: string;
    password?: string;
    fullName?: string;
    full_name?: string;
    phoneNumber?: string;
    phone_number?: string;
    roleIds?: number[];
    role_ids?: number[];
    cccd?: string;
    employeeCode?: string;
    employee_code?: string;
    createdByUserId?: number;
    created_by_user_id?: number;
    createdByEmail?: string;
    created_by_email?: string;
  }) {
    try {
      return await this.usersService.createUser({
        email: data.email ?? '',
        username: data.username,
        password: data.password,
        fullName: data.fullName ?? data.full_name ?? null,
        phoneNumber: data.phoneNumber ?? data.phone_number ?? null,
        roleIds: data.roleIds ?? data.role_ids ?? [],
        cccd: data.cccd ?? null,
        employeeCode: data.employeeCode ?? data.employee_code ?? null,
        createdByUserId: data.createdByUserId ?? data.created_by_user_id ?? undefined,
        createdByEmail: data.createdByEmail ?? data.created_by_email ?? undefined,
      });
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      const message = e?.message ?? e?.meta?.cause ?? 'Lỗi tạo tài khoản';
      throw new RpcException({ code: GrpcStatus.INVALID_ARGUMENT, message: String(message) });
    }
  }

  @GrpcMethod('UserService', 'Login')
  login(data: {
    usernameOrEmail?: string;
    username_or_email?: string;
    password?: string;
    deviceInfo?: string;
    device_info?: string;
    ipAddress?: string;
    ip_address?: string;
  }) {
    return this.usersService.login({
      usernameOrEmail: data.usernameOrEmail ?? data.username_or_email ?? '',
      password: data.password ?? '',
      deviceInfo: data.deviceInfo ?? data.device_info,
      ipAddress: data.ipAddress ?? data.ip_address,
    });
  }

  @GrpcMethod('UserService', 'Refresh')
  refresh(data: {
    refreshToken?: string;
    refresh_token?: string;
    deviceInfo?: string;
    device_info?: string;
    ipAddress?: string;
    ip_address?: string;
  }) {
    return this.usersService.refresh({
      refreshToken: data.refreshToken ?? data.refresh_token ?? '',
      deviceInfo: data.deviceInfo ?? data.device_info,
      ipAddress: data.ipAddress ?? data.ip_address,
    });
  }

  @GrpcMethod('UserService', 'RevokeRefreshToken')
  revokeRefreshToken(data: { refreshToken: string }) {
    return this.usersService.revokeRefreshToken(data);
  }

  @GrpcMethod('UserService', 'SetPassword')
  setPassword(data: { userId: number; newPassword: string }) {
    return this.usersService.setPassword(data);
  }

  @GrpcMethod('UserService', 'FindOne')
  async findOne(data: { id: number }) {
    return this.usersService.findOne(data);
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(data: { skip?: number; take?: number } = {}) {
    return this.usersService.listUsers({
      skip: data.skip ?? 0,
      take: data.take ?? 500,
    });
  }

  @GrpcMethod('UserService', 'SetUserActive')
  async setUserActive(data: { userId?: number; user_id?: number; isActive?: boolean; is_active?: boolean }) {
    const userId = data.userId ?? data.user_id ?? 0;
    const isActive = data.isActive ?? data.is_active ?? true;
    return this.usersService.setUserActive({ userId, isActive });
  }

  @GrpcMethod('UserService', 'AssignRoles')
  async assignRoles(data: { userId?: number; user_id?: number; roleIds?: number[]; role_ids?: number[] }) {
    const userId = data.userId ?? data.user_id ?? 0;
    const roleIds = data.roleIds ?? data.role_ids ?? [];
    return this.usersService.assignRoles({ userId, roleIds });
  }

  @GrpcMethod('UserService', 'AssignPosition')
  async assignPosition(data: { userId: number; unitId: number; jobTitleId: number; isPrimary: boolean }) {
    const result = await this.usersService.assignPosition({
      userId: data.userId,
      unitId: data.unitId,
      jobTitleId: data.jobTitleId,
      isPrimary: data.isPrimary,
    });
    return {
      id: result.id,
      userId: result.userId,
      unitId: result.unitId,
      jobTitleId: result.jobTitleId,
      isPrimary: result.isPrimary,
      unitName: result.unit?.name ?? '',
      jobTitleName: result.jobTitle?.name ?? '',
    };
  }
}