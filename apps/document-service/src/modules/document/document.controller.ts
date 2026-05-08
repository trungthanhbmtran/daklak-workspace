import { Controller } from '@nestjs/common';
import { GrpcMethod } from '@nestjs/microservices';
import { DocumentService } from './document.service';

@Controller()
export class DocumentController {
  constructor(private readonly documentService: DocumentService) {}

  @GrpcMethod('DocumentService', 'CreateDocument')
  createDocument(data: any) {
    return this.documentService.create(data);
  }

  @GrpcMethod('DocumentService', 'GetDocument')
  getDocument(data: { id: string }) {
    return this.documentService.findOne(data.id);
  }

  @GrpcMethod('DocumentService', 'ListDocuments')
  listDocuments(data: any) {
    return this.documentService.findAll(data);
  }

  @GrpcMethod('DocumentService', 'UpdateDocument')
  updateDocument(data: any) {
    return this.documentService.update(data.id, data);
  }

  @GrpcMethod('DocumentService', 'DeleteDocument')
  deleteDocument(data: { id: string }) {
    return this.documentService.remove(data.id);
  }

  @GrpcMethod('DocumentService', 'GetStatistics')
  getStatistics(data: any) {
    return this.documentService.getStatistics();
  }

  @GrpcMethod('DocumentService', 'ExtractMetadata')
  extractMetadata(data: { fileId: string }) {
    return this.documentService.extractMetadata(data.fileId);
  }

  @GrpcMethod('DocumentService', 'SyncOnline')
  syncOnline(data: any) {
    return this.documentService.syncOnline();
  }

  @GrpcMethod('DocumentService', 'GetLogs')
  getLogs(data: { documentId: string }) {
    return this.documentService.getLogs(data.documentId);
  }

  @GrpcMethod('DocumentService', 'ReceiveDocument')
  async receiveDocument(data: { id: string, actorId?: string, actorName?: string }) {
    const result = await this.documentService.receiveDocument(data.id, data.actorId, data.actorName);
    return { data: result };
  }

  @GrpcMethod('DocumentService', 'ProcessDocument')
  async processDocument(data: { id: string, actorId: string, actorName: string, note?: string }) {
    const result = await this.documentService.processDocument(data.id, data.actorId, data.actorName, data.note);
    return { data: result };
  }

  @GrpcMethod('DocumentService', 'FinalizeDocument')
  async finalizeDocument(data: { id: string, actorId: string, actorName: string, note?: string }) {
    const result = await this.documentService.finalizeDocument(data.id, data.actorId, data.actorName, data.note);
    return { data: result };
  }

  // --- Procedures (Thủ tục hành chính) ---
  @GrpcMethod('DocumentService', 'CreateProcedure')
  createProcedure(data: any) {
    return this.documentService.createProcedure(data);
  }

  @GrpcMethod('DocumentService', 'GetProcedure')
  getProcedure(data: { id: string }) {
    return this.documentService.findProcedureOne(data.id);
  }

  @GrpcMethod('DocumentService', 'ListProcedures')
  listProcedures(data: any) {
    return this.documentService.findProcedureAll(data);
  }

  @GrpcMethod('DocumentService', 'UpdateProcedure')
  updateProcedure(data: any) {
    return this.documentService.updateProcedure(data.id, data);
  }

  @GrpcMethod('DocumentService', 'DeleteProcedure')
  deleteProcedure(data: { id: string }) {
    return this.documentService.removeProcedure(data.id);
  }

  // --- OneStopDossier (Hồ sơ một cửa) ---
  @GrpcMethod('DocumentService', 'CreateDossier')
  createDossier(data: any) {
    return this.documentService.createDossier(data);
  }

  @GrpcMethod('DocumentService', 'GetDossier')
  getDossier(data: { id?: string, code?: string }) {
    return this.documentService.findDossierOne(data);
  }

  @GrpcMethod('DocumentService', 'ListDossiers')
  listDossiers(data: any) {
    return this.documentService.findDossierAll(data);
  }

  @GrpcMethod('DocumentService', 'UpdateDossier')
  updateDossier(data: any) {
    return this.documentService.updateDossier(data.id, data);
  }

  @GrpcMethod('DocumentService', 'DeleteDossier')
  deleteDossier(data: { id: string }) {
    return this.documentService.removeDossier(data.id);
  }
}



