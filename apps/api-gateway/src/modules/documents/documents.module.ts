import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DocumentCategoryController } from './document-category.controller';
import { DocumentsController } from './documents.controller';
import { MinutesController } from './minutes.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.DOCUMENT_CATEGORY),
    registerGrpcService(MICROSERVICES.DOCUMENT),
    registerGrpcService(MICROSERVICES.MINUTES),
  ],
  controllers: [DocumentCategoryController, DocumentsController, MinutesController],
})
export class DocumentsModule { }
