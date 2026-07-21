import { IsString, IsOptional, IsInt, IsBoolean, IsArray } from 'class-validator';

export class CreateEmployeeGrpcDto {
  @IsString() @IsOptional() firstname?: string;
  @IsString() @IsOptional() lastname?: string;
  @IsString() @IsOptional() fullName?: string;
  @IsString() @IsOptional() employeeCode?: string;
  @IsString() @IsOptional() email?: string;
  @IsString() @IsOptional() phone?: string;
  @IsString() @IsOptional() gender?: string;
  @IsString() @IsOptional() birthday?: string;
  @IsString() @IsOptional() identityCard?: string;
  @IsInt() @IsOptional() departmentId?: number;
  @IsInt() @IsOptional() jobTitleId?: number;
  @IsInt() @IsOptional() civilServantRankId?: number;
  @IsInt() @IsOptional() partyTitleId?: number;
  @IsString() @IsOptional() startDate?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() address?: string;
  @IsString() @IsOptional() avatar?: string;
}

export class UpdateEmployeeGrpcDto extends CreateEmployeeGrpcDto {
  @IsInt() id: number;
}

export class IdGrpcDto {
  @IsInt() id: number;
}

export class CodeGrpcDto {
  @IsString() code: string;
}

export class ListEmployeesGrpcDto {
  @IsInt() @IsOptional() page?: number;
  @IsInt() @IsOptional() pageSize?: number;
  @IsString() @IsOptional() keyword?: string;
  @IsInt() @IsOptional() departmentId?: number;
  @IsInt() @IsOptional() jobTitleId?: number;
  @IsString() @IsOptional() status?: string;
  @IsBoolean() @IsOptional() includeChildren?: boolean;
}
