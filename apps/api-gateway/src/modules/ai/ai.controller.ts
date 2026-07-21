import {
  Controller,
  Post,
  Body,
  Get,
  Param,
  Logger,
  Req,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { AiFeatureService } from './ai-feature.service';
import { EventPattern } from '@nestjs/microservices';

@ApiTags('AI Service')
@Controller('admin/ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly aiFeatureService: AiFeatureService,
  ) {}

  @Post('generate')
  async generateText(@Body() body: { prompt: string }) {
    return this.aiFeatureService.generateText(body.prompt);
  }

  @Post('execute')
  async executeAiFeature(
    @Req() req: any,
    @Body() body: { action: string; payload: any },
  ) {
    return this.aiFeatureService.executeAiFeature(
      body.action,
      body.payload,
      req.user,
      req.headers,
    );
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    return this.aiFeatureService.getJobStatus(jobId);
  }

  @EventPattern('ai_generate_task')
  async handleAiGenerateTask(data: { jobId: string; prompt: string }) {
    this.logger.log(`Worker received AI task: ${data.jobId}`);
    try {
      const resultStr = await this.aiService.generateText(data.prompt);

      let parsedResult = resultStr;
      if (typeof resultStr === 'string') {
        try {
          let jsonStr = resultStr;
          if (jsonStr.startsWith('```json')) {
            jsonStr = jsonStr
              .replace(/```json/g, '')
              .replace(/```/g, '')
              .trim();
          } else if (jsonStr.startsWith('```')) {
            jsonStr = jsonStr.replace(/```/g, '').trim();
          }
          parsedResult = JSON.parse(jsonStr);
        } catch (e: any) {
          this.logger.warn(
            `Worker could not parse JSON from AI result: ${e.message}`,
          );
        }
      }

      await this.aiFeatureService.setJobCompleted(data.jobId, parsedResult);
      this.logger.log(`Worker completed AI task: ${data.jobId}`);
    } catch (err: any) {
      this.logger.error(`Worker failed AI task: ${data.jobId}`, err);
      await this.aiFeatureService.setJobFailed(data.jobId, err.message);
    }
  }

  @Post('models')
  async listModels(@Body() body: { provider: string; apiKey: string }) {
    if (!body.provider || !body.apiKey) {
      return { status: 'error', message: 'Provider and apiKey are required' };
    }

    try {
      const models = await this.aiService.listModels(
        body.provider,
        body.apiKey,
      );
      return { success: true, data: models };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }
}
