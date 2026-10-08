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
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';

@ApiTags('AI')
@Controller('admin/ai')
export class AiGatewayController implements OnModuleInit {
  private readonly logger = new Logger(AiGatewayController.name);
  private aiService: any;

  constructor(@Inject(MICROSERVICES.AI.SYMBOL) private readonly client: any) {}

  onModuleInit() {
    this.aiService = this.client.getService('AiService');
  }

  @Post('generate')
  @UseGuards(JwtAuthGuard)
  async generateText(@Req() req: any, @Body() body: { prompt: string }) {
    try {
      const response = (await firstValueFrom(
        this.aiService.GenerateText({
          prompt: body.prompt,
          userId: req.user?.id || 0,
        }),
      )) as any;
      return JSON.parse(response.result);
    } catch (e: any) {
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
      const response = (await firstValueFrom(
        this.aiService.ExecuteAiFeature({
          action: body.action,
          payload: body.payload ? JSON.stringify(body.payload) : '{}',
          userId: req.user?.id || 0,
          headers: req.headers ? JSON.stringify(req.headers) : '{}',
          userPayload: req.user ? JSON.stringify(req.user) : '{}',
        }),
      )) as any;
      return JSON.parse(response.result);
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Get('jobs/:jobId')
  @UseGuards(JwtAuthGuard)
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const response = (await firstValueFrom(
        this.aiService.GetJobStatus({ jobId }),
      )) as any;
      return JSON.parse(response.status);
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }

  @Post('models')
  // Depending on whether it needs JWT auth. Usually yes in admin.
  // @UseGuards(JwtAuthGuard)
  async listModels(@Body() body: { provider: string; apiKey: string }) {
    if (!body.provider || !body.apiKey) {
      return { status: 'error', message: 'Provider and apiKey are required' };
    }

    try {
      const response = (await firstValueFrom(
        this.aiService.ListModels({
          provider: body.provider,
          apiKey: body.apiKey,
        }),
      )) as any;
      return { data: response.data || [] };
    } catch (e: any) {
      throw new InternalServerErrorException(e.message || 'RPC Call Failed');
    }
  }
}
