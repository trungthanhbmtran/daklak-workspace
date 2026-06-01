import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  Param,
  Logger,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ClientProxy, EventPattern } from '@nestjs/microservices';
import { RedisService } from '../../core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

@ApiTags('AI Service')
@Controller('admin/ai')
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly redisService: RedisService,
    @Inject('AI_QUEUE_SERVICE') private readonly rmqClient: ClientProxy,
  ) {}

  @Post('generate')
  async generateText(@Body() body: { prompt: string }) {
    if (!body.prompt) {
      return { success: false, data: null, message: 'Prompt is required' };
    }

    try {
      const jobId = uuidv4();

      // Save initial state to Redis (TTL 1 hour)
      await this.redisService.set(
        `ai_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600,
      );

      // Emit event to RabbitMQ
      this.rmqClient.emit('ai_generate_task', { jobId, prompt: body.prompt });

      // Return 202 immediately
      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      this.logger.error('Error queuing AI task', err);
      return { success: false, data: null, message: 'Không thể tạo tác vụ xử lý AI' };
    }
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const jobData = await this.redisService.get(`ai_job_${jobId}`);
      if (!jobData) {
        return { success: false, data: null, message: 'Không tìm thấy tác vụ (hoặc đã hết hạn)' };
      }
      return { success: true, data: JSON.parse(jobData) };
    } catch (err: any) {
      return { success: false, data: null, message: err.message };
    }
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

      // Update state to COMPLETED
      await this.redisService.set(
        `ai_job_${data.jobId}`,
        JSON.stringify({
          status: 'COMPLETED',
          result: parsedResult,
        }),
        3600,
      );

      this.logger.log(`Worker completed AI task: ${data.jobId}`);
    } catch (err: any) {
      this.logger.error(`Worker failed AI task: ${data.jobId}`, err);
      // Update state to FAILED
      await this.redisService.set(
        `ai_job_${data.jobId}`,
        JSON.stringify({
          status: 'FAILED',
          error: err.message,
        }),
        3600,
      );
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
      return { success: false, data: null, message: err.message };
    }
  }
}
