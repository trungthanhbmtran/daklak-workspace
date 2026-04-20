import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { MediaGatewayController } from './media.controller';
import { MediaPublicController } from './media-public.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.MEDIA),
  ],
  controllers: [MediaGatewayController, MediaPublicController],
})
export class MediaModule {}
