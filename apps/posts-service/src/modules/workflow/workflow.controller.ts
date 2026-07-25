import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Controller()
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern('workflow.task.created')
  async handleWorkflowTaskCreated(@Payload() data: any) {
    this.logger.log(`Posts Service received workflow.task.created event: ${JSON.stringify(data)}`);
    // Example: send notification to author or reviewer
  }

  @EventPattern('workflow.instance.completed')
  async handleWorkflowCompleted(@Payload() data: any) {
    this.logger.log(`Posts Service received workflow.instance.completed event: ${JSON.stringify(data)}`);
  }
}
