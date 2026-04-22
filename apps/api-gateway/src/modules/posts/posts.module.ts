import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { PostsController } from './posts.controller';
import { PostsCategoryController } from './posts-category.controller';
import { PostsTagController } from './posts-tag.controller';
import { PostsBannerController } from './posts-banner.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.POST),
    registerGrpcService(MICROSERVICES.POSTS_CATEGORY),
    registerGrpcService(MICROSERVICES.POSTS_TAG),
    registerGrpcService(MICROSERVICES.BANNER),
  ],
  controllers: [
    PostsCategoryController,
    PostsTagController,
    PostsBannerController,
    PostsController,
  ],
})
export class PostsModule {}
