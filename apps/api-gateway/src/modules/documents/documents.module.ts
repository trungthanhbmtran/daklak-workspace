import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DocumentCategoryController } from './document-category.controller';
import { DocumentsController } from './documents.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.DOCUMENT_CATEGORY),
    registerGrpcService(MICROSERVICES.DOCUMENT),
  ],
  controllers: [DocumentCategoryController, DocumentsController],
})
export class DocumentsModule { }
