import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { IntegrationConfigController } from './integration-config.controller';
import { IntegrationConfigInternalController } from './integration-config.internal.controller';
import { IntegrationConfigService } from './integration-config.service';
import { IntegrationAuthService } from './integration-auth.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'INTEGRATION_EVENTS',
        transport: Transport.RMQ,
        options: {
          urls: [process.env.RABBITMQ_URL || 'amqp://rabbitmq:5672'],
          queue: 'integration_events_queue', // Basic queue for now, we can use exchange for fanout later
          queueOptions: { durable: true },
        },
      },
    ]),
  ],
  controllers: [IntegrationConfigController, IntegrationConfigInternalController],
  providers: [IntegrationConfigService, IntegrationAuthService],
  exports: [IntegrationConfigService, IntegrationAuthService],
})
export class IntegrationConfigModule {}
