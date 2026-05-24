import { Module } from '@nestjs/common';
import { AiService } from './ai.service';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { AiController } from './ai.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.SYS_CONFIG)
  ],
  controllers: [AiController],
  providers: [AiService],
  exports: [AiService],
})
export class AiModule { }
