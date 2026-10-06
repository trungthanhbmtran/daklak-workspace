import { Controller, Logger } from '@nestjs/common';
import {
  EventPattern,
  Payload,
  Ctx,
  RmqContext,
  GrpcMethod,
} from '@nestjs/microservices';
import { StatisticsService } from './statistics.service';
import { Metadata } from '@grpc/grpc-js';

@Controller()
export class StatisticsController {
  private readonly logger = new Logger(StatisticsController.name);

  constructor(private readonly statisticsService: StatisticsService) {}

  // =========================================================================
  // CQRS EVENT CONSUMERS (RABBITMQ)
  // =========================================================================

  @EventPattern('task.completed')
  async handleTaskCompleted(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.statisticsService.recordTaskCompleted(data);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('Failed to handle task.completed event:', err);
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('task.created')
  async handleTaskCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.statisticsService.handleTaskCreated(data);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('Failed to handle task.created event:', err);
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('task.state_changed')
  async handleTaskStateChanged(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.statisticsService.handleTaskStateChanged(data);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('Failed to handle task.state_changed event:', err);
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('post.published')
  async handlePostPublished(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.statisticsService.handlePostPublished(data);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('Failed to handle post.published event:', err);
      channel.nack(originalMsg, false, false);
    }
  }

  @EventPattern('document.created')
  async handleDocumentCreated(@Payload() data: any, @Ctx() context: RmqContext) {
    const channel = context.getChannelRef();
    const originalMsg = context.getMessage();
    try {
      await this.statisticsService.handleDocumentCreated(data);
      channel.ack(originalMsg);
    } catch (err) {
      this.logger.error('Failed to handle document.created event:', err);
      channel.nack(originalMsg, false, false);
    }
  }

  // =========================================================================
  // gRPC QUERY ENDPOINTS
  // =========================================================================

  @GrpcMethod('ReportService', 'GetTaskStats')
  async getTaskStatistics(
    data: { payload: string; userData: string },
    metadata: Metadata,
  ) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const user = data.userData ? JSON.parse(data.userData) : null;
    const res: any = await this.statisticsService.getTaskStatistics(
      filter,
      user,
      metadata,
    );
    return {
      success: res.success,
      message: res.message,
      data: JSON.stringify(res.data),
    };
  }

  @GrpcMethod('ReportService', 'GetPostStats')
  async getPostStatistics(
    data: { payload: string; userData: string },
    metadata: Metadata,
  ) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const res: any = await this.statisticsService.getPostStatistics(
      filter,
      metadata,
    );
    return {
      success: res.success,
      message: res.message,
      data: JSON.stringify(res.data),
    };
  }

  @GrpcMethod('ReportService', 'GetKpiStats')
  async getKpiStatistics(
    data: { payload: string; userData: string },
    metadata: Metadata,
  ) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const user = data.userData ? JSON.parse(data.userData) : null;
    const res: any = await this.statisticsService.getKpiStatistics(
      filter,
      user,
      metadata,
    );
    return {
      success: res.success,
      message: res.message,
      data: JSON.stringify(res.data),
    };
  }

  @GrpcMethod('ReportService', 'GetDocumentStats')
  async getDocumentStatistics(
    data: { payload: string; userData: string },
    metadata: Metadata,
  ) {
    const filter = data.payload ? JSON.parse(data.payload) : {};
    const res: any = await this.statisticsService.getDocumentStatistics(
      filter,
      metadata,
    );
    return {
      success: res.success,
      message: res.message,
      data: JSON.stringify(res.data),
    };
  }
}
