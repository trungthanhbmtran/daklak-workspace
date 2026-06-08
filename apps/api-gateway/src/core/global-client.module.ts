import { Global, Module } from '@nestjs/common';
import { registerGrpcService } from './factories/grpc.factory';
import { MICROSERVICES } from './constants/services';

const userGrpcClient = registerGrpcService(MICROSERVICES.USER);

@Global()
@Module({
  imports: [userGrpcClient],
  exports: [userGrpcClient],
})
export class GlobalClientModule {}
