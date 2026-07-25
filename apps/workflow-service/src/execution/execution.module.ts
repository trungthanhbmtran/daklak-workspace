import { Module } from '@nestjs/common';
import { ExecutionService } from './execution.service';
import { ExecutionController } from './execution.controller';
import { ActionModule } from '../action/action.module';
import { RedisModule } from '../infra/redis.module';
import { RabbitMQModule } from '../infra/rabbitmq.module';

@Module({
  imports: [ActionModule, RedisModule, RabbitMQModule],
  controllers: [ExecutionController],
  providers: [ExecutionService],
  exports: [ExecutionService],
})
export class ExecutionModule {}
