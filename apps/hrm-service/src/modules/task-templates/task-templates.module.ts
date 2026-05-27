import { Module } from '@nestjs/common';
import { TaskTemplatesController } from './task-templates.controller';
import { TaskTemplatesService } from './task-templates.service';

@Module({
  controllers: [TaskTemplatesController],
  providers: [TaskTemplatesService]
})
export class TaskTemplatesModule {}
