import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { ActionModule } from '../action/action.module';
import { RedisModule } from '../infra/redis.module';
import { RabbitMQModule } from '../infra/rabbitmq.module';
import { CatalogModule } from '../catalog/catalog.module';
import { OutboxPublisher } from './outbox-publisher.service';

@Module({
  imports: [ActionModule, RedisModule, RabbitMQModule, CatalogModule],
  controllers: [ExecutionController],
  providers: [ExecutionService, OutboxPublisher],
  exports: [ExecutionService, OutboxPublisher],
})
export class ExecutionModule {}
