import { Global, Module } from '@nestjs/common';
import { GrpcAuthGuard } from '../../../../shared/security/grpc-auth';
import { PbacGuard } from '../../../../shared/security/grpc-auth';

@Global()
@Module({
  providers: [GrpcAuthGuard, PbacGuard],
  exports: [GrpcAuthGuard, PbacGuard],
})
export class CommonModule {}
