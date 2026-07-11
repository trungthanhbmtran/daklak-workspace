import { Module } from '@nestjs/common';
import { TaskWorkflowsController } from './task-workflows.controller';
import { TaskWorkflowsService } from './task-workflows.service';
import { TasksModule } from '../tasks/tasks.module';

@Module({
  imports: [
    TasksModule, // export TasksService; TaskSharedModule @Global cung cấp WORKFLOW_PACKAGE
  ],
  controllers: [TaskWorkflowsController],
  providers: [TaskWorkflowsService],
})
export class TaskWorkflowsModule {}
