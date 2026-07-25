import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { TaskWorkflowService } from './task-workflow.service';

@Controller()
export class TaskWorkflowController {
  private readonly logger = new Logger(TaskWorkflowController.name);

  constructor(private readonly workflowService: TaskWorkflowService) {}

  @EventPattern('workflow.task.created')
  async handleWorkflowTaskCreated(@Payload() data: any) {
    this.logger.log(`Received workflow.task.created event: ${JSON.stringify(data)}`);
    // Here we can call the service to create a local HRM task, assign it to employee, etc.
  }

  @EventPattern('workflow.instance.completed')
  async handleWorkflowCompleted(@Payload() data: any) {
    this.logger.log(`Received workflow.instance.completed event: ${JSON.stringify(data)}`);
  }
}
