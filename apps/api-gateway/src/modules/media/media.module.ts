import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { MediaGatewayController } from './media.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.MEDIA),
  ],
  controllers: [MediaGatewayController],
})
export class MediaModule { }
