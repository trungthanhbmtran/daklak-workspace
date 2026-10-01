import { IsString, IsEnum, IsUrl, IsArray, IsOptional, ValidateNested, IsNumber, IsBoolean } from 'class-validator';
import { Type } from 'class-transformer';

export enum UpstreamType {
  INTERNAL = 'internal',
  EXTERNAL = 'external',
}

export enum AuthKind {
  NONE = 'none',
  BEARER = 'bearer',
  API_KEY = 'apiKey',
  BASIC = 'basic',
  MTLS = 'mtls',
  OAUTH2_CLIENT_CREDENTIALS = 'oauth2_client_credentials',
}

export class UpstreamAuthDto {
  @IsEnum(AuthKind)
  kind: AuthKind;

  @IsString()
  @IsOptional()
  secretRef?: string;
}

export class UpstreamRetryDto {
  @IsNumber()
  times: number;

  @IsNumber()
  backoff: number;
}

export class UpstreamRateLimitDto {
  @IsNumber()
  windowMs: number;

  @IsNumber()
  max: number;
}

export class CreateUpstreamDto {
  @IsString()
  name: string;

  @IsEnum(UpstreamType)
  type: UpstreamType;

  @IsUrl({ require_tld: false })
  baseUrl: string;

  @IsArray()
  @IsString({ each: true })
  allowedPaths: string[];

  @IsArray()
  @IsString({ each: true })
  allowedMethods: string[];

  @ValidateNested()
  @Type(() => UpstreamAuthDto)
  auth: UpstreamAuthDto;

  @IsNumber()
  @IsOptional()
  timeoutMs?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpstreamRetryDto)
  retry?: UpstreamRetryDto;

  @IsNumber()
  @IsOptional()
  cacheTtlSec?: number;

  @IsOptional()
  @ValidateNested()
  @Type(() => UpstreamRateLimitDto)
  rateLimit?: UpstreamRateLimitDto;

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  roles?: string[];

  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  scopes?: string[];

  @IsOptional()
  requestSchema?: any;

  @IsNumber()
  @IsOptional()
  responseLimit?: number;

  @IsBoolean()
  @IsOptional()
  enabled?: boolean;
}

export class UpdateUpstreamDto extends CreateUpstreamDto {}
