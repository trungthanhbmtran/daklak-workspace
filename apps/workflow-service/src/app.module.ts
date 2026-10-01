import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './infra/prisma.module';
import { RedisModule } from './infra/redis.module';
import { RabbitMQModule } from './infra/rabbitmq.module';
import { DefinitionModule } from './definition/definition.module';
import { ExecutionModule } from './execution/execution.module';
import { SdkModule } from './sdk/sdk.module';
import { ActionModule } from './action/action.module';
import { GrpcModule } from './grpc/grpc.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    PrismaModule,
    RedisModule,
    RabbitMQModule,
    DefinitionModule,
    ExecutionModule,
    SdkModule,
    ActionModule,
    GrpcModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
