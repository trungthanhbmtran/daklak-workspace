import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { CreateDocumentGrpcDto, UpdateDocumentGrpcDto, IdStringGrpcDto, ListDocumentsGrpcDto, ExtractMetadataGrpcDto, GetLogsGrpcDto, DocumentActionGrpcDto, ReceiveDocumentGrpcDto, DossierCodeDto, AnyGrpcDto } from './dto/document.grpc.dto';
import { DocumentService } from './document.service';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @GrpcMethod('DocumentService', 'CreateDocument')
  createDocument(@Payload() data: CreateDocumentGrpcDto) {
    return this.documentService.create(data);
  }

  @GrpcMethod('DocumentService', 'GetDocument')
  getDocument(@Payload() data: IdStringGrpcDto) {
    return this.documentService.findOne(data.id);
  }

  @GrpcMethod('DocumentService', 'ListDocuments')
  listDocuments(@Payload() data: ListDocumentsGrpcDto) {
    return this.documentService.findAll(data);
  }

  @GrpcMethod('DocumentService', 'UpdateDocument')
  updateDocument(@Payload() data: UpdateDocumentGrpcDto) {
    return this.documentService.update(data.id, data);
  }

  @GrpcMethod('DocumentService', 'DeleteDocument')
  deleteDocument(@Payload() data: IdStringGrpcDto) {
    return this.documentService.remove(data.id);
  }

  @GrpcMethod('DocumentService', 'GetStatistics')
  getStatistics(@Payload() data: AnyGrpcDto) {
    return this.documentService.getStatistics();
  }

  @GrpcMethod('DocumentService', 'ExtractMetadata')
  extractMetadata(@Payload() data: ExtractMetadataGrpcDto) {
    return this.documentService.extractMetadata(data.fileId);
  }

  @GrpcMethod('DocumentService', 'SyncOnline')
  syncOnline(@Payload() data: AnyGrpcDto) {
    return this.documentService.syncOnline();
  }

  @GrpcMethod('DocumentService', 'GetLogs')
  getLogs(@Payload() data: GetLogsGrpcDto) {
    return this.documentService.getLogs(data.documentId);
  }

  @GrpcMethod('DocumentService', 'ReceiveDocument')
  async receiveDocument(@Payload() data: ReceiveDocumentGrpcDto) {
    const result = await this.documentService.receiveDocument(data.id, data.actorId, data.actorName);
    return { data: result };
  }

  @GrpcMethod('DocumentService', 'ProcessDocument')
  async processDocument(@Payload() data: DocumentActionGrpcDto) {
    const result = await this.documentService.processDocument(data.id, data.actorId, data.actorName, data.note);
    return { data: result };
  }

  @GrpcMethod('DocumentService', 'FinalizeDocument')
  async finalizeDocument(@Payload() data: DocumentActionGrpcDto) {
    const result = await this.documentService.finalizeDocument(data.id, data.actorId, data.actorName, data.note);
    return { data: result };
  }

  // --- Procedures (Thủ tục hành chính) ---
  @GrpcMethod('DocumentService', 'CreateProcedure')
  createProcedure(@Payload() data: AnyGrpcDto) {
    return this.documentService.createProcedure(data);
  }

  @GrpcMethod('DocumentService', 'GetProcedure')
  getProcedure(@Payload() data: IdStringGrpcDto) {
    return this.documentService.findProcedureOne(data.id);
  }

  @GrpcMethod('DocumentService', 'ListProcedures')
  listProcedures(@Payload() data: AnyGrpcDto) {
    return this.documentService.findProcedureAll(data);
  }

  @GrpcMethod('DocumentService', 'UpdateProcedure')
  updateProcedure(@Payload() data: AnyGrpcDto) {
    return this.documentService.updateProcedure(data.id!, data);
  }

  @GrpcMethod('DocumentService', 'DeleteProcedure')
  deleteProcedure(@Payload() data: IdStringGrpcDto) {
    return this.documentService.removeProcedure(data.id);
  }

  // --- OneStopDossier (Hồ sơ một cửa) ---
  @GrpcMethod('DocumentService', 'CreateDossier')
  createDossier(@Payload() data: AnyGrpcDto) {
    return this.documentService.createDossier(data);
  }

  @GrpcMethod('DocumentService', 'GetDossier')
  getDossier(@Payload() data: DossierCodeDto) {
    return this.documentService.findDossierOne(data);
  }

  @GrpcMethod('DocumentService', 'ListDossiers')
  listDossiers(@Payload() data: AnyGrpcDto) {
    return this.documentService.findDossierAll(data);
  }

  @GrpcMethod('DocumentService', 'UpdateDossier')
  updateDossier(@Payload() data: AnyGrpcDto) {
    return this.documentService.updateDossier(data.id!, data);
  }

  @GrpcMethod('DocumentService', 'DeleteDossier')
  deleteDossier(@Payload() data: IdStringGrpcDto) {
    return this.documentService.removeDossier(data.id);
  }
}



