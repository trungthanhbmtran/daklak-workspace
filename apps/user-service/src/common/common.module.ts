import { Global, Module } from '@nestjs/common';
import { GrpcAuthGuard } from '@/common/guards/grpc-auth.guard';
import { PbacGuard } from '@/common/guards/pbac.guard';
import { RolesGuard } from '@/common/guards/roles.guard';

@Global()
@Module({
  providers: [GrpcAuthGuard, PbacGuard, RolesGuard],
  exports: [GrpcAuthGuard, PbacGuard, RolesGuard],
})
export class CommonModule {}
