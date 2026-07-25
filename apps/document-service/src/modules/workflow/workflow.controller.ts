import { Controller, Logger } from '@nestjs/common';
import { EventPattern, Payload } from '@nestjs/microservices';
import { PrismaService } from '../../database/prisma.service';

@Controller()
export class WorkflowController {
  private readonly logger = new Logger(WorkflowController.name);

  constructor(private readonly prisma: PrismaService) {}

  @EventPattern('workflow.task.created')
  async handleWorkflowTaskCreated(@Payload() data: any) {
    this.logger.log(`Document Service received workflow.task.created event: ${JSON.stringify(data)}`);
    // Example: update document status if it requires human attention
  }

  @EventPattern('workflow.instance.completed')
  async handleWorkflowCompleted(@Payload() data: any) {
    this.logger.log(`Document Service received workflow.instance.completed event: ${JSON.stringify(data)}`);
    // You could update document status to APPROVED/COMPLETED based on the context
  }
}
