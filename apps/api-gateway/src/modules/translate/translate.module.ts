import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { TranslateController } from './translate.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.TRANSLATE),
  ],
  controllers: [TranslateController],
})
export class TranslateModule {}
