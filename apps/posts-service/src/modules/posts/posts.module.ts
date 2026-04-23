import { Module } from '@nestjs/common';
import { PostsController } from './posts.controller';
import { PostsService } from './posts.service';
import { WorkflowModule } from '../workflow/workflow.module';


@Module({
  imports: [WorkflowModule],
  controllers: [PostsController],
  providers: [PostsService],
})

export class PostsModule {}
