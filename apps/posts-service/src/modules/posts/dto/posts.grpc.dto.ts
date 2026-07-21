import { IsString, IsOptional, IsInt, IsBoolean } from 'class-validator';

export class CreatePostGrpcDto {
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() authorId?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() summary?: string;
  @IsString() @IsOptional() thumbnail?: string;
}

export class IdGrpcDto {
  @IsString() id: string;
}

export class SlugGrpcDto {
  @IsString() slug: string;
}

export class ActionPostGrpcDto {
  @IsString() id: string;
  @IsString() actorId: string;
  @IsString() @IsOptional() note?: string;
}

export class ReviewPostGrpcDto {
  @IsString() id: string;
  @IsString() reviewerId: string;
  @IsString() @IsOptional() note?: string;
}

export class ListPostsGrpcDto {
  @IsInt() @IsOptional() skip?: number;
  @IsInt() @IsOptional() take?: number;
  @IsString() @IsOptional() search?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() authorId?: string;
  @IsString() @IsOptional() category?: string;
  @IsString() @IsOptional() status?: string;
  @IsString() @IsOptional() isFeatured?: string;
  @IsString() @IsOptional() sortBy?: string;
  @IsString() @IsOptional() sortOrder?: string;
  @IsString() @IsOptional() isNotification?: string;
  @IsString() @IsOptional() hasThumbnail?: string;
  @IsString() @IsOptional() lang?: string;
  @IsString() @IsOptional() cursor?: string;
  @IsInt() @IsOptional() page?: number;
  @IsInt() @IsOptional() limit?: number;
}

export class UpdatePostGrpcDto {
  @IsString() id: string;
  @IsString() @IsOptional() title?: string;
  @IsString() @IsOptional() content?: string;
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() summary?: string;
  @IsString() @IsOptional() thumbnail?: string;
}

export class GetPostStatsGrpcDto {
  @IsString() @IsOptional() categoryId?: string;
  @IsString() @IsOptional() authorId?: string;
}
