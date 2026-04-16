import {
  IsString,
  IsOptional,
  IsBoolean,
  IsEnum,
  IsInt,
  IsDateString,
} from 'class-validator';
import { BannerPosition, BannerLinkType } from '@generated/prisma/client';

export class CreateBannerDto {
  @IsString()
  name: string;

  @IsString()
  slug: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  imageUrl: string;

  @IsEnum(BannerLinkType)
  @IsOptional()
  linkType?: BannerLinkType;

  @IsString()
  @IsOptional()
  customUrl?: string;

  @IsString()
  @IsOptional()
  target?: string;

  @IsEnum(BannerPosition)
  @IsOptional()
  position?: BannerPosition;

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

  @IsDateString()
  @IsOptional()
  startAt?: string;

  @IsDateString()
  @IsOptional()
  endAt?: string;
}
