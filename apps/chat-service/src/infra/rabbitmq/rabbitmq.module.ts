import { Module, Global } from '@nestjs/common';
import { RabbitmqService } from './rabbitmq.service';

@Global()
@Module({
  providers: [RabbitmqService],
  exports: [RabbitmqService],
})
export class RabbitmqModule {}
