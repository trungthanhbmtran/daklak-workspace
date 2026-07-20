import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { PrismaModule } from './infra/prisma.module';
import { DefinitionModule } from './definition/definition.module';
import { ExecutionModule } from './execution/execution.module';
import { SdkModule } from './sdk/sdk.module';
import { ActionModule } from './action/action.module';
import { IntegrationModule } from './integration/integration.module';
import { GrpcModule } from './grpc/grpc.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    EventEmitterModule.forRoot(),
    PrismaModule,
    DefinitionModule,
    ExecutionModule,
    SdkModule,
    ActionModule,
    IntegrationModule,
    GrpcModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule { }
