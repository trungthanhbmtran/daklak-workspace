import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { PostController } from './post.controller';
import { PostsCategoryController } from './posts-category.controller';
import { BannerController } from './banner.controller';
import { TagController } from './tag.controller';
import { TranslationController } from './translation.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.POST),
    registerGrpcService(MICROSERVICES.POSTS_CATEGORY),
    registerGrpcService(MICROSERVICES.BANNER),
    registerGrpcService(MICROSERVICES.POSTS_TAG),
    registerGrpcService(MICROSERVICES.TRANSLATE),
  ],
  controllers: [PostController, PostsCategoryController, BannerController, TagController, TranslationController],
})
export class PostsModule { }
