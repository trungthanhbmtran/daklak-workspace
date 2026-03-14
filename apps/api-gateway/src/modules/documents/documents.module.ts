import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DocumentCategoryController } from './document-category.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.DOCUMENT_CATEGORY),
  ],
  controllers: [DocumentCategoryController],
})
export class DocumentsModule {}
