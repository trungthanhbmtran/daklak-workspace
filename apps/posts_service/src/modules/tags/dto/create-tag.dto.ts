import { IsString, IsOptional, IsEnum } from 'class-validator';
import { TagStatus } from '@prisma/client';

export class CreateTagDto {
    @IsString()
    name: string;

    @IsString()
    slug: string;

    @IsString()
    @IsOptional()
    description?: string;

    @IsEnum(TagStatus)
    @IsOptional()
    status?: TagStatus;
}
