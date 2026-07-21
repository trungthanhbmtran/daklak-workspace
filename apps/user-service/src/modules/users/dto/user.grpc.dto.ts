import { IsString, IsInt, IsOptional, IsBoolean, IsArray } from 'class-validator';

export class CreateUserGrpcDto {
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() username?: string;
  @IsString() @IsOptional() password?: string;
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional() full_name?: string;
  @IsString() @IsOptional() phoneNumber?: string;
  @IsString() @IsOptional() phone_number?: string;
  @IsArray() @IsOptional() roleIds?: number[];
  @IsArray() @IsOptional() role_ids?: number[];
  @IsString() @IsOptional() cccd?: string;
  @IsString() @IsOptional() employeeCode?: string;
  @IsString() @IsOptional() employee_code?: string;
  @IsInt() @IsOptional() createdByUserId?: number;
  @IsInt() @IsOptional() created_by_user_id?: number;
  @IsString() @IsOptional() createdByEmail?: string;
  @IsString() @IsOptional() created_by_email?: string;
}

export class LoginGrpcDto {
  @IsString() @IsOptional() usernameOrEmail?: string;
  @IsString() @IsOptional() username_or_email?: string;
  @IsString() @IsOptional() password?: string;
  @IsString() @IsOptional() deviceInfo?: string;
  @IsString() @IsOptional() device_info?: string;
  @IsString() @IsOptional() ipAddress?: string;
  @IsString() @IsOptional() ip_address?: string;
}

export class RefreshGrpcDto {
  @IsString() @IsOptional() refreshToken?: string;
  @IsString() @IsOptional() refresh_token?: string;
  @IsString() @IsOptional() deviceInfo?: string;
  @IsString() @IsOptional() device_info?: string;
  @IsString() @IsOptional() ipAddress?: string;
  @IsString() @IsOptional() ip_address?: string;
}

export class SetPasswordGrpcDto {
  @IsInt() userId: number;
  @IsString() newPassword: string;
}

export class FindOneGrpcDto {
  @IsInt() id: number;
}

export class ListUsersGrpcDto {
  @IsInt() @IsOptional() skip?: number;
  @IsInt() @IsOptional() take?: number;
  @IsString() @IsOptional() search?: string;
}

export class GetUsersByIdsGrpcDto {
  @IsArray() @IsOptional() ids?: number[];
}

export class SetUserActiveGrpcDto {
  @IsInt() @IsOptional() userId?: number;
  @IsInt() @IsOptional() user_id?: number;
  @IsBoolean() @IsOptional() isActive?: boolean;
  @IsBoolean() @IsOptional() is_active?: boolean;
}

export class AssignRolesGrpcDto {
  @IsInt() @IsOptional() userId?: number;
  @IsInt() @IsOptional() user_id?: number;
  @IsArray() @IsOptional() roleIds?: number[];
  @IsArray() @IsOptional() role_ids?: number[];
}

export class AssignPositionGrpcDto {
  @IsInt() userId: number;
  @IsInt() unitId: number;
  @IsInt() jobTitleId: number;
  @IsBoolean() isPrimary: boolean;
}

export class GetSubordinatesGrpcDto {
  @IsInt() @IsOptional() userId?: number;
  @IsInt() @IsOptional() user_id?: number;
}
