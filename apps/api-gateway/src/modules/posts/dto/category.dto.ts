import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export enum LinkType {
  STANDARD = 'standard',
  STATIC = 'static',
  EXTERNAL = 'external',
}

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  name: string;

  @ApiProperty()
  @IsString()
  slug: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional({ enum: LinkType, default: LinkType.STANDARD })
  @IsEnum(LinkType)
  @IsOptional()
  linkType?: LinkType;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  customUrl?: string;

  @ApiPropertyOptional({ default: '_self' })
  @IsString()
  @IsOptional()
  target?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  parentId?: string;

  @ApiPropertyOptional({ default: 0 })
  @IsInt()
  @IsOptional()
  @Type(() => Number)
  orderIndex?: number;

  @ApiPropertyOptional({ default: true })
  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaTitle?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  metaDescription?: string;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isGovStandard?: boolean;
}

export class UpdateCategoryDto extends CreateCategoryDto {}

export class CategoryQueryDto {
  @ApiPropertyOptional({ enum: ['flat', 'tree', 'subtree', 'forPost'], default: 'flat' })
  @IsOptional()
  @IsString()
  mode?: string = 'flat';

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  id?: string;

  @ApiPropertyOptional()
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  page?: number = 1;

  @ApiPropertyOptional({ default: 10 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  pageSize?: number = 10;
}
