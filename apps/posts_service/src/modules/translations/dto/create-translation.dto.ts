import { IsString, IsOptional, IsEnum, IsUUID } from 'class-validator';
import { TranslationStatus } from '@generated/prisma/client';

export class CreateTranslationDto {
  @IsUUID()
  postId: string;

  @IsString()
  language: string;

  @IsString()
  title: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsOptional()
  contentJson?: any;

  @IsString()
  @IsOptional()
  content?: string;

  @IsEnum(TranslationStatus)
  @IsOptional()
  status?: TranslationStatus;

  @IsOptional()
  metaData?: any;
}
