import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { PostsController } from './posts.controller';
import { PublicPostsController } from './public-posts.controller';
import { PostsCategoryController } from './posts-category.controller';
import { PostsTagController } from './posts-tag.controller';
import { PostsBannerController } from './posts-banner.controller';
import { PublicBannersController } from './public-banners.controller';
import { PortalMenuController } from './portal-menu.controller';
import { PublicPortalMenuController } from './public-portal-menu.controller';
import { InteractionsController } from './interactions.controller';
import { PublicInteractionsController } from './public-interactions.controller';
import { PortalConfigController } from './portal-config.controller';
import { PublicPortalConfigController } from './public-portal-config.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.POST),
    registerGrpcService(MICROSERVICES.POSTS_CATEGORY),
    registerGrpcService(MICROSERVICES.POSTS_TAG),
    registerGrpcService(MICROSERVICES.BANNER),
    registerGrpcService(MICROSERVICES.PORTAL_MENU),
    registerGrpcService(MICROSERVICES.INTERACTION),
    registerGrpcService(MICROSERVICES.PORTAL_CONFIG),
  ],
  controllers: [
    PostsCategoryController,
    PostsTagController,
    PostsBannerController,
    PublicBannersController,
    PostsController,
    PublicPostsController,
    PortalMenuController,
    PublicPortalMenuController,
    InteractionsController,
    PublicInteractionsController,
    PortalConfigController,
    PublicPortalConfigController,
  ],
})
export class PostsModule { }
