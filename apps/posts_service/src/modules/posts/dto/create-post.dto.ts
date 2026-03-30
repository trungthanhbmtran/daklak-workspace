import { IsString, IsOptional, IsBoolean, IsEnum, IsArray, IsUUID } from 'class-validator';
import { PostStatus } from '@prisma/client';

export class CreatePostDto {
    @IsString()
    title: string;

    @IsString()
    @IsOptional()
    content?: string;

    @IsOptional()
    contentJson?: any;

    @IsString()
    @IsOptional()
    description?: string;

    @IsString()
    slug: string;

    @IsUUID()
    authorId: string;

    @IsUUID()
    @IsOptional()
    categoryId?: string;

    @IsString()
    @IsOptional()
    language?: string;

    @IsEnum(PostStatus)
    @IsOptional()
    status?: PostStatus;

    @IsString()
    @IsOptional()
    thumbnail?: string;

    @IsBoolean()
    @IsOptional()
    isFeatured?: boolean;

    @IsBoolean()
    @IsOptional()
    isNotification?: boolean;

    @IsArray()
    @IsString({ each: true })
    @IsOptional()
    tagIds?: string[];
}
