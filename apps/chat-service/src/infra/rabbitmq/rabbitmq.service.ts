import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitmqService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(RabbitmqService.name);
  private connection: amqp.Connection;
  private channel: amqp.Channel;

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.channel?.close();
    await this.connection?.close();
  }

  private async connect() {
    try {
      const url = process.env.RABBITMQ_URL || 'amqp://admin:admin123@localhost:5672';
      this.connection = await amqp.connect(url);
      this.channel = await this.connection.createChannel();
      
      // Khai báo Exchange (sử dụng topic exchange cho chat events)
      await this.channel.assertExchange('chat.events', 'topic', { durable: true });
      this.logger.log('Connected to RabbitMQ successfully');
    } catch (e) {
      this.logger.error('Failed to connect to RabbitMQ', e);
      // Reconnect logic có thể thêm ở đây nếu cần
    }
  }

  async publishEvent(routingKey: string, payload: any) {
    if (!this.channel) {
      this.logger.warn('RabbitMQ channel is not available. Event not published.');
      return false;
    }

    try {
      const message = Buffer.from(JSON.stringify(payload));
      this.channel.publish('chat.events', routingKey, message, {
        persistent: true,
        timestamp: Date.now()
      });
      return true;
    } catch (e) {
      this.logger.error(`Failed to publish event to ${routingKey}`, e);
      return false;
    }
  }
}
