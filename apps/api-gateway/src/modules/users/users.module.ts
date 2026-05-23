import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserController } from './user.controller';
import { PbacController } from './pbac.controller';
import { ResourcesController } from './resources.controller';
import { CategoriesController, PublicCategoriesController } from './categories.controller';
import { MenusController } from './menus.controller';
import { OrganizationsController, PublicOrganizationsController } from './organizations.controller';
import { ConfigsController } from './configs.controller';

@Module({
  imports: [
    NotificationsModule,
    registerGrpcService(MICROSERVICES.USER),
    registerGrpcService(MICROSERVICES.PBAC),
    registerGrpcService(MICROSERVICES.SYS_CATEGORY),
    registerGrpcService(MICROSERVICES.MENU),
    registerGrpcService(MICROSERVICES.ORGANIZATION),
  ],
  controllers: [
    UserController,
    PbacController,
    ResourcesController,
    CategoriesController,
    PublicCategoriesController,
    MenusController,
    OrganizationsController,
    PublicOrganizationsController,
    ConfigsController,
  ],
})
export class UsersModule {}
