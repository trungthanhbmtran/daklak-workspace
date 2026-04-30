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
}

