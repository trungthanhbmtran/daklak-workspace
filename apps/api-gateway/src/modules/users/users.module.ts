import { HttpModule } from '@nestjs/axios';
import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { NotificationsModule } from '../notifications/notifications.module';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { PbacController } from './pbac.controller';
import { ResourcesController } from './resources.controller';
import {
  CategoriesController,
  PublicCategoriesController,
} from './categories.controller';
import { CategoriesService } from './categories.service';
import { MenusController } from './menus.controller';
import { MenusService } from './menus.service';
import {
  OrganizationsController,
  PublicOrganizationsController,
} from './organizations.controller';
import { OrganizationsService } from './organizations.service';
import { ConfigsController } from './configs.controller';
import { UserConfigsController } from './user-configs.controller';
import { AiAssistantGatewayController } from './ai-assistant.controller';
import { IntegrationsController } from './integrations.controller';
import { AiModule } from '../ai/ai.module';

@Module({
  imports: [
    HttpModule,
    NotificationsModule,
    registerGrpcService(MICROSERVICES.USER),
    registerGrpcService(MICROSERVICES.PBAC),
    registerGrpcService(MICROSERVICES.SYS_CATEGORY),
    registerGrpcService(MICROSERVICES.MENU),
    registerGrpcService(MICROSERVICES.ORGANIZATION),
    registerGrpcService(MICROSERVICES.SYS_CONFIG),
    registerGrpcService(MICROSERVICES.USER_CONFIG),
    registerGrpcService(MICROSERVICES.AI_ASSISTANT),
    registerGrpcService(MICROSERVICES.EMPLOYEE),
    registerGrpcService(MICROSERVICES.REPORT),
    AiModule,
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
    UserConfigsController,
    AiAssistantGatewayController,
    IntegrationsController,
  ],
  providers: [
    OrganizationsService,
    MenusService,
    UserService,
    CategoriesService,
  ],
})
export class UsersModule {}
