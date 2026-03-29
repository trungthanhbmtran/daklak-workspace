import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { AuthModule } from './modules/auth/auth.module';
import { HrmModule } from './modules/hrm/hrm.module';
import { UsersModule } from './modules/users/users.module';
import { DocumentsModule } from './modules/documents/documents.module';
import { PostsModule } from './modules/posts/posts.module';
import { NotificationsModule } from './modules/notifications/notifications.module';
import { AppController } from './modules/app/app.controller';
import { MediaModule } from './modules/media/media.module';
import { WorkflowModule } from './modules/workflow/workflow.module';
@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),

    AuthModule,
    HrmModule,
    UsersModule,
    NotificationsModule,
    // DocumentsModule, // Temporarily disabled: missing protos
    PostsModule,
    MediaModule,
    WorkflowModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule { }