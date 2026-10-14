import {
  InternalServerErrorException,
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { normalizeResponsePayload } from '../../common/utils/language-normalization.util';
import { executeGrpcCall } from '../../core/utils/grpc-call.util';

@Injectable()
export class DocumentsService implements OnModuleInit {
  private readonly logger = new Logger(DocumentsService.name);
  private documentService: any;
  private cabinetService: any;
  private dossierService: any;

  constructor(
    @Inject(MICROSERVICES.DOCUMENT.SYMBOL) private readonly documentClient: any,
    @Inject(MICROSERVICES.CABINET.SYMBOL) private readonly cabinetClient: any,
    @Inject(MICROSERVICES.DOSSIER.SYMBOL) private readonly dossierClient: any,
  ) {}

  onModuleInit() {
    this.documentService = this.documentClient.getService(
      MICROSERVICES.DOCUMENT.SERVICE,
    );
    this.cabinetService = this.cabinetClient.getService(
      MICROSERVICES.CABINET.SERVICE,
    );
    this.dossierService = this.dossierClient.getService(
      MICROSERVICES.DOSSIER.SERVICE,
    );
  }

  private async callGrpc<T>(call$: Observable<T>, action: string): Promise<T> {
    try {
      return await executeGrpcCall(call$, 8000, action);
    } catch (e: any) {
      this.logger.error(`${action} failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(
        e.message || `Lỗi gọi gRPC ${action}`,
      );
    }
  }

  async listDocuments(query: any, user?: any) {
    const isAdmin =
      user?.permissionsFlatten?.includes('DOCUMENT:MANAGE') ||
      user?.permissionsFlatten?.includes('DOCUMENT:VIEW_ALL') ||
      user?.username === 'admin' ||
      user?.username === 'system';

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
    if (query.isPublic !== undefined) {
      req.isPublic = query.isPublic === 'true';
    } else if (!isAdmin) {
      req.isPublic = true;
    }
    if (!isAdmin && query.isPublic === 'false') {
      req.isPublic = true;
    }
    if (query.fiscalYear) req.fiscalYear = parseInt(query.fiscalYear);
    if (query.transparencyCategory)
      req.transparencyCategory = query.transparencyCategory;
    if (query.isIncoming !== undefined)
      req.isIncoming = query.isIncoming === 'true';

    const res = await this.callGrpc(
      this.documentService.ListDocuments(req),
      'DocumentService.ListDocuments',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async listAdminProcedures(query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      category: query.category || 'ALL',
    };
    return this.callGrpc(
      this.documentService.ListProcedures(req),
      'DocumentService.ListProcedures',
    );
  }

  async getAdminProcedure(id: string) {
    return this.callGrpc(
      this.documentService.GetProcedure({ id }),
      'DocumentService.GetProcedure',
    );
  }

  async createAdminProcedure(body: any) {
    return this.callGrpc(
      this.documentService.CreateProcedure(body),
      'DocumentService.CreateProcedure',
    );
  }

  async updateAdminProcedure(id: string, body: any) {
    return this.callGrpc(
      this.documentService.UpdateProcedure({ id, ...body }),
      'DocumentService.UpdateProcedure',
    );
  }

  async deleteAdminProcedure(id: string) {
    return this.callGrpc(
      this.documentService.DeleteProcedure({ id }),
      'DocumentService.DeleteProcedure',
    );
  }

  async listAdminDossiers(query: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      status: query.status || '',
    };
    return this.callGrpc(
      this.documentService.ListDossiers(req),
      'DocumentService.ListDossiers',
    );
  }

  async getAdminDossier(id: string) {
    return this.callGrpc(
      this.documentService.GetDossier({ id }),
      'DocumentService.GetDossier',
    );
  }

  async createAdminDossier(body: any) {
    return this.callGrpc(
      this.documentService.CreateDossier(body),
      'DocumentService.CreateDossier',
    );
  }

  async updateAdminDossier(id: string, body: any) {
    return this.callGrpc(
      this.documentService.UpdateDossier({ id, ...body }),
      'DocumentService.UpdateDossier',
    );
  }

  async deleteAdminDossier(id: string) {
    return this.callGrpc(
      this.documentService.DeleteDossier({ id }),
      'DocumentService.DeleteDossier',
    );
  }

  async listCabinetFiles(user: any, userId: string, orgId: string) {
    const finalUserId = user?.id ? String(user.id) : userId || '';
    return this.callGrpc(
      this.cabinetService.ListFiles({
        userId: finalUserId,
        orgId: orgId || '',
      }),
      'CabinetService.ListFiles',
    );
  }

  async addCabinetFile(user: any, body: any) {
    body.userId = user?.id ? String(user.id) : '';
    return this.callGrpc(
      this.cabinetService.AddFile(body),
      'CabinetService.AddFile',
    );
  }

  async deleteCabinetFile(id: string) {
    return this.callGrpc(
      this.cabinetService.DeleteFile({ id }),
      'CabinetService.DeleteFile',
    );
  }

  async getComponents(id: string) {
    return this.callGrpc(
      this.dossierService.GetComponents({ id }),
      'DossierService.GetComponents',
    );
  }

  async updateComponent(id: string, body: any) {
    return this.callGrpc(
      this.dossierService.UpdateComponent({ id, ...body }),
      'DossierService.UpdateComponent',
    );
  }

  async createDossierFromTemplate(body: {
    procedureId: string;
    senderName: string;
  }) {
    return this.callGrpc(
      this.dossierService.CreateDossierFromTemplate(body),
      'DossierService.CreateDossierFromTemplate',
    );
  }

  async createBlankDossier(body: {
    procedureName: string;
    senderName: string;
  }) {
    return this.callGrpc(
      this.dossierService.CreateBlankDossier(body),
      'DossierService.CreateBlankDossier',
    );
  }

  async addComponentFromCabinet(
    dossierId: string,
    body: { name: string; fileUrl: string },
  ) {
    return this.callGrpc(
      this.dossierService.AddComponentFromCabinet({ dossierId, ...body }),
      'DossierService.AddComponentFromCabinet',
    );
  }

  async getDocument(id: string) {
    const res = await this.callGrpc(
      this.documentService.GetDocument({ id }),
      'DocumentService.GetDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async createDocument(user: any, body: any) {
    body.userId = user?.id ? String(user.id) : undefined;
    body.userName = user?.fullname || user?.username || undefined;
    const res = await this.callGrpc(
      this.documentService.CreateDocument(body),
      'DocumentService.CreateDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async updateDocument(id: string, user: any, body: any) {
    const payload = {
      id,
      ...body,
      userId: user?.id ? String(user.id) : undefined,
      userName: user?.fullname || user?.username || undefined,
    };
    const res = await this.callGrpc(
      this.documentService.UpdateDocument(payload),
      'DocumentService.UpdateDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async extractMetadata(body: { fileId: string }) {
    return this.callGrpc(
      this.documentService.ExtractMetadata(body),
      'DocumentService.ExtractMetadata',
    );
  }

  async getDocumentLogs(id: string) {
    return this.callGrpc(
      this.documentService.GetLogs({ documentId: id }),
      'DocumentService.GetLogs',
    );
  }

  async deleteDocument(id: string) {
    return this.callGrpc(
      this.documentService.DeleteDocument({ id }),
      'DocumentService.DeleteDocument',
    );
  }
}
