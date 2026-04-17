import { Module, forwardRef } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { IPostRepository } from './domain/post.repository.interface';
import { PrismaPostRepository } from './repository/prisma-post.repository';
import { TranslationsModule } from '../translations/translations.module';

@Module({
  imports: [forwardRef(() => TranslationsModule)],
  controllers: [PostsController],
  providers: [
    PostsService,
    {
      provide: IPostRepository,
      useClass: PrismaPostRepository,
    },
  ],
  exports: [PostsService, IPostRepository],
})
export class PostsModule {}
