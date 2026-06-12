import {
  Controller,
  Post,
  Body,
  Inject,
  OnModuleInit,
  UseGuards,
  Get,
  Param,
  Logger,
} from '@nestjs/common';
import {
  type ClientGrpc,
  ClientProxy,
  EventPattern,
} from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { MICROSERVICES } from '../../core/constants/services';
import { JwtAuthGuard } from '../../core/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../core/guards/permissions.guard';
import { RedisService } from '../../core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

interface TranslationService {
  translateSync(data: {
    text: string;
    target_lang: string;
  }): Promise<{ translated_text: string }>;
}

@Controller('admin/translate')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class TranslateController implements OnModuleInit {
  private translateService: TranslationService;
  private readonly logger = new Logger(TranslateController.name);

  constructor(
    @Inject(MICROSERVICES.TRANSLATE.SYMBOL) private client: ClientGrpc,
    private readonly redisService: RedisService,
    @Inject('TRANSLATE_QUEUE_SERVICE') private readonly rmqClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.translateService = this.client.getService<TranslationService>(
      MICROSERVICES.TRANSLATE.SERVICE,
    );
  }

  @Post()
  async translate(@Body() body: { text: string; targetLang: string }) {
    if (!body.text || !body.targetLang) {
      return {
        success: false,
        data: null,
        message: 'Missing text or targetLang',
      };
    }

    try {
      const jobId = uuidv4();

      // Save initial state to Redis (TTL 1 hour)
      await this.redisService.set(
        `translate_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600,
      );

      // Emit event to RabbitMQ
      this.rmqClient.emit('translate_task', {
        jobId,
        text: body.text,
        targetLang: body.targetLang,
      });

      // Return 202 immediately
      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      this.logger.error('Error queuing translation task', err);
      return {
        success: false,
        data: null,
        message: 'Không thể tạo tác vụ dịch thuật',
      };
    }
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const jobData = await this.redisService.get(`translate_job_${jobId}`);
      if (!jobData) {
        return {
          success: false,
          data: null,
          message: 'Không tìm thấy tác vụ (hoặc đã hết hạn)',
        };
      }
      return { success: true, data: JSON.parse(jobData) };
    } catch (err: any) {
      return { success: false, data: null, message: err.message };
    }
  }

  @EventPattern('translate_task')
  async handleTranslateTask(data: {
    jobId: string;
    text: string;
    targetLang: string;
  }) {
    this.logger.log(`Worker received translation task: ${data.jobId}`);
    try {
      const result = await firstValueFrom(
        this.translateService.translateSync({
          text: data.text,
          target_lang: data.targetLang,
        }) as any,
      );

      // Update state to COMPLETED
      await this.redisService.set(
        `translate_job_${data.jobId}`,
        JSON.stringify({
          status: 'COMPLETED',
          result,
        }),
        3600,
      );

      this.logger.log(`Worker completed translation task: ${data.jobId}`);
    } catch (err: any) {
      this.logger.error(`Worker failed translation task: ${data.jobId}`, err);
      // Update state to FAILED
      await this.redisService.set(
        `translate_job_${data.jobId}`,
        JSON.stringify({
          status: 'FAILED',
          error: err.message,
        }),
        3600,
      );
    }
  }
}

