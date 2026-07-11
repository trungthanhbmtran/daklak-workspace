import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksCronService } from './tasks.cron';
import { TaskSharedModule } from '../task-shared/task-shared.module';

@Module({
  imports: [
    TaskSharedModule, // @Global — cung cấp NOTIFICATION_SERVICE, USER_PACKAGE, WORKFLOW_PACKAGE, TaskSharedService
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksCronService],
  exports: [TasksService],
})
export class TasksModule {}
