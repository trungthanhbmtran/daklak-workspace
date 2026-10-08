import { Global, Module } from '@nestjs/common';
import { GatewayContextService } from './gateway-context.service';
import { GrpcAuthGuard } from './grpc-auth.guard';
import { PbacGuard } from './pbac.guard';

@Global()
@Module({
  providers: [GatewayContextService, GrpcAuthGuard, PbacGuard],
  exports: [GatewayContextService, GrpcAuthGuard, PbacGuard],
})
export class GrpcAuthModule {}
