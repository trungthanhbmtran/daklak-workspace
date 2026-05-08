import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DocumentCategoryController } from './document-category.controller';
import { DocumentsController } from './documents.controller';
import { MinutesController } from './minutes.controller';
import { ConsultationsController } from './consultations.controller';
import { PublicConsultationsController } from './public-consultations.controller';
import { PublicDocumentsController } from './public-documents.controller';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.DOCUMENT_CATEGORY),
    registerGrpcService(MICROSERVICES.DOCUMENT),
    registerGrpcService(MICROSERVICES.MINUTES),
    registerGrpcService(MICROSERVICES.CONSULTATION),
  ],
  controllers: [
    DocumentCategoryController,
    MinutesController,
    ConsultationsController,
    PublicConsultationsController,
    PublicDocumentsController,
    DocumentsController
  ],
})
export class DocumentsModule { }
