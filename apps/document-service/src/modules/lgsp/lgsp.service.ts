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
  // Helper: Xây dựng URL động từ cấu hình baseUrl
  // =========================================================================
  private getEndpoint(path: string): string {
    const base = (this.configService.baseUrl || LGSP_ENDPOINTS.BASE).replace(/\/+$/, '');
    const cleanPath = path.startsWith('/') ? path : `/${path}`;
    return `${base}${cleanPath}`;
  }

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

    const url = new URL(this.getEndpoint('/dvlt/1.0.0/getAgenciesList'));
    if (query?.limit !== undefined) url.searchParams.set('limit', String(query.limit));
    if (query?.offset !== undefined) url.searchParams.set('offset', String(query.offset));

    this.logger.log(`Gọi 4.1.1 getAgenciesList (SystemCode: ${systemCode})`);
    try {
      const response = await fetch(url.toString(), {
        method: 'POST',
        headers: {
          SystemCode: systemCode,
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      return await this.handleJsonResponse(response, 'getAgenciesList');
    } catch (err: any) {
      this.handleFetchError(err, 'getAgenciesList', url.toString());
    }
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

    const endpoint = this.getEndpoint('/guivb/1.0.0/sendEdoc');
    this.logger.log(`Gọi 4.1.2 sendEdoc (requestId: ${reqId}, messageType: ${msgType})`);
    try {
      const response = await fetch(endpoint, {
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
        signal: AbortSignal.timeout(15000),
      });

      return await this.handleJsonResponse(response, 'sendEdoc');
    } catch (err: any) {
      this.handleFetchError(err, 'sendEdoc', endpoint);
    }
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

    const endpoint = this.getEndpoint('/dhvb/1.0.0/getReceivedEdocList');
    this.logger.log(`Gọi 4.1.3 getReceivedEdocList (messageType: ${msgType}, SystemCode: ${systemCode})`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          servicetype: 'eDoc',
          messagetype: msgType,
          SystemCode: systemCode,
        },
        signal: AbortSignal.timeout(10000),
      });

      return await this.handleJsonResponse(response, 'getReceivedEdocList');
    } catch (err: any) {
      this.handleFetchError(err, 'getReceivedEdocList', endpoint);
    }
  }

  /**
   * 4.1.4 Lấy văn bản edoc hoặc gói tin trạng thái
   * URL: POST https://lifelgsp.daklak.gov.vn:8243/dhvb/1.0.0/getEdoc
   */
  async getEdoc(docId: string): Promise<{ ErrorDesc?: string; status: string; ErrorCode?: string; data: string }> {
    const token = await this.tokenService.getAccessToken(LGSP_SCOPES.READ_DOC);
    const systemCode = this.configService.systemCode;

    const endpoint = this.getEndpoint('/dhvb/1.0.0/getEdoc');
    this.logger.log(`Gọi 4.1.4 getEdoc (docId: ${docId}, SystemCode: ${systemCode})`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          docId: docId,
          Authorization: `Bearer ${token}`,
          SystemCode: systemCode,
        },
        signal: AbortSignal.timeout(10000),
      });

      return await this.handleJsonResponse(response, 'getEdoc');
    } catch (err: any) {
      this.handleFetchError(err, 'getEdoc', endpoint);
    }
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

    const endpoint = this.getEndpoint('/guivb/1.0.0/getSentEdocList');
    this.logger.log(`Gọi 4.1.5 getSentEdocList (docid: ${docId}, SystemCode: ${systemCode})`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          servicetype: 'eDoc',
          messagetype: messageType,
          docid: docId,
          Authorization: `Bearer ${token}`,
          SystemCode: systemCode,
        },
        signal: AbortSignal.timeout(10000),
      });

      return await this.handleJsonResponse(response, 'getSentEdocList');
    } catch (err: any) {
      this.handleFetchError(err, 'getSentEdocList', endpoint);
    }
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

    const endpoint = this.getEndpoint('/guivb/1.0.0/updateStatus');
    this.logger.log(`Gọi 4.1.6 updateStatus (docid: ${docId}, status: ${status})`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          SystemCode: systemCode,
          docid: docId,
          status: status,
          Authorization: `Bearer ${token}`,
        },
        signal: AbortSignal.timeout(10000),
      });

      return await this.handleJsonResponse(response, 'updateStatus');
    } catch (err: any) {
      this.handleFetchError(err, 'updateStatus', endpoint);
    }
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

    const endpoint = this.getEndpoint('/dvlt/1.0.0/registerAgencies');
    this.logger.log(`Gọi 4.1.7 registerAgencies (Code: ${agencyData.code}, Name: ${agencyData.name})`);
    try {
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
          SystemCode: systemCode,
        },
        body: JSON.stringify(agencyData),
        signal: AbortSignal.timeout(10000),
      });

      return await this.handleJsonResponse(response, 'registerAgencies');
    } catch (err: any) {
      this.handleFetchError(err, 'registerAgencies', endpoint);
    }
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
    try {
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
    } catch (err: any) {
      this.logger.error(`Đồng bộ LGSP không thành công: ${err.message}`);
      return {
        success: false,
        syncedCount: 0,
        documents: [],
        message: `Đồng bộ LGSP không thành công: ${err.message}. Kiểm tra kết nối mạng nội bộ/VPN tỉnh Đắk Lắk (10.30.1.x) hoặc cấu hình địa chỉ máy chủ LGSP.`,
      };
    }
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

  /**
   * Thẩm định kết nối thực tế tới trục LGSP và máy chủ SSO Đắk Lắk:
   * - Gửi probe nhanh (4s timeout) tới SSO (9445) và Gateway LGSP (8243)
   * - Đo thời gian phản hồi (latency ms)
   * - Nhận diện tình trạng mạng nội bộ / VPN tỉnh Đắk Lắk
   */
  async testConnection(): Promise<{
    success: boolean;
    message: string;
    ssoLatencyMs: number;
    gatewayLatencyMs: number;
    ssoStatus: string;
    gatewayStatus: string;
    isVpnReachable: boolean;
  }> {
    const ssoUrl = this.configService.ssoUrl;

    let ssoLatencyMs = 0;
    let ssoStatus = 'Chưa kiểm tra';
    let ssoSuccess = false;

    // 1. Probe SSO
    const ssoStart = Date.now();
    try {
      const res = await fetch(ssoUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: 'grant_type=probe',
        signal: AbortSignal.timeout(4000),
      });
      ssoLatencyMs = Date.now() - ssoStart;
      ssoStatus = `Phản hồi HTTP ${res.status}`;
      ssoSuccess = true;
    } catch (err: any) {
      ssoLatencyMs = Date.now() - ssoStart;
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('aborted');
      ssoStatus = isTimeout ? 'Timeout (>4000ms)' : (err.message || 'Lỗi kết nối');
      ssoSuccess = false;
    }

    // 2. Probe Gateway Base
    let gatewayLatencyMs = 0;
    let gatewayStatus = 'Chưa kiểm tra';
    let gatewaySuccess = false;

    const gwStart = Date.now();
    try {
      const probeUrl = this.getEndpoint('/dhvb/1.0.0/getReceivedEdocList');
      const res = await fetch(probeUrl, {
        method: 'POST',
        headers: { SystemCode: this.configService.systemCode },
        signal: AbortSignal.timeout(4000),
      });
      gatewayLatencyMs = Date.now() - gwStart;
      gatewayStatus = `Phản hồi HTTP ${res.status}`;
      gatewaySuccess = true;
    } catch (err: any) {
      gatewayLatencyMs = Date.now() - gwStart;
      const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('aborted');
      gatewayStatus = isTimeout ? 'Timeout (>4000ms)' : (err.message || 'Lỗi kết nối');
      gatewaySuccess = false;
    }

    const overallSuccess = ssoSuccess || gatewaySuccess;
    const isVpnReachable = overallSuccess;

    let message = '';
    if (ssoSuccess && gatewaySuccess) {
      message = `Kết nối thành công tới toàn bộ hạ tầng LGSP Đắk Lắk (SSO: ${ssoLatencyMs}ms, Gateway: ${gatewayLatencyMs}ms).`;
    } else if (overallSuccess) {
      message = `Kết nối một phần: SSO (${ssoStatus}), Gateway (${gatewayStatus}).`;
    } else {
      message = `Không thể kết nối đến máy chủ LGSP Đắk Lắk (SSO: ${ssoStatus}, Gateway: ${gatewayStatus}). Các máy chủ (10.30.1.6, 10.30.1.7) yêu cầu kết nối Mạng chuyên dùng / VPN Tỉnh Đắk Lắk.`;
    }

    return {
      success: overallSuccess,
      message,
      ssoLatencyMs,
      gatewayLatencyMs,
      ssoStatus,
      gatewayStatus,
      isVpnReachable,
    };
  }

  // =========================================================================
  // Private Response & Error Helpers
  // =========================================================================

  private handleFetchError(err: any, actionName: string, targetUrl: string): never {
    if (err instanceof BadRequestException || err instanceof InternalServerErrorException || err instanceof NotFoundException) {
      throw err;
    }
    const isTimeout = err.name === 'TimeoutError' || err.name === 'AbortError' || err.message?.includes('aborted');
    if (isTimeout) {
      this.logger.error(`LGSP API ${actionName} quá thời gian (10s): ${targetUrl}`);
      throw new InternalServerErrorException(
        `Thời gian kết nối tới máy chủ LGSP (${actionName}) quá hạn (10s). Địa chỉ máy chủ (10.30.1.6) thuộc mạng nội bộ/VPN Đắk Lắk. Vui lòng kiểm tra VPN hoặc cấu hình máy chủ.`,
      );
    }
    this.logger.error(`LGSP API ${actionName} thất bại: ${err.message}`);
    throw new InternalServerErrorException(
      `Không thể kết nối đến máy chủ LGSP (${actionName}): ${err.message}. Kiểm tra kết nối mạng/VPN tỉnh Đắk Lắk.`,
    );
  }

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
