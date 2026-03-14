import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { StorageAdminController, StoragePublicController } from './storage.controller';

@Module({
  imports: [registerGrpcService(MICROSERVICES.STORAGE)],
  controllers: [StorageAdminController, StoragePublicController],
})
export class StorageModule {}
