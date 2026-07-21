import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.AUTH),
    registerGrpcService(MICROSERVICES.USER),
    registerGrpcService(MICROSERVICES.EMPLOYEE),
  ],
  controllers: [AuthController],
  providers: [AuthService],
})
export class AuthModule {}
