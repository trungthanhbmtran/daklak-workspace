import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsObject,
  IsArray,
} from 'class-validator';

export class CreateIntegrationDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsNotEmpty()
  code: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  protocol?: string;

  @IsString()
  @IsNotEmpty()
  baseUrl: string;

  @IsString()
  @IsOptional()
  authType?: string;

  @IsObject()
  @IsOptional()
  authConfig?: any;

  @IsObject()
  @IsOptional()
  headers?: any;

  @IsArray()
  @IsOptional()
  endpoints?: any;

  @IsObject()
  @IsOptional()
  metadata?: any;

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}
