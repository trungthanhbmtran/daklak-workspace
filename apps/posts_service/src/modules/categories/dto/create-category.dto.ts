import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  IsUUID,
  ValidateIf,
} from 'class-validator';
import { LinkType } from '@generated/prisma/client';

export class CreateCategoryDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  thumbnail?: string;

  @IsEnum(LinkType)
  @IsOptional()
  linkType?: LinkType;

  @IsString()
  @IsOptional()
  customUrl?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsOptional()
  @ValidateIf((o) => o.parentId !== '' && o.parentId !== null)
  @IsUUID()
  parentId?: string | null;

  @IsInt()
  @IsOptional()
  orderIndex?: number;

  @IsBoolean()
  @IsOptional()
  status?: boolean;

  @IsString()
  @IsOptional()
  metaTitle?: string;

  @IsString()
  @IsOptional()
  metaDescription?: string;

  @IsBoolean()
  @IsOptional()
  isGovStandard?: boolean;
}
