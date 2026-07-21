import { Controller } from '@nestjs/common';
import { GrpcMethod, RpcException, Payload } from '@nestjs/microservices';
import { CreateUserGrpcDto, LoginGrpcDto, RefreshGrpcDto, SetPasswordGrpcDto, FindOneGrpcDto, ListUsersGrpcDto, GetUsersByIdsGrpcDto, SetUserActiveGrpcDto, AssignRolesGrpcDto, AssignPositionGrpcDto, GetSubordinatesGrpcDto } from './dto/user.grpc.dto';
import { status as GrpcStatus } from '@grpc/grpc-js';
import { UsersService } from './users.service';

@Controller()
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @GrpcMethod('UserService', 'CreateUser')
  async createUser(@Payload() data: CreateUserGrpcDto) {
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
        createdByUserId:
          data.createdByUserId ?? data.created_by_user_id ?? undefined,
        createdByEmail:
          data.createdByEmail ?? data.created_by_email ?? undefined,
      });
    } catch (e: any) {
      if (e instanceof RpcException) throw e;
      const message = e?.message ?? e?.meta?.cause ?? 'Lỗi tạo tài khoản';
      throw new RpcException({
        code: GrpcStatus.INVALID_ARGUMENT,
        message: String(message),
      });
    }
  }

  @GrpcMethod('UserService', 'Login')
  login(@Payload() data: LoginGrpcDto) {
    return this.usersService.login({
      usernameOrEmail: data.usernameOrEmail ?? data.username_or_email ?? '',
      password: data.password ?? '',
      deviceInfo: data.deviceInfo ?? data.device_info,
      ipAddress: data.ipAddress ?? data.ip_address,
    });
  }

  @GrpcMethod('UserService', 'Refresh')
  refresh(@Payload() data: RefreshGrpcDto) {
    return this.usersService.refresh({
      refreshToken: data.refreshToken ?? data.refresh_token ?? '',
      deviceInfo: data.deviceInfo ?? data.device_info,
      ipAddress: data.ipAddress ?? data.ip_address,
    });
  }

  @GrpcMethod('UserService', 'RevokeRefreshToken')
  revokeRefreshToken(@Payload() data: { refreshToken: string }) {
    return this.usersService.revokeRefreshToken(data);
  }

  @GrpcMethod('UserService', 'SetPassword')
  setPassword(@Payload() data: SetPasswordGrpcDto) {
    return this.usersService.setPassword(data);
  }

  @GrpcMethod('UserService', 'FindOne')
  async findOne(@Payload() data: FindOneGrpcDto) {
    return this.usersService.findOne(data);
  }

  @GrpcMethod('UserService', 'GetEmployeesByScope')
  getEmployeesByScope(@Payload() data: { domain_id?: number, monitored_unit_id?: number }) {
    return this.usersService.getEmployeesByScope(data.domain_id, data.monitored_unit_id);
  }

  @GrpcMethod('UserService', 'ListUsers')
  async listUsers(@Payload() data: ListUsersGrpcDto = {}) {
    return this.usersService.listUsers({
      skip: data.skip ?? 0,
      take: data.take ?? 500,
      search: data.search,
    });
  }

  @GrpcMethod('UserService', 'GetUsersByIds')
  async getUsersByIds(@Payload() data: GetUsersByIdsGrpcDto) {
    return this.usersService.getUsersByIds({
      ids: data.ids ?? [],
    });
  }

  @GrpcMethod('UserService', 'SetUserActive')
  async setUserActive(@Payload() data: SetUserActiveGrpcDto) {
    const userId = data.userId ?? data.user_id ?? 0;
    const isActive = data.isActive ?? data.is_active ?? true;
    return this.usersService.setUserActive({ userId, isActive });
  }

  @GrpcMethod('UserService', 'AssignRoles')
  async assignRoles(@Payload() data: AssignRolesGrpcDto) {
    const userId = data.userId ?? data.user_id ?? 0;
    const roleIds = data.roleIds ?? data.role_ids ?? [];
    return this.usersService.assignRoles({ userId, roleIds });
  }

  @GrpcMethod('UserService', 'AssignPosition')
  async assignPosition(@Payload() data: AssignPositionGrpcDto) {
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

  @GrpcMethod('UserService', 'GetSubordinates')
  async getSubordinates(@Payload() data: GetSubordinatesGrpcDto) {
    const userId = data.userId ?? data.user_id ?? 0;
    return this.usersService.getSubordinates({ userId });
  }
}
