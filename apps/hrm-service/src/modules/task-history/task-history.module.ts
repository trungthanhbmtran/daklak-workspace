import { Module } from '@nestjs/common';
import { TaskHistoryController } from './task-history.controller';
import { TaskHistoryService } from './task-history.service';

@Module({
  controllers: [TaskHistoryController],
  providers: [TaskHistoryService],
  exports: [TaskHistoryService]
})
export class TaskHistoryModule {}
