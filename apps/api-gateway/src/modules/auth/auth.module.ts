import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { SsoService } from './sso/sso.service';
import { SsoController } from './sso/sso.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthOriginGuard } from './auth-origin.guard';
import { RateLimiterModule } from '../../core/rate-limiter/rate-limiter.module';
import { RateLimitGuard } from '../../core/guards/rate-limit.guard';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.USER),
    registerGrpcService(MICROSERVICES.EMPLOYEE),
    RateLimiterModule,
  ],
  controllers: [AuthController, SsoController],
  providers: [SsoService, AuthService, RateLimitGuard, AuthOriginGuard],
})
export class AuthModule {}
