import { Global, Module } from '@nestjs/common';
import { GrpcAuthGuard } from '@/common/guards/grpc-auth.guard';
import { PbacGuard } from '@/common/guards/pbac.guard';

@Global()
@Module({
  providers: [GrpcAuthGuard, PbacGuard],
  exports: [GrpcAuthGuard, PbacGuard],
})
export class CommonModule {}
