import { Controller, Get, Query, Req } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext } from '@nestjs/microservices';
import { StatisticsService } from './statistics.service';

@Controller()
export class StatisticsController {
  constructor(private readonly statisticsService: StatisticsService) { }

  @EventPattern('task.completed')
  async handleTaskCompleted(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();

    try {
      await this.statisticsService.recordTaskCompleted(data);
      channel.ack(originalMsg);
    } catch (err) {
      channel.nack(originalMsg);
    }
  }

  @Get('tasks')
  async getTaskStatistics(@Query() filter: any, @Req() req: any) {
    return this.statisticsService.getTaskStatistics(filter, req);
  }

  @Get('posts')
  async getPostStatistics(@Query() filter: any, @Req() req: any) {
    return this.statisticsService.getPostStatistics(filter, req);
  }

  @Get('kpis')
  async getKpiStatistics(@Query() filter: any, @Req() req: any) {
    return this.statisticsService.getKpiStatistics(filter, req);
  }

  @Get('documents')
  async getDocumentStatistics(@Query() filter: any, @Req() req: any) {
    return this.statisticsService.getDocumentStatistics(filter, req);
  }
}
