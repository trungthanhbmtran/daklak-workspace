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
      return { data: response.data || [] };
    } catch (e: any) {
      this.logger.error(`ListModels failed: ${e.message}`);
      if (e.status) throw e;
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }
}
