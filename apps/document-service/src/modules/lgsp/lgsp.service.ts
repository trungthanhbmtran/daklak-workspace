import { Injectable, Logger, BadRequestException, InternalServerErrorException, NotFoundException } from '@nestjs/common';
import { LgspConfigService } from './lgsp.config';
import { LgspTokenService } from './lgsp-token.service';
import { LGSP_ENDPOINTS, LGSP_SCOPES } from './lgsp.constants';
import { buildEdxml, parseEdxml } from './edxml.util';
import { PrismaService } from '../../database/prisma.service';

export interface AgencyRegistrationDto {
  id?: string;
  pcode?: string;
  code: string;
  name: string;
  email?: string;
  phone?: string;
  fax?: string;
}

@Injectable()
export class LgspService {
  private readonly logger = new Logger(LgspService.name);

  constructor(
    private readonly configService: LgspConfigService,
    private readonly tokenService: LgspTokenService,
    private readonly prisma: PrismaService,
  ) {}

  // =========================================================================
  // 1. Core 7 Interoperability APIs matching Specification
  // =========================================================================

  /**
   * 4.1.1 Lấy danh sách đơn vị liên thông
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/dvlt/1.0.0/getAgenciesList
   */
  async getAgenciesList(query?: { limit?: number; offset?: number }): Promise<any> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DVLT);
    const systemCode = this.configService.systemCode;

    const url = new URL(LGSP_ENDPOINTS.AGENCIES_LIST);
    if (query?.limit !== undefined) url.searchParams.set('limit', String(query.limit));
    if (query?.offset !== undefined) url.searchParams.set('offset', String(query.offset));

    this.logger.log(`Gọi 4.1.1 getAgenciesList (SystemCode: ${systemCode})`);
    const response = await fetch(url.toString(), {
      method: 'POST',
      headers: {
        SystemCode: systemCode,
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleJsonResponse(response, 'getAgenciesList');
  }

  /**
   * 4.1.2 Gửi văn bản hoặc gói tin trạng thái
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/guivb/1.0.0/sendEdoc
   */
  async sendEdoc(params: {
    edxmlBuffer: Buffer;
    requestId?: string;
    messageType?: 'edoc' | 'status';
  }): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string; DocId?: string }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DOCS);
    const systemCode = this.configService.systemCode;
    const reqId = params.requestId || `REQ-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const msgType = params.messageType || 'edoc';

    this.logger.log(`Gọi 4.1.2 sendEdoc (requestId: ${reqId}, messageType: ${msgType})`);
    const response = await fetch(LGSP_ENDPOINTS.SEND_EDOC, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/octet-stream',
        Authorization: `Bearer ${token}`,
        'X-lgsp-requestId': reqId,
        servicetype: 'eDoc',
        messagetype: msgType,
        SystemCode: systemCode,
      },
      body: new Uint8Array(params.edxmlBuffer),
    });

    return this.handleJsonResponse(response, 'sendEdoc');
  }

  /**
   * 4.1.3 Lấy danh sách gói tin edoc hoặc status
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/dhvb/1.0.0/getReceivedEdocList
   */
  async getReceivedEdocList(params?: {
    messageType?: 'edoc' | 'status';
  }): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string; total?: number; data: any[] }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DOC);
    const systemCode = this.configService.systemCode;
    const msgType = params?.messageType || 'edoc';

    this.logger.log(`Gọi 4.1.3 getReceivedEdocList (messageType: ${msgType}, SystemCode: ${systemCode})`);
    const response = await fetch(LGSP_ENDPOINTS.RECEIVED_EDOC_LIST, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        servicetype: 'eDoc',
        messagetype: msgType,
        SystemCode: systemCode,
      },
    });

    return this.handleJsonResponse(response, 'getReceivedEdocList');
  }

  /**
   * 4.1.4 Lấy văn bản edoc hoặc gói tin trạng thái
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/dhvb/1.0.0/getEdoc
   */
  async getEdoc(docId: string): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string; data: string }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DOC);
    const systemCode = this.configService.systemCode;

    this.logger.log(`Gọi 4.1.4 getEdoc (docId: ${docId}, SystemCode: ${systemCode})`);
    const response = await fetch(LGSP_ENDPOINTS.GET_EDOC, {
      method: 'POST',
      headers: {
        docId: docId,
        Authorization: `Bearer ${token}`,
        SystemCode: systemCode,
      },
    });

    return this.handleJsonResponse(response, 'getEdoc');
  }

  /**
   * 4.1.5 Lấy danh sách trạng thái gửi văn bản
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/guivb/1.0.0/getSentEdocList
   */
  async getSentEdocList(
    docId: string,
    messageType: 'edoc' | 'status' = 'edoc',
  ): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string; Data: any[] }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DOCS);
    const systemCode = this.configService.systemCode;

    this.logger.log(`Gọi 4.1.5 getSentEdocList (docid: ${docId}, SystemCode: ${systemCode})`);
    const response = await fetch(LGSP_ENDPOINTS.SENT_EDOC_LIST, {
      method: 'POST',
      headers: {
        servicetype: 'eDoc',
        messagetype: messageType,
        docid: docId,
        Authorization: `Bearer ${token}`,
        SystemCode: systemCode,
      },
    });

    return this.handleJsonResponse(response, 'getSentEdocList');
  }

  /**
   * 4.1.6 Cập nhật trạng thái gói tin
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/guivb/1.0.0/updateStatus
   */
  async updateStatus(
    docId: string,
    status: string = 'done',
  ): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DOCS);
    const systemCode = this.configService.systemCode;

    this.logger.log(`Gọi 4.1.6 updateStatus (docid: ${docId}, status: ${status})`);
    const response = await fetch(LGSP_ENDPOINTS.UPDATE_STATUS, {
      method: 'POST',
      headers: {
        SystemCode: systemCode,
        docid: docId,
        status: status,
        Authorization: `Bearer ${token}`,
      },
    });

    return this.handleJsonResponse(response, 'updateStatus');
  }

  /**
   * 4.1.7 Đăng ký đơn vị liên thông
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/dvlt/1.0.0/registerAgencies
   */
  async registerAgencies(
    agencyData: AgencyRegistrationDto,
  ): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DVLT);
    const systemCode = this.configService.systemCode;

    this.logger.log(`Gọi 4.1.7 registerAgencies (Code: ${agencyData.code}, Name: ${agencyData.name})`);
    const response = await fetch(LGSP_ENDPOINTS.REGISTER_AGENCIES, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
        SystemCode: systemCode,
      },
      body: JSON.stringify(agencyData),
    });

    return this.handleJsonResponse(response, 'registerAgencies');
  }

  // =========================================================================
  // 2. High-Level Workflows & Business Orchestrations
  // =========================================================================

  /**
   * Đồng bộ văn bản đến từ trục LGSP:
   * 1. Lấy danh sách gói tin (getReceivedEdocList)
   * 2. Lấy nội dung edxml từng văn bản (getEdoc)
   * 3. Giải mã và lưu vào cơ sở dữ liệu Document
   * 4. Báo nhận thành công (updateStatus done)
   * 5. Ghi vết kiểm toán DocumentLog
   */
  async syncIncomingEdocs(user?: any): Promise<{
    success: boolean;
    syncedCount: number;
    documents: any[];
    message: string;
  }> {
    if (!this.configService.isConfigured()) {
      return {
        success: false,
        syncedCount: 0,
        documents: [],
        message: 'LGSP chưa được cấu hình Secret Key hoặc thông tin tài khoản. Vui lòng cấu hình trước khi đồng bộ.',
      };
    }

    const receivedListRes = await this.getReceivedEdocList({ messageType: 'edoc' });
    const packetList = Array.isArray(receivedListRes?.data) ? receivedListRes.data : [];

    if (packetList.length === 0) {
      return {
        success: true,
        syncedCount: 0,
        documents: [],
        message: 'Không có gói tin văn bản mới nào từ trục LGSP.',
      };
    }

    const createdDocuments: any[] = [];

    for (const packet of packetList) {
      const docId = packet.docId;
      if (!docId) continue;

      try {
        // Tải gói tin edxml
        const edocDetailRes = await this.getEdoc(docId);
        if (!edocDetailRes?.data) {
          this.logger.warn(`Không nhận được dữ liệu edxml cho gói tin: ${docId}`);
          continue;
        }

        const parsed = parseEdxml(edocDetailRes.data);

        // Kiểm tra xem văn bản đã được tiếp nhận chưa để chống trùng lặp
        const existing = await this.prisma.document.findFirst({
          where: {
            OR: [
              { documentNumber: parsed.documentNumber, isIncoming: true },
              { arrivalNumber: docId },
            ],
          },
        });

        let savedDoc: any;
        if (!existing) {
          savedDoc = await this.prisma.document.create({
            data: {
              documentNumber: parsed.documentNumber,
              notation: parsed.notation || null,
              abstract: parsed.abstract,
              content: parsed.content || null,
              issuerName: parsed.issuerName || packet.from || null,
              issuingAuthorityId: parsed.issuingAuthorityId || packet.from || null,
              signerName: parsed.signerName || null,
              signerPosition: parsed.signerPosition || null,
              issueDate: parsed.issueDate || null,
              arrivalDate: new Date(),
              arrivalNumber: docId,
              isIncoming: true,
              isPublic: false,
              urgency: parsed.urgency || 'NORMAL',
              securityLevel: parsed.securityLevel || 'NORMAL',
              status: 'TIẾP NHẬN',
            },
          });
        } else {
          savedDoc = existing;
        }

        // Cập nhật trạng thái 'done' trên trục LGSP để xác nhận đã tiếp nhận
        await this.updateStatus(docId, 'done');

        // Ghi log kiểm toán
        await this.prisma.documentLog.create({
          data: {
            documentId: savedDoc.id,
            userId: user?.id ? String(user.id) : 'SYSTEM_LGSP',
            userName: user?.fullname || user?.username || 'LGSP Interoperability',
            action: 'TIẾP NHẬN LGSP',
            note: `Tiếp nhận gói tin liên thông từ trục LGSP. Mã gói tin LGSP: ${docId}, Mã cơ quan gửi: ${packet.from || 'N/A'}`,
          },
        });

        createdDocuments.push(savedDoc);
      } catch (err: any) {
        this.logger.error(`Lỗi khi xử lý gói tin LGSP docId=${docId}: ${err.message}`);
      }
    }

    return {
      success: true,
      syncedCount: createdDocuments.length,
      documents: createdDocuments,
      message: `Đồng bộ thành công ${createdDocuments.length} văn bản từ trục LGSP.`,
    };
  }

  /**
   * Gửi văn bản đi liên thông qua trục LGSP:
   * 1. Lấy thông tin văn bản từ DB
   * 2. Đóng gói edxml theo chuẩn
   * 3. Gửi lên trục LGSP (sendEdoc)
   * 4. Ghi nhận log và lưu vết
   */
  async dispatchDocumentToLgsp(
    documentId: string,
    receiverCode: string,
    user?: any,
  ): Promise<{ success: boolean; docId?: string; message: string; rawResponse?: any }> {
    if (!this.configService.isConfigured()) {
      throw new BadRequestException(
        'LGSP chưa được cấu hình Secret Key bí mật liên thông. Vui lòng cập nhật cấu hình trước khi gửi.',
      );
    }

    const document = await this.prisma.document.findUnique({
      where: { id: documentId },
    });

    if (!document) {
      throw new NotFoundException(`Không tìm thấy văn bản với ID: ${documentId}`);
    }

    const requestId = `LGSP-OUT-${document.id}-${Date.now()}`;
    const edxmlStr = buildEdxml(document, {
      senderCode: this.configService.systemCode,
      receiverCode: receiverCode,
      requestId: requestId,
    });

    const edxmlBuffer = Buffer.from(edxmlStr, 'utf-8');
    const sendRes = await this.sendEdoc({
      edxmlBuffer,
      requestId,
      messageType: 'edoc',
    });

    const lgspDocId = sendRes?.DocId || '';

    // Ghi nhận vết luân chuyển
    await this.prisma.documentLog.create({
      data: {
        documentId: document.id,
        userId: user?.id ? String(user.id) : 'SYSTEM',
        userName: user?.fullname || user?.username || 'Hệ thống gửi LGSP',
        action: 'GỬI LIÊN THÔNG LGSP',
        note: `Văn bản được gửi liên thông đến đơn vị [${receiverCode}]. Mã giao dịch: ${requestId}, Mã gói tin LGSP: ${lgspDocId || 'N/A'}. Trạng thái: ${sendRes?.status || 'SENT'}`,
      },
    });

    return {
      success: true,
      docId: lgspDocId,
      message: `Văn bản đã được gửi thành công lên trục liên thông LGSP tới đơn vị [${receiverCode}].`,
      rawResponse: sendRes,
    };
  }

  /**
   * Tra cứu trạng thái gửi văn bản qua LGSP
   */
  async getDocumentSentStatus(documentId: string, lgspDocId?: string): Promise<any> {
    let targetDocId = lgspDocId;

    if (!targetDocId) {
      // Tìm trong documentLog xem có mã gói tin LGSP không
      const lastLgspLog = await this.prisma.documentLog.findFirst({
        where: {
          documentId: documentId,
          action: 'GỬI LIÊN THÔNG LGSP',
        },
        orderBy: { createdAt: 'desc' },
      });

      if (lastLgspLog?.note) {
        const match = lastLgspLog.note.match(/Mã gói tin LGSP:\s*([^\s,]+)/);
        if (match && match[1] && match[1] !== 'N/A') {
          targetDocId = match[1];
        }
      }
    }

    if (!targetDocId) {
      throw new BadRequestException('Chưa xác định được Mã gói tin LGSP (DocId) của văn bản này.');
    }

    return this.getSentEdocList(targetDocId, 'edoc');
  }

  /**
   * Lấy trạng thái cấu hình kết nối hiện tại
   */
  getConfig() {
    return this.configService.getPublicStatus();
  }

  /**
   * Cập nhật thông số kết nối (cho phép nhập secret key khi có)
   */
  updateConfig(partial: any) {
    const updated = this.configService.updateConfig(partial);
    // Làm mới token cache khi thay đổi thông tin xác thực
    this.tokenService.clearTokenCache();
    return updated;
  }

  // =========================================================================
  // Private Response Helper
  // =========================================================================

  private async handleJsonResponse(response: Response, actionName: string): Promise<any> {
    if (!response.ok) {
      const errText = await response.text();
      this.logger.error(`LGSP API ${actionName} error (${response.status}): ${errText}`);
      throw new InternalServerErrorException(
        `Lỗi gọi LGSP ${actionName} (${response.status}): ${errText}`,
      );
    }

    try {
      return await response.json();
    } catch {
      throw new InternalServerErrorException(`Phản hồi từ LGSP ${actionName} không phải định dạng JSON hợp lệ.`);
    }
  }
}
