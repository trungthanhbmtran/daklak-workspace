import { Module } from '@nestjs/common';
import { ApiManagementController } from './api-management.controller';
import { ApiManagementService } from './api-management.service';
import { PartnerService } from './partner.service';
import { PartnerController } from './partner.controller';
import { OutboxWorkerService } from './outbox-worker.service';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INTEGRATION_EVENTS',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://localhost:5672'],
          queue: 'integration_events_queue',
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [ApiManagementController, PartnerController],
  providers: [ApiManagementService, OutboxWorkerService, PartnerService],
  exports: [ApiManagementService],
})
export class ApiManagementModule {}
