import { Module } from '@nestjs/common';
import { ConfigModule } from '@/config/config.module';
import { PrismaModule } from '@/database/prisma.module';
import { UsersModule } from '@/modules/users/users.module';
import { PbacModule } from '@/modules/pbac/pbac.module';
import { CategoriesModule } from '@/modules/categories/categories.module';
import { MenusModule } from '@/modules/menus/menus.module';
import { OrganizationsModule } from '@/modules/organizations/organizations.module';
import { ConfigsModule } from './configs/configs.module';
import { UserConfigsModule } from './modules/user-configs/user-configs.module';
import { AiAssistantModule } from './modules/ai-assistant/ai-assistant.module';

@Module({
  imports: [
    ConfigModule,
    PrismaModule,
    UsersModule,
    PbacModule,
    CategoriesModule,
    MenusModule,
    OrganizationsModule,
    ConfigsModule,
    UserConfigsModule,
    AiAssistantModule,
  ],
})
export class AppModule { }
