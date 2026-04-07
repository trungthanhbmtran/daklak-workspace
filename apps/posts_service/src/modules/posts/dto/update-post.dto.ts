import { PartialType } from '@nestjs/mapped-types';
import { CreatePostDto } from './create-post.dto';
import { IsOptional, IsString, IsUUID } from 'class-validator';

export class UpdatePostDto extends PartialType(CreatePostDto) {
  @IsUUID()
  @IsOptional()
  reviewerId?: string;

  @IsString()
  @IsOptional()
  moderationNote?: string;
}
