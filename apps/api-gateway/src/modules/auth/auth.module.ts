import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { AuthController } from './auth.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.AUTH),
    registerGrpcService(MICROSERVICES.USER),
  ],
  controllers: [AuthController],
})
export class AuthModule {}