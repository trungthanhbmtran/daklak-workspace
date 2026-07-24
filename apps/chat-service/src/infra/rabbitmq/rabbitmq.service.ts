import { Injectable, Logger } from '@nestjs/common';
import { ClientProxy, ClientProxyFactory, Transport } from '@nestjs/microservices';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class RabbitmqService {
  private client: ClientProxy;
  private readonly logger = new Logger(RabbitmqService.name);

  constructor(private configService: ConfigService) {
    const rmqUrl = this.configService.get<string>('RABBITMQ_URL') || 'amqp://localhost:5672';
    
    this.client = ClientProxyFactory.create({
      transport: Transport.RMQ,
      options: {
        urls: [rmqUrl],
        queue: 'chat_events_queue',
        queueOptions: {
          durable: true
        },
      },
    });
  }

  async publishEvent(pattern: string, data: any) {
    try {
      this.client.emit(pattern, data);
      this.logger.debug(`Published event ${pattern}`);
    } catch (error) {
      this.logger.error(`Error publishing event ${pattern}`, error);
    }
  }
}
