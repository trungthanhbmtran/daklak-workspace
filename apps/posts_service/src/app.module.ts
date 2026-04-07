import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './database/prisma.module';
import { PostsModule } from './modules/posts/posts.module';
import { CategoriesModule } from './modules/categories/categories.module';
import { TagsModule } from './modules/tags/tags.module';
import { BannersModule } from './modules/banners/banners.module';
import { TranslationsModule } from './modules/translations/translations.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    PostsModule,
    CategoriesModule,
    TagsModule,
    BannersModule,
    TranslationsModule,
  ],
})
export class AppModule {}
