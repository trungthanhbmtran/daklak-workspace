import { IsString, IsOptional, IsBoolean, IsEnum, IsInt, IsUUID } from 'class-validator';
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

    @IsUUID()
    @IsOptional()
    parentId?: string;

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
}
