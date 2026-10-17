import { Test, TestingModule } from '@nestjs/testing';
import axios from 'axios';
import { LgspService } from './lgsp.service';
import { LgspConfigService } from './lgsp.config';
import { LgspTokenService } from './lgsp-token.service';
import { PrismaService } from '../../database/prisma.service';
import { LGSP_SYSTEM_CODE } from './lgsp.constants';
import { buildEdxml, parseEdxml } from './edxml.util';

describe('LGSP Interoperability Module', () => {
  let lgspService: LgspService;
  let configService: LgspConfigService;
  let tokenService: LgspTokenService;
  let prisma: PrismaService;

  const mockPrismaService = {
    document: {
      findUnique: jest.fn(),
      findFirst: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
    documentLog: {
      create: jest.fn(),
      findFirst: jest.fn(),
    },
  };

  beforeEach(async () => {
    // Fail-fast: LGSP keys bắt buộc từ env (không còn fallback hardcode)
    process.env.LGSP_CLIENT_ID = 'env_client_id';
    process.env.LGSP_CLIENT_SECRET = 'env_client_secret';
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LgspService,
        LgspConfigService,
        LgspTokenService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    lgspService = module.get<LgspService>(LgspService);
    configService = module.get<LgspConfigService>(LgspConfigService);
    tokenService = module.get<LgspTokenService>(LgspTokenService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
    tokenService.clearTokenCache();
  });

  describe('LgspConfigService', () => {
    it('phải nạp clientId/clientSecret từ environment', () => {
      expect(configService.clientId).toBe('env_client_id');
      expect(configService.clientSecret).toBe('env_client_secret');
      expect(configService.isConfigured()).toBe(true);

      const updated = configService.updateConfig({
        clientId: 'new_client_id_override',
        clientSecret: 'new_secret_key_override',
      });

      expect(configService.clientId).toBe('new_client_id_override');
      expect(configService.clientSecret).toBe('new_secret_key_override');
      expect(updated.isConfigured).toBe(true);
    });

    it('phải fail-fast khi thiếu LGSP_CLIENT_ID/LGSP_CLIENT_SECRET', () => {
      delete process.env.LGSP_CLIENT_ID;
      delete process.env.LGSP_CLIENT_SECRET;
      expect(() => new LgspConfigService()).toThrow(
       /LGSP_CLIENT_ID and LGSP_CLIENT_SECRET/,
      );
    });
  });

  describe('edxml.util', () => {
    it('phải đóng gói edxml hợp chuẩn cho văn bản', () => {
      const xml = buildEdxml(
        {
          documentNumber: '123/QĐ-UBND',
          notation: 'QĐ-UBND',
          abstract: 'Quyết định phê duyệt kế hoạch',
          content: 'Nội dung chi tiết quyết định',
          issuerName: 'UBND Tỉnh Đắk Lắk',
          signerName: 'Nguyễn Văn A',
          signerPosition: 'Chủ tịch',
        },
        {
          senderCode: '0400101394-CTDL-012',
          receiverCode: '000.00.00.G11',
          requestId: 'REQ-TEST-001',
        },
      );

      expect(xml).toContain('<edxml:MessageId>REQ-TEST-001</edxml:MessageId>');
      expect(xml).toContain('<edxml:OrganId>0400101394-CTDL-012</edxml:OrganId>');
      expect(xml).toContain('<edxml:OrganId>000.00.00.G11</edxml:OrganId>');
      expect(xml).toContain('<edxml:CodeNumber>123/QĐ-UBND</edxml:CodeNumber>');
      expect(xml).toContain('<edxml:Subject>Quyết định phê duyệt kế hoạch</edxml:Subject>');
    });

    it('phải trích xuất và giải mã edxml từ chuỗi xml hoặc Base64', () => {
      const sampleXml = `<?xml version="1.0" encoding="UTF-8"?>
<edxml:Edoc>
  <edxml:Body>
    <edxml:DocumentInfo>
      <edxml:CodeNumber>456/CV-STC</edxml:CodeNumber>
      <edxml:CodeNotation>CV-STC</edxml:CodeNotation>
      <edxml:Subject>Công văn lấy ý kiến</edxml:Subject>
      <edxml:SignerName>Trần Thị B</edxml:SignerName>
    </edxml:DocumentInfo>
  </edxml:Body>
</edxml:Edoc>`;

      const base64Str = Buffer.from(sampleXml).toString('base64');
      const parsed = parseEdxml(base64Str);

      expect(parsed.documentNumber).toBe('456/CV-STC');
      expect(parsed.notation).toBe('CV-STC');
      expect(parsed.abstract).toBe('Công văn lấy ý kiến');
      expect(parsed.signerName).toBe('Trần Thị B');
    });
  });

  describe('LgspService APIs', () => {
    beforeEach(() => {
      configService.updateConfig({
        clientId: 'test_client_id',
        clientSecret: 'test_client_secret',
        username: 'test_user',
        password: 'test_pass',
      });
      jest.spyOn(tokenService, 'getAccessToken').mockResolvedValue('mock_bearer_token');
    });

    it('4.1.1 getAgenciesList: phải gửi đúng SystemCode và token', async () => {
      const mockPost = jest.spyOn(axios, 'post').mockResolvedValue({
        status: 200,
        data: {
          status: 'success',
          ErrorCode: '0',
          data: [{ code: '000.00.00.G11', name: 'Văn phòng UBND Tỉnh' }],
        },
      } as any);

      const result = await lgspService.getAgenciesList({ limit: 10, offset: 0 });
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('getAgenciesList?limit=10&offset=0'),
        null,
        expect.objectContaining({
          headers: expect.objectContaining({
            SystemCode: '0400101394-CTDL-012',
            Authorization: 'Bearer mock_bearer_token',
          }),
        }),
      );
      expect(result.data).toHaveLength(1);
    });

    it('4.1.2 sendEdoc: phải gửi octet-stream với SystemCode và X-lgsp-requestId', async () => {
      const mockPost = jest.spyOn(axios, 'post').mockResolvedValue({
        status: 200,
        data: {
          status: 'success',
          ErrorCode: '0',
          DocId: 'LGSP_DOC_9999',
        },
      } as any);

      const dummyBuffer = Buffer.from('<xml>test</xml>', 'utf-8');
      const res = await lgspService.sendEdoc({
        edxmlBuffer: dummyBuffer,
        requestId: 'REQ-12345',
        messageType: 'edoc',
      });

      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/guivb/1.0.0/sendEdoc'),
        dummyBuffer,
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/octet-stream',
            SystemCode: '0400101394-CTDL-012',
            'X-lgsp-requestId': 'REQ-12345',
            servicetype: 'eDoc',
            messagetype: 'edoc',
          }),
        }),
      );
      expect(res.DocId).toBe('LGSP_DOC_9999');
    });

    it('4.1.6 updateStatus: cập nhật trạng thái done gói tin', async () => {
      const mockPost = jest.spyOn(axios, 'post').mockResolvedValue({
        status: 200,
        data: { status: 'success', ErrorCode: '0' },
      } as any);

      const res = await lgspService.updateStatus('LGSP_DOC_111', 'done');
      expect(mockPost).toHaveBeenCalledWith(
        expect.stringContaining('/guivb/1.0.0/updateStatus'),
        null,
        expect.objectContaining({
          headers: expect.objectContaining({
            SystemCode: '0400101394-CTDL-012',
            docid: 'LGSP_DOC_111',
            status: 'done',
          }),
        }),
      );
      expect(res.status).toBe('success');
    });

    it('syncIncomingEdocs: đồng bộ văn bản đến, lưu DB và báo updateStatus done', async () => {
      jest.spyOn(lgspService, 'getReceivedEdocList').mockResolvedValue({
        status: 'success',
        data: [{ docId: 'DOC_INCOMING_001', from: '000.00.00.G11' }],
      });

      const sampleXml = `<edxml:Edoc><edxml:Body><edxml:DocumentInfo><edxml:CodeNumber>99/UBND</edxml:CodeNumber><edxml:Subject>Kế hoạch tháng</edxml:Subject></edxml:DocumentInfo></edxml:Body></edxml:Edoc>`;
      jest.spyOn(lgspService, 'getEdoc').mockResolvedValue({
        status: 'success',
        data: Buffer.from(sampleXml).toString('base64'),
      });

      const updateStatusSpy = jest.spyOn(lgspService, 'updateStatus').mockResolvedValue({
        status: 'success',
      });

      mockPrismaService.document.findFirst.mockResolvedValue(null);
      mockPrismaService.document.create.mockResolvedValue({
        id: 'new_doc_1',
        documentNumber: '99/UBND',
        abstract: 'Kế hoạch tháng',
      });

      const syncResult = await lgspService.syncIncomingEdocs({ id: 'user1' });

      expect(syncResult.success).toBe(true);
      expect(syncResult.syncedCount).toBe(1);
      expect(mockPrismaService.document.create).toHaveBeenCalled();
      expect(updateStatusSpy).toHaveBeenCalledWith('DOC_INCOMING_001', 'done');
      expect(mockPrismaService.documentLog.create).toHaveBeenCalled();
    });

    it('syncIncomingEdocs: xử lý lỗi mạng/timeout một cách an toàn và trả về structured message', async () => {
      jest.spyOn(lgspService, 'getReceivedEdocList').mockRejectedValue(
        new Error('Thời gian kết nối tới máy chủ LGSP quá hạn (10s)'),
      );

      const result = await lgspService.syncIncomingEdocs({ id: 'user1' });

      expect(result.success).toBe(false);
      expect(result.syncedCount).toBe(0);
      expect(result.documents).toHaveLength(0);
      expect(result.message).toContain('Đồng bộ LGSP không thành công');
    });

    it('testConnection: probe kết nối SSO và Gateway thành công', async () => {
      const mockPost = jest.spyOn(axios, 'post').mockResolvedValue({
        status: 200,
        data: {},
      } as any);

      const res = await lgspService.testConnection();

      expect(res.success).toBe(true);
      expect(res.isVpnReachable).toBe(true);
      expect(mockPost).toHaveBeenCalledTimes(2);
      expect(res.message).toContain('Kết nối thành công tới toàn bộ hạ tầng LGSP Đắk Lắk');
    });

    it('testConnection: nhận diện và cảnh báo khi hạ tầng VPN Đắk Lắk bị timeout', async () => {
      jest.spyOn(axios, 'post').mockRejectedValue({
        code: 'ECONNABORTED',
        name: 'TimeoutError',
        message: 'The operation was aborted due to timeout',
      });

      const res = await lgspService.testConnection();

      expect(res.success).toBe(false);
      expect(res.isVpnReachable).toBe(false);
      expect(res.ssoStatus).toContain('Timeout');
      expect(res.gatewayStatus).toContain('Timeout');
      expect(res.message).toContain('yêu cầu kết nối Mạng chuyên dùng / VPN Tỉnh Đắk Lắk');
    });
  });
});
