import { Controller } from '@nestjs/common';
import { GrpcMethod, Payload } from '@nestjs/microservices';
import { LgspService } from './lgsp.service';

@Controller()
export class LgspController {
  constructor(private readonly lgspService: LgspService) {}

  @GrpcMethod('DocumentService', 'SyncLgsp')
  async syncLgsp(@Payload() data: { actorId?: string; actorName?: string }) {
    try {
      const result = await this.lgspService.syncIncomingEdocs({
        id: data?.actorId,
        fullname: data?.actorName,
      });
      return {
        success: result.success,
        syncedCount: result.syncedCount,
        message: result.message,
        data: JSON.stringify(result.documents || []),
      };
    } catch (err: any) {
      return {
        success: false,
        syncedCount: 0,
        message: err?.message || 'Lỗi đồng bộ văn bản từ trục LGSP',
        data: '[]',
      };
    }
  }

  @GrpcMethod('DocumentService', 'SendLgspDocument')
  async sendLgspDocument(
    @Payload() data: { documentId: string; receiverCode: string; actorId?: string; actorName?: string },
  ) {
    try {
      const result = await this.lgspService.dispatchDocumentToLgsp(
        data.documentId,
        data.receiverCode,
        { id: data?.actorId, fullname: data?.actorName },
      );
      return {
        success: result.success,
        docId: result.docId || '',
        message: result.message,
        rawResponse: JSON.stringify(result.rawResponse || {}),
      };
    } catch (err: any) {
      return {
        success: false,
        docId: '',
        message: err?.message || 'Lỗi gửi văn bản liên thông LGSP',
        rawResponse: '{}',
      };
    }
  }

  @GrpcMethod('DocumentService', 'GetLgspAgencies')
  async getLgspAgencies(@Payload() data: { limit?: number; offset?: number }) {
    try {
      const result = await this.lgspService.getAgenciesList({
        limit: data?.limit,
        offset: data?.offset,
      });
      return {
        success: true,
        data: JSON.stringify(result?.data || result || []),
        message: result?.ErrorDesc || 'Thành công',
      };
    } catch (err: any) {
      return {
        success: false,
        data: '[]',
        message: err?.message || 'Lỗi lấy danh sách đơn vị liên thông LGSP',
      };
    }
  }

  @GrpcMethod('DocumentService', 'GetLgspSentStatus')
  async getLgspSentStatus(@Payload() data: { documentId: string; lgspDocId?: string }) {
    try {
      const result = await this.lgspService.getDocumentSentStatus(
        data.documentId,
        data.lgspDocId,
      );
      return {
        success: true,
        data: JSON.stringify(result?.Data || result?.data || result || []),
        message: result?.ErrorDesc || 'Thành công',
      };
    } catch (err: any) {
      return {
        success: false,
        data: '[]',
        message: err?.message || 'Lỗi tra cứu trạng thái gửi văn bản LGSP',
      };
    }
  }

  @GrpcMethod('DocumentService', 'GetLgspConfig')
  async getLgspConfig() {
    return this.lgspService.getConfig();
  }

  @GrpcMethod('DocumentService', 'UpdateLgspConfig')
  async updateLgspConfig(@Payload() data: any) {
    return this.lgspService.updateConfig(data);
  }

  @GrpcMethod('DocumentService', 'TestLgspConnection')
  async testLgspConnection() {
    try {
      return await this.lgspService.testConnection();
    } catch (err: any) {
      return {
        success: false,
        message: err?.message || 'Lỗi kiểm tra kết nối LGSP',
        ssoLatencyMs: 0,
        gatewayLatencyMs: 0,
        ssoStatus: 'Lỗi',
        gatewayStatus: 'Lỗi',
        isVpnReachable: false,
      };
    }
  }
}
