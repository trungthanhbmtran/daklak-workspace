import { Controller } from '@nestjs/common';
import { EventPattern, Payload, Ctx, RmqContext, GrpcMethod } from '@nestjs/microservices';
import { StatisticsService } from './statistics.service';
import { Metadata } from '@grpc/grpc-js';

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

  @GrpcMethod('ReportService', 'GetTaskStats')
  async getTaskStatistics(data: { payload: string; userData: string }, metadata: Metadata) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const user = data.userData ? JSON.parse(data.userData) : null;
    const res: any = await this.statisticsService.getTaskStatistics(filter, user, metadata);
    console.log('DEBUG getTaskStatistics res:', JSON.stringify(res, null, 2));
    return { success: res.success, message: res.message, data: JSON.stringify(res.data) };
  }

  @GrpcMethod('ReportService', 'GetPostStats')
  async getPostStatistics(data: { payload: string; userData: string }, metadata: Metadata) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const res: any = await this.statisticsService.getPostStatistics(filter, metadata);
    return { success: res.success, message: res.message, data: JSON.stringify(res.data) };
  }

  @GrpcMethod('ReportService', 'GetKpiStats')
  async getKpiStatistics(data: { payload: string; userData: string }, metadata: Metadata) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const user = data.userData ? JSON.parse(data.userData) : null;
    const res: any = await this.statisticsService.getKpiStatistics(filter, user, metadata);
    return { success: res.success, message: res.message, data: JSON.stringify(res.data) };
  }

  @GrpcMethod('ReportService', 'GetDocumentStats')
  async getDocumentStatistics(data: { payload: string; userData: string }, metadata: Metadata) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const res: any = await this.statisticsService.getDocumentStatistics(filter, metadata);
    return { success: res.success, message: res.message, data: JSON.stringify(res.data) };
  }
}
