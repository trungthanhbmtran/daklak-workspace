import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { PostsController } from './posts.controller';
import { PublicPostsController } from './public-posts.controller';
import { PostsCategoryController } from './posts-category.controller';
import { PostsTagController } from './posts-tag.controller';
import { PostsBannerController } from './posts-banner.controller';
import { PortalMenuController } from './portal-menu.controller';
import { PublicPortalMenuController } from './public-portal-menu.controller';
import { InteractionsController } from './interactions.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.POST),
    registerGrpcService(MICROSERVICES.POSTS_CATEGORY),
    registerGrpcService(MICROSERVICES.POSTS_TAG),
    registerGrpcService(MICROSERVICES.BANNER),
    registerGrpcService(MICROSERVICES.PORTAL_MENU),
    registerGrpcService(MICROSERVICES.INTERACTION),
  ],
  controllers: [
    PostsCategoryController,
    PostsTagController,
    PostsBannerController,
    PostsController,
    PublicPostsController,
    PortalMenuController,
    PublicPortalMenuController,
    InteractionsController,
  ],
})
export class PostsModule { }
