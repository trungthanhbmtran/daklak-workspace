import { Module } from '@nestjs/common';
import { TasksController } from './tasks.controller';
import { TasksService } from './tasks.service';
import { TasksCronService } from './tasks.cron';
import { TaskSharedModule } from '../task-shared/task-shared.module';
import { TaskWorkflowService } from '../task-workflow/task-workflow.service';
import { TaskNotificationService } from '../task-workflow/task-notification.service';

@Module({
  imports: [
    TaskSharedModule, // @Global — cung cấp NOTIFICATION_SERVICE, USER_PACKAGE, WORKFLOW_PACKAGE, TaskSharedService
  ],
  controllers: [TasksController],
  providers: [TasksService, TasksCronService, TaskWorkflowService, TaskNotificationService],
  exports: [TasksService],
})
export class TasksModule {}
