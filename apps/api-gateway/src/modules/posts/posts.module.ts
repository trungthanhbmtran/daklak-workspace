import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { PostsController } from './posts.controller';
import { PostsCategoryController } from './posts-category.controller';
import { PostsTagController } from './posts-tag.controller';
import { PostsBannerController } from './posts-banner.controller';
import { PortalMenuController } from './portal-menu.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.POST),
    registerGrpcService(MICROSERVICES.POSTS_CATEGORY),
    registerGrpcService(MICROSERVICES.POSTS_TAG),
    registerGrpcService(MICROSERVICES.BANNER),
    registerGrpcService(MICROSERVICES.PORTAL_MENU),
  ],
  controllers: [
    PostsCategoryController,
    PostsTagController,
    PostsBannerController,
    PortalMenuController,
    PostsController,
  ],
})
export class PostsModule { }
