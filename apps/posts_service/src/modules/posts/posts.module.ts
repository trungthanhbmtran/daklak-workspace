import { Module } from '@nestjs/common';
import { PostsService } from './posts.service';
import { PostsController } from './posts.controller';
import { PostsRepository } from './repositories/posts.repository';

@Module({
    controllers: [PostsController],
    providers: [PostsService, PostsRepository],
    exports: [PostsService],
})
export class PostsModule { }
