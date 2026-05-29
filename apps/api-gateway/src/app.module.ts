import { Module, NestModule, MiddlewareConsumer } from '@nestjs/common';
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
import { TranslateModule } from './modules/translate/translate.module';
import { AiModule } from './modules/ai/ai.module';
import { RedisModule } from './core/redis/redis.module';

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
    DocumentsModule,
    PostsModule,
    MediaModule,
    WorkflowModule,
    TranslateModule,
    AiModule,
    RedisModule
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer
      .apply((req: any, res: any, next: () => void) => {
        // 1. Extract lang from query, cookies, x-lang header, or Accept-Language header
        let lang = req.query?.lang || req.cookies?.lang || req.headers['x-lang'] || req.headers['accept-language'] || 'vi';

        if (typeof lang === 'string') {
          lang = lang.trim().toLowerCase();
          if (lang.includes(',')) {
            lang = lang.split(',')[0];
          }
          if (lang.includes(';')) {
            lang = lang.split(';')[0];
          }
          if (lang.includes('-')) {
            lang = lang.split('-')[0];
          }
        }

        // Only allow supported system languages 'vi' and 'en'. Fallback to 'vi'.
        if (lang !== 'vi' && lang !== 'en') {
          lang = 'vi';
        }

        // 2. Inject back into request query parameters so NestJS @Query bindings pick it up
        if (req.query) {
          req.query.lang = lang;
        } else {
          req.query = { lang };
        }

        // Also inject into request body for @Body bindings
        if (req.body && typeof req.body === 'object') {
          req.body.lang = lang;
        }

        next();
      })
      .forRoutes('*');
  }
}