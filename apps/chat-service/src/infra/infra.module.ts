import { Module, Global } from '@nestjs/common';
import { PrismaService } from './prisma/prisma.service';
import { RabbitmqModule } from './rabbitmq/rabbitmq.module';
import { RedisModule } from './redis/redis.module';

@Global()
@Module({
  imports: [RabbitmqModule, RedisModule],
  providers: [PrismaService],
  exports: [PrismaService, RabbitmqModule, RedisModule],
})
export class InfraModule {}
