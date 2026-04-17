import { IsString, IsOptional, IsBoolean, IsArray, IsUUID } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreatePostDto {
  @ApiProperty()
  @IsString()
  title: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty()
  @IsString()
  content: string;

  @ApiPropertyOptional()
  @IsOptional()
  contentJson?: any;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  slug?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  thumbnail?: string;

  @ApiPropertyOptional()
  @IsUUID()
  @IsOptional()
  categoryId?: string;

  @ApiPropertyOptional({ type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  tagIds?: string[];

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isFeatured?: boolean;

  @ApiPropertyOptional({ default: false })
  @IsBoolean()
  @IsOptional()
  isNotification?: boolean;

  @ApiPropertyOptional({ enum: ['DRAFT', 'PENDING', 'APPROVED', 'REJECTED', 'PUBLISHED', 'EDITING'], default: 'DRAFT' })
  @IsString()
  @IsOptional()
  status?: string;
  
  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  language?: string;
}

export class UpdatePostDto extends CreatePostDto {}

export class ReviewPostDto {
  @ApiProperty({ enum: ['APPROVED', 'REJECTED', 'EDITING', 'PUBLISHED'] })
  @IsString()
  status: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  moderationNote?: string;

  @ApiPropertyOptional()
  @IsString()
  @IsOptional()
  reviewerId?: string;
}
