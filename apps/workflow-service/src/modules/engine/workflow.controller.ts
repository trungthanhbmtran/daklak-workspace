import {
  Controller,
  Post,
  Body,
  Param,
  Get,
  NotFoundException,
  Inject,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@/database/prisma.service';

@Controller('workflows')
export class WorkflowController {
  constructor(
    private readonly prisma: PrismaService,
    @Inject('REDIS_SERVICE') private readonly redisClient: ClientProxy,
  ) {}

  /**
   * Register a new workflow definition
   */
  @Post()
  async createWorkflow(
    @Body() body: { code: string; name: string; description?: string },
  ) {
    const workflow = await this.prisma.workflowDefinition.create({
      data: {
        code: body.code,
        name: body.name,
        description: body.description,
      },
    });

    this.redisClient.emit('WORKFLOW_UPDATED', {
      workflowId: workflow.id,
      code: workflow.code,
    });

    return workflow;
  }

}
