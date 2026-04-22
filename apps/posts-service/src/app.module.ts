import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { BannersModule } from './modules/banners/banners.module';
import { AuditModule } from './modules/audit/audit.module';
import { WorkflowModule } from './modules/workflow/workflow.module';


@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    PrismaModule,
    AuditModule,
    WorkflowModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    BannersModule,

  ],
})
export class AppModule {}
