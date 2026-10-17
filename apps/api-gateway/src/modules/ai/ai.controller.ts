import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Logger,
  Req,
  Inject,
  OnModuleInit,
  InternalServerErrorException,
  BadRequestException,
  UseGuards,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { Metadata } from '@grpc/grpc-js';
import { randomUUID } from 'crypto';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { TokenIssuerService } from '../../core/auth/token-issuer.service';
import { clientIp } from '../../core/client-ip';
import { executeGrpcCall } from '../../core/utils/grpc-call.util';

@ApiTags('AI')
@Controller('admin/ai')
export class AiGatewayController implements OnModuleInit {
  private readonly logger = new Logger(AiGatewayController.name);
  private aiService: any;

  constructor(
    @Inject(MICROSERVICES.AI.SYMBOL) private readonly client: any,
    private readonly issuer: TokenIssuerService,
  ) {}

  onModuleInit() {
    this.aiService = this.client.getService('AiService');
  }

  private checkSecurityLevel(payload?: any, prompt?: string) {
    const isConfidential =
      payload?.isConfidential === true ||
      ['MAT', 'TOI_MAT', 'TUYET_MAT'].includes(payload?.securityLevel) ||
      /mật|tối mật|tuyệt mật/i.test(payload?.securityLevel || '') ||
      (prompt &&
        /mật|tối mật|tuyệt mật|chính trị nội bộ|bảo vệ chính trị|hồ sơ 2c/i.test(
          prompt,
        ));

    if (isConfidential) {
      throw new BadRequestException(
        'Nhiệm vụ hoặc nội dung thuộc danh mục Bí mật Nhà nước theo quy định (NĐ 63/2026/NĐ-CP & QĐ 348-QĐ/BTCTW). Tính năng AI hỗ trợ bị khóa để đảm bảo an toàn thông tin.',
      );
    }
  }

  private getGrpcMetadata(req?: any): Metadata {
    const meta = new Metadata();
    if (req?.user) {
      if (req.user.id) {
        meta.add('user-id', String(req.user.id));
      }
      meta.set(
        'authorization',
        'Bearer ' +
          this.issuer.signDelegation(req.user, {
            requestId: randomUUID(),
            ipAddress: clientIp(req),
          }),
      );
    }
    return meta;
  }

  private safeParseJson(data: any): any {
    if (!data) return null;
    if (typeof data !== 'string') return data;
    try {
      return JSON.parse(data);
    } catch {
      return { result: data };
    }
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateText(@Req() req: any, @Body() body: { prompt: string }) {
    this.checkSecurityLevel(null, body.prompt);
    try {
      const response = (await executeGrpcCall(
        this.aiService.GenerateText(
          {
            prompt: body.prompt,
            userId: req.user?.id || 0,
          },
          this.getGrpcMetadata(req),
        ),
        10000,
        'AI GenerateText',
      )) as any;
      return this.safeParseJson(response.result);
    } catch (e: any) {
      this.logger.error(`GenerateText failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post('execute')
  @UseGuards(JwtAuthGuard)
  async executeAiFeature(
    @Req() req: any,
    @Body() body: { action: string; payload: any },
  ) {
    this.checkSecurityLevel(body.payload);
    try {
      const response = (await executeGrpcCall(
        this.aiService.ExecuteAiFeature(
          {
            action: body.action,
            payload: body.payload ? JSON.stringify(body.payload) : '{}',
            userId: req.user?.id || 0,
            headers: req.headers ? JSON.stringify(req.headers) : '{}',
            userPayload: req.user ? JSON.stringify(req.user) : '{}',
          },
          this.getGrpcMetadata(req),
        ),
        15000,
        'AI ExecuteFeature',
      )) as any;
      return this.safeParseJson(response.result);
    } catch (e: any) {
      this.logger.error(`ExecuteAiFeature failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post('rewrite')
  @UseGuards(JwtAuthGuard)
  async rewriteText(
    @Req() req: any,
    @Body() body: { text: string; tone?: string },
  ) {
    if (!body.text?.trim()) {
      return { text: '' };
    }
    this.checkSecurityLevel(null, body.text);
    const tone = body.tone || 'professional';
    const prompt = `Bạn là trợ lý biên tập văn bản hành chính công vụ của Ban Tổ chức Tỉnh ủy. Hãy viết lại đoạn văn bản sau theo giọng điệu ${tone}, chuẩn mực, súc tích, mạch lạc và không thay đổi ý nghĩa gốc:\n\n"${body.text}"\n\nChỉ trả về nội dung đã viết lại, không thêm bất kỳ lời chào, ghi chú hay markdown fence.`;

    try {
      const response = (await executeGrpcCall(
        this.aiService.GenerateText(
          {
            prompt,
            userId: req.user?.id || 0,
          },
          this.getGrpcMetadata(req),
        ),
        12000,
        'AI Rewrite',
      )) as any;
      const parsed = this.safeParseJson(response.result);
      const resultText =
        typeof parsed === 'string'
          ? parsed
          : parsed?.result || parsed?.text || body.text;
      return { text: resultText };
    } catch (e: any) {
      this.logger.warn(`AI Rewrite fallback triggered: ${e.message}`);
      return {
        text: `[Hiệu đính]: ${body.text.trim()}`,
        _isFallback: true,
      };
    }
  }

  @Post('translate')
  @UseGuards(JwtAuthGuard)
  async translateText(
    @Req() req: any,
    @Body() body: { text: string; targetLanguage: string },
  ) {
    if (!body.text?.trim()) {
      return { translatedText: '' };
    }
    this.checkSecurityLevel(null, body.text);
    const lang = body.targetLanguage || 'English';
    const prompt = `Bạn là trợ lý dịch thuật công vụ. Hãy dịch chính xác đoạn văn bản sau sang ngôn ngữ ${lang}:\n\n"${body.text}"\n\nChỉ trả về bản dịch, không giải thích hay thêm định dạng markdown.`;

    try {
      const response = (await executeGrpcCall(
        this.aiService.GenerateText(
          {
            prompt,
            userId: req.user?.id || 0,
          },
          this.getGrpcMetadata(req),
        ),
        12000,
        'AI Translate',
      )) as any;
      const parsed = this.safeParseJson(response.result);
      const translatedText =
        typeof parsed === 'string'
          ? parsed
          : parsed?.result || parsed?.translatedText || body.text;
      return { translatedText };
    } catch (e: any) {
      this.logger.warn(`AI Translate fallback triggered: ${e.message}`);
      return {
        translatedText: `[Bản dịch (${lang})]: ${body.text.trim()}`,
        _isFallback: true,
      };
    }
  }

  @Post('summarize')
  @UseGuards(JwtAuthGuard)
  async summarizeText(
    @Req() req: any,
    @Body() body: { text: string; maxSentences?: number },
  ) {
    if (!body.text?.trim()) {
      return { summary: '' };
    }
    this.checkSecurityLevel(null, body.text);
    const maxSentences = body.maxSentences || 3;
    const prompt = `Bạn là trợ lý tóm lược văn kiện công vụ. Hãy tóm tắt văn bản sau thành tối đa ${maxSentences} câu trọng tâm nhất:\n\n"${body.text}"\n\nChỉ trả về các câu tóm tắt ngắn gọn.`;

    try {
      const response = (await executeGrpcCall(
        this.aiService.GenerateText(
          {
            prompt,
            userId: req.user?.id || 0,
          },
          this.getGrpcMetadata(req),
        ),
        12000,
        'AI Summarize',
      )) as any;
      const parsed = this.safeParseJson(response.result);
      const summary =
        typeof parsed === 'string'
          ? parsed
          : parsed?.result || parsed?.summary || body.text;
      return { summary };
    } catch (e: any) {
      this.logger.warn(`AI Summarize fallback triggered: ${e.message}`);
      const cleanText = body.text.replace(/<[^>]*>/g, '');
      const sentences = cleanText
        .split(/[.!?]+/)
        .filter((s) => s.trim().length > 0);
      const summary = sentences.slice(0, maxSentences).join('. ') + '.';
      return {
        summary: summary || body.text.slice(0, 200),
        _isFallback: true,
      };
    }
  }

  @Post('seo-generate')
  @UseGuards(JwtAuthGuard)
  async generateSeo(
    @Req() req: any,
    @Body() body: { pageTitle: string; content: string },
  ) {
    const pageTitle = body.pageTitle || 'Trang thông tin';
    const content = body.content || '';
    this.checkSecurityLevel(null, `${pageTitle} ${content}`);
    const prompt = `Dựa trên tiêu đề trang "${pageTitle}" và nội dung sau:\n"${content.slice(
      0,
      1000,
    )}"\n\nHãy tạo metadata SEO dạng JSON: {"title": "Tiêu đề SEO", "description": "Mô tả SEO", "keywords": "từ khóa 1, từ khóa 2"}. Chỉ trả về JSON không bọc markdown fence.`;

    try {
      const response = (await executeGrpcCall(
        this.aiService.GenerateText(
          {
            prompt,
            userId: req.user?.id || 0,
          },
          this.getGrpcMetadata(req),
        ),
        12000,
        'AI SEO Generate',
      )) as any;
      let seo = this.safeParseJson(response.result);
      if (typeof seo === 'string') {
        try {
          const cleanJson = seo
            .replace(/```json/g, '')
            .replace(/```/g, '')
            .trim();
          seo = JSON.parse(cleanJson);
        } catch {
          seo = null;
        }
      }
      if (!seo?.title) {
        seo = {
          title: `${pageTitle} - Ban Tổ chức Tỉnh ủy Đắk Lắk`,
          description: content.slice(0, 150).replace(/<[^>]*>/g, ''),
          keywords: `${pageTitle}, ban to chuc tinh uy, dak lak, cong tac can bo`,
        };
      }
      return { seo };
    } catch (e: any) {
      this.logger.warn(`AI SEO fallback triggered: ${e.message}`);
      return {
        seo: {
          title: `${pageTitle} - Ban Tổ chức Tỉnh ủy Đắk Lắk`,
          description: content.slice(0, 150).replace(/<[^>]*>/g, ''),
          keywords: `${pageTitle}, ban to chuc tinh uy, dak lak, cong tac can bo`,
        },
        _isFallback: true,
      };
    }
  }

  @Get('jobs/:jobId')
  @UseGuards(JwtAuthGuard)
  async getJobStatus(@Req() req: any, @Param('jobId') jobId: string) {
    try {
      const response = (await executeGrpcCall(
        this.aiService.GetJobStatus(
          { jobId },
          this.getGrpcMetadata(req),
        ),
        5000,
        'AI GetJobStatus',
      )) as any;
      return this.safeParseJson(response.status);
    } catch (e: any) {
      this.logger.error(`GetJobStatus failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post('models')
  @UseGuards(JwtAuthGuard)
  async listModels(@Req() req: any, @Body() body: { provider: string; apiKey: string }) {
    if (!body.provider || !body.apiKey) {
      return { status: 'error', message: 'Provider and apiKey are required' };
    }

    try {
      const response = (await executeGrpcCall(
        this.aiService.ListModels(
          {
            provider: body.provider,
            apiKey: body.apiKey,
          },
          this.getGrpcMetadata(req),
        ),
        8000,
        'AI ListModels',
      )) as any;
      return response.data || [];
    } catch (e: any) {
      this.logger.error(`ListModels failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }
}
