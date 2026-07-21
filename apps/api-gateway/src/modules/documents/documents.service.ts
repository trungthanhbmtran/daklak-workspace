import { Injectable, Inject, OnModuleInit } from '@nestjs/common';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';

@Injectable()
export class DocumentsService implements OnModuleInit {
  private documentService: any;
  private cabinetService: any;
  private dossierService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT.SYMBOL) private readonly documentClient: any,
    @Inject(MICROSERVICES.CABINET.SYMBOL) private readonly cabinetClient: any,
    @Inject(MICROSERVICES.DOSSIER.SYMBOL) private readonly dossierClient: any,
  ) {}

  onModuleInit() {
    this.documentService = this.documentClient.getService(MICROSERVICES.DOCUMENT.SERVICE);
    this.cabinetService = this.cabinetClient.getService(MICROSERVICES.CABINET.SERVICE);
    this.dossierService = this.dossierClient.getService(MICROSERVICES.DOSSIER.SERVICE);
  }

  async getStats() {
    return firstValueFrom(this.documentService.GetStatistics({})).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async listDocuments(query: any) {
    const req: any = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search,
      typeId: query.typeId,
      fieldId: query.fieldId,
      status: query.status,
      urgency: query.urgency,
      startDate: query.startDate,
      endDate: query.endDate,
    };
    if (query.isPublic !== undefined) req.isPublic = query.isPublic === 'true';
    if (query.fiscalYear) req.fiscalYear = parseInt(query.fiscalYear);
    if (query.transparencyCategory)
      req.transparencyCategory = query.transparencyCategory;
    if (query.isIncoming !== undefined)
      req.isIncoming = query.isIncoming === 'true';
    return firstValueFrom(this.documentService.ListDocuments(req)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async listAdminProcedures(query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      category: query.category || 'ALL',
    };
    return firstValueFrom(this.documentService.ListProcedures(req)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getAdminProcedure(id: string) {
    return firstValueFrom(this.documentService.GetProcedure({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async createAdminProcedure(body: any) {
    return firstValueFrom(this.documentService.CreateProcedure(body)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async updateAdminProcedure(id: string, body: any) {
    return firstValueFrom(
      this.documentService.UpdateProcedure({ id, ...body }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async deleteAdminProcedure(id: string) {
    return firstValueFrom(this.documentService.DeleteProcedure({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async listAdminDossiers(query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      status: query.status || '',
    };
    return firstValueFrom(this.documentService.ListDossiers(req)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getAdminDossier(id: string) {
    return firstValueFrom(this.documentService.GetDossier({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async createAdminDossier(body: any) {
    return firstValueFrom(this.documentService.CreateDossier(body)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async updateAdminDossier(id: string, body: any) {
    return firstValueFrom(
      this.documentService.UpdateDossier({ id, ...body }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async deleteAdminDossier(id: string) {
    return firstValueFrom(this.documentService.DeleteDossier({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async listCabinetFiles(user: any, userId: string, orgId: string) {
    const finalUserId = user?.id ? String(user.id) : userId || '';
    return firstValueFrom(
      this.cabinetService.ListFiles({
        userId: finalUserId,
        orgId: orgId || '',
      }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async addCabinetFile(user: any, body: any) {
    body.userId = user?.id ? String(user.id) : '';
    return firstValueFrom(this.cabinetService.AddFile(body)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async deleteCabinetFile(id: string) {
    return firstValueFrom(this.cabinetService.DeleteFile({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getComponents(id: string) {
    return firstValueFrom(this.dossierService.GetComponents({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async updateComponent(id: string, body: any) {
    return firstValueFrom(
      this.dossierService.UpdateComponent({ id, ...body }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async createDossierFromTemplate(body: { procedureId: string; senderName: string }) {
    return firstValueFrom(
      this.dossierService.CreateDossierFromTemplate(body),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async createBlankDossier(body: { procedureName: string; senderName: string }) {
    return firstValueFrom(this.dossierService.CreateBlankDossier(body)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async addComponentFromCabinet(dossierId: string, body: { name: string; fileUrl: string }) {
    return firstValueFrom(
      this.dossierService.AddComponentFromCabinet({ dossierId, ...body }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getDocument(id: string) {
    return firstValueFrom(this.documentService.GetDocument({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async createDocument(user: any, body: any) {
    body.userId = user?.id ? String(user.id) : undefined;
    body.userName = user?.fullname || user?.username || undefined;
    return firstValueFrom(this.documentService.CreateDocument(body)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async updateDocument(id: string, user: any, body: any) {
    const payload = {
      id,
      ...body,
      userId: user?.id ? String(user.id) : undefined,
      userName: user?.fullname || user?.username || undefined,
    };
    return firstValueFrom(this.documentService.UpdateDocument(payload)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async extractMetadata(body: { fileId: string }) {
    return firstValueFrom(this.documentService.ExtractMetadata(body)).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async syncOnline() {
    return firstValueFrom(this.documentService.SyncOnline({})).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async getDocumentLogs(id: string) {
    return firstValueFrom(
      this.documentService.GetLogs({ documentId: id }),
    ).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }

  async deleteDocument(id: string) {
    return firstValueFrom(this.documentService.DeleteDocument({ id })).catch((e) => {
      console.error('RPC Call Failed', e.message);
      return null;
    });
  }
}
