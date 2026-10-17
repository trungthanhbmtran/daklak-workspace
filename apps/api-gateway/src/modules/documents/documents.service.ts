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

  private async callGrpc<T>(call$: Observable<T>, action: string, timeoutMs = 8000): Promise<T> {
    try {
      return await executeGrpcCall(call$, timeoutMs, action);
    } catch (e: any) {
      this.logger.error(`${action} failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(
        e.message || `Lỗi gọi gRPC ${action}`,
      );
    }
  }

  async listDocuments(query: any, user?: any, metadata?: any) {
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
      this.documentService.ListDocuments(req, metadata),
      'DocumentService.ListDocuments',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async listAdminProcedures(query: any, metadata?: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      category: query.category || 'ALL',
    };
    return this.callGrpc(
      this.documentService.ListProcedures(req, metadata),
      'DocumentService.ListProcedures',
    );
  }

  async getAdminProcedure(id: string, metadata?: any) {
    return this.callGrpc(
      this.documentService.GetProcedure({ id }, metadata),
      'DocumentService.GetProcedure',
    );
  }

  async createAdminProcedure(body: any, metadata?: any) {
    return this.callGrpc(
      this.documentService.CreateProcedure(body, metadata),
      'DocumentService.CreateProcedure',
    );
  }

  async updateAdminProcedure(id: string, body: any, metadata?: any) {
    return this.callGrpc(
      this.documentService.UpdateProcedure({ id, ...body }, metadata),
      'DocumentService.UpdateProcedure',
    );
  }

  async deleteAdminProcedure(id: string, metadata?: any) {
    return this.callGrpc(
      this.documentService.DeleteProcedure({ id }, metadata),
      'DocumentService.DeleteProcedure',
    );
  }

  async listAdminDossiers(query: any, metadata?: any) {
    const req = {
      page: parseInt(query.page) || 1,
      limit: parseInt(query.limit) || 10,
      search: query.search || '',
      status: query.status || '',
    };
    return this.callGrpc(
      this.documentService.ListDossiers(req, metadata),
      'DocumentService.ListDossiers',
    );
  }

  async getAdminDossier(id: string, metadata?: any) {
    return this.callGrpc(
      this.documentService.GetDossier({ id }, metadata),
      'DocumentService.GetDossier',
    );
  }

  async createAdminDossier(body: any, metadata?: any) {
    return this.callGrpc(
      this.documentService.CreateDossier(body, metadata),
      'DocumentService.CreateDossier',
    );
  }

  async updateAdminDossier(id: string, body: any, metadata?: any) {
    return this.callGrpc(
      this.documentService.UpdateDossier({ id, ...body }, metadata),
      'DocumentService.UpdateDossier',
    );
  }

  async deleteAdminDossier(id: string, metadata?: any) {
    return this.callGrpc(
      this.documentService.DeleteDossier({ id }, metadata),
      'DocumentService.DeleteDossier',
    );
  }

  async listCabinetFiles(user: any, userId: string, orgId: string, metadata?: any) {
    const finalUserId = user?.id ? String(user.id) : userId || '';
    return this.callGrpc(
      this.cabinetService.ListFiles(
        {
          userId: finalUserId,
          orgId: orgId || '',
        },
        metadata,
      ),
      'CabinetService.ListFiles',
    );
  }

  async addCabinetFile(user: any, body: any, metadata?: any) {
    body.userId = user?.id ? String(user.id) : '';
    return this.callGrpc(
      this.cabinetService.AddFile(body, metadata),
      'CabinetService.AddFile',
    );
  }

  async deleteCabinetFile(id: string, metadata?: any) {
    return this.callGrpc(
      this.cabinetService.DeleteFile({ id }, metadata),
      'CabinetService.DeleteFile',
    );
  }

  async getComponents(id: string, metadata?: any) {
    return this.callGrpc(
      this.dossierService.GetComponents({ id }, metadata),
      'DossierService.GetComponents',
    );
  }

  async updateComponent(id: string, body: any, metadata?: any) {
    return this.callGrpc(
      this.dossierService.UpdateComponent({ id, ...body }, metadata),
      'DossierService.UpdateComponent',
    );
  }

  async createDossierFromTemplate(body: {
    procedureId: string;
    senderName: string;
  }, metadata?: any) {
    return this.callGrpc(
      this.dossierService.CreateDossierFromTemplate(body, metadata),
      'DossierService.CreateDossierFromTemplate',
    );
  }

  async createBlankDossier(body: {
    procedureName: string;
    senderName: string;
  }, metadata?: any) {
    return this.callGrpc(
      this.dossierService.CreateBlankDossier(body, metadata),
      'DossierService.CreateBlankDossier',
    );
  }

  async addComponentFromCabinet(
    dossierId: string,
    body: { name: string; fileUrl: string },
    metadata?: any,
  ) {
    return this.callGrpc(
      this.dossierService.AddComponentFromCabinet({ dossierId, ...body }, metadata),
      'DossierService.AddComponentFromCabinet',
    );
  }

  async getDocument(id: string, metadata?: any) {
    const res = await this.callGrpc(
      this.documentService.GetDocument({ id }, metadata),
      'DocumentService.GetDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async createDocument(user: any, body: any, metadata?: any) {
    body.userId = user?.id ? String(user.id) : undefined;
    body.userName = user?.fullname || user?.username || undefined;
    const res = await this.callGrpc(
      this.documentService.CreateDocument(body, metadata),
      'DocumentService.CreateDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async updateDocument(id: string, user: any, body: any, metadata?: any) {
    const payload = {
      id,
      ...body,
      userId: user?.id ? String(user.id) : undefined,
      userName: user?.fullname || user?.username || undefined,
    };
    const res = await this.callGrpc(
      this.documentService.UpdateDocument(payload, metadata),
      'DocumentService.UpdateDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async processDocument(
    id: string,
    user: any,
    body: { note?: string },
    metadata?: any,
  ) {
    const res = await this.callGrpc(
      this.documentService.ProcessDocument(
        {
          id,
          actorId: user?.id ? String(user.id) : undefined,
          note: body?.note,
        },
        metadata,
      ),
      'DocumentService.ProcessDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async finalizeDocument(
    id: string,
    user: any,
    body: { note?: string },
    metadata?: any,
  ) {
    const res = await this.callGrpc(
      this.documentService.FinalizeDocument(
        {
          id,
          actorId: user?.id ? String(user.id) : undefined,
          note: body?.note,
        },
        metadata,
      ),
      'DocumentService.FinalizeDocument',
    );
    return normalizeResponsePayload(res, 'document');
  }

  async extractMetadata(body: { fileId: string }, metadata?: any) {
    return this.callGrpc(
      this.documentService.ExtractMetadata(body, metadata),
      'DocumentService.ExtractMetadata',
    );
  }

  async getDocumentLogs(id: string, metadata?: any) {
    return this.callGrpc(
      this.documentService.GetLogs({ documentId: id }, metadata),
      'DocumentService.GetLogs',
    );
  }

  async deleteDocument(id: string, metadata?: any) {
    return this.callGrpc(
      this.documentService.DeleteDocument({ id }, metadata),
      'DocumentService.DeleteDocument',
    );
  }

  // --- LGSP Interoperability Methods ---
  async syncLgsp(user?: any, metadata?: any) {
    try {
      const res: any = await this.callGrpc(
        this.documentService.SyncLgsp(
          {
            actorId: user?.id ? String(user.id) : undefined,
            actorName: user?.fullname || user?.username || undefined,
          },
          metadata,
        ),
        'DocumentService.SyncLgsp',
        35000,
      );
      try {
        if (res?.data && typeof res.data === 'string') {
          res.documents = JSON.parse(res.data);
        }
      } catch {
        res.documents = [];
      }
      return res;
    } catch (e: any) {
      this.logger.error(`DocumentService.SyncLgsp failed: ${e.message}`);
      return {
        success: false,
        syncedCount: 0,
        documents: [],
        message:
          'Không thể kết nối đến máy chủ LGSP Đắk Lắk (10.30.1.7:9445 / 10.30.1.6:8243). Vui lòng kiểm tra kết nối mạng nội bộ hoặc kích hoạt VPN Tỉnh Đắk Lắk.',
      };
    }
  }

  async sendLgspDocument(id: string, body: { receiverCode: string }, user?: any, metadata?: any) {
    try {
      return await this.callGrpc(
        this.documentService.SendLgspDocument(
          {
            documentId: id,
            receiverCode: body.receiverCode,
            actorId: user?.id ? String(user.id) : undefined,
            actorName: user?.fullname || user?.username || undefined,
          },
          metadata,
        ),
        'DocumentService.SendLgspDocument',
        25000,
      );
    } catch (e: any) {
      this.logger.error(`DocumentService.SendLgspDocument failed: ${e.message}`);
      return {
        success: false,
        docId: '',
        message:
          'Không thể gửi văn bản lên trục LGSP Đắk Lắk do máy chủ LGSP không phản hồi. Vui lòng kiểm tra đường truyền VPN Tỉnh Đắk Lắk (10.30.1.6:8243).',
        rawResponse: '{}',
      };
    }
  }

  async getLgspAgencies(query: any, metadata?: any) {
    const res: any = await this.callGrpc(
      this.documentService.GetLgspAgencies(
        {
          limit: query?.limit ? parseInt(query.limit) : undefined,
          offset: query?.offset ? parseInt(query.offset) : undefined,
        },
        metadata,
      ),
      'DocumentService.GetLgspAgencies',
      15000,
    );
    try {
      if (res?.data && typeof res.data === 'string') {
        res.data = JSON.parse(res.data);
      }
    } catch {
      // Keep res.data
    }
    return res;
  }

  async getLgspSentStatus(id: string, lgspDocId?: string, metadata?: any) {
    const res: any = await this.callGrpc(
      this.documentService.GetLgspSentStatus(
        {
          documentId: id,
          lgspDocId: lgspDocId,
        },
        metadata,
      ),
      'DocumentService.GetLgspSentStatus',
      15000,
    );
    try {
      if (res?.data && typeof res.data === 'string') {
        res.data = JSON.parse(res.data);
      }
    } catch {
      // Keep res.data
    }
    return res;
  }

  async getLgspConfig(metadata?: any) {
    return this.callGrpc(
      this.documentService.GetLgspConfig({}, metadata),
      'DocumentService.GetLgspConfig',
      10000,
    );
  }

  async updateLgspConfig(body: any, metadata?: any) {
    return this.callGrpc(
      this.documentService.UpdateLgspConfig(body, metadata),
      'DocumentService.UpdateLgspConfig',
      10000,
    );
  }

  async testLgspConnection(metadata?: any) {
    try {
      return await this.callGrpc(
        this.documentService.TestLgspConnection({}, metadata),
        'DocumentService.TestLgspConnection',
        12000,
      );
    } catch (e: any) {
      this.logger.error(`DocumentService.TestLgspConnection failed: ${e.message}`);
      return {
        success: false,
        message:
          'Không thể kết nối đến máy chủ LGSP Đắk Lắk (10.30.1.7:9445 / 10.30.1.6:8243). Yêu cầu kết nối Mạng chuyên dùng / VPN Tỉnh Đắk Lắk.',
        ssoLatencyMs: 0,
        gatewayLatencyMs: 0,
        ssoStatus: 'Không kết nối được',
        gatewayStatus: 'Không kết nối được',
        isVpnReachable: false,
      };
    }
  }
}
