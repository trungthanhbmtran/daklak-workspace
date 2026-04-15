import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repositories/posts.repository';
import { CensorService } from './censor.service';
import { TranslationsModule } from '../translations/translations.module';
import { forwardRef } from '@nestjs/common';

@Module({
  imports: [forwardRef(() => TranslationsModule)],
  controllers: [PostsController],
  providers: [PostsService, PostsRepository, CensorService],
  exports: [PostsService, PostsRepository, CensorService],
})
export class PostsModule { }
