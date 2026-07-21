import { Module } from '@nestjs/common';
import { registerGrpcService } from '../../core/factories/grpc.factory';
import { MICROSERVICES } from '../../core/constants/services';
import { DocumentCategoryController } from './document-category.controller';
import { DocumentsController } from './documents.controller';
import { MinutesController } from './minutes.controller';
import { ConsultationsController } from './consultations.controller';
import { PublicConsultationsController } from './public-consultations.controller';
import { PublicDocumentsController } from './public-documents.controller';
import { DocumentsService } from './documents.service';
import { ConsultationsService } from './consultations.service';

@Module({
  imports: [
    registerGrpcService(MICROSERVICES.DOCUMENT_CATEGORY),
    registerGrpcService(MICROSERVICES.DOCUMENT),
    registerGrpcService(MICROSERVICES.MINUTES),
    registerGrpcService(MICROSERVICES.CONSULTATION),
    registerGrpcService(MICROSERVICES.CABINET),
    registerGrpcService(MICROSERVICES.DOSSIER),
  ],
  controllers: [
    DocumentCategoryController,
    MinutesController,
    ConsultationsController,
    PublicConsultationsController,
    PublicDocumentsController,
    DocumentsController,
  ],
  providers: [DocumentsService, ConsultationsService],
})
export class DocumentsModule {}
