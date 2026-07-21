import { Injectable, Inject, OnModuleInit, Logger, BadRequestException, NotFoundException, InternalServerErrorException } from '@nestjs/common';
import { type ClientGrpc, ClientProxy } from '@nestjs/microservices';
import { firstValueFrom, Observable, interval, from } from 'rxjs';
import { switchMap, map, distinctUntilChanged, takeWhile, filter } from 'rxjs/operators';
import { MICROSERVICES } from '../../core/constants/services';
import { RedisService } from '../../core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';

interface TranslationService {
  translateSync(data: {
    text: string;
    target_lang: string;
  }): Promise<{ translated_text: string }>;
}

@Injectable()
export class TranslateService implements OnModuleInit {
  private translateGrpcService: TranslationService;
  private readonly logger = new Logger(TranslateService.name);

  constructor(
    @Inject(MICROSERVICES.TRANSLATE.SYMBOL) private client: ClientGrpc,
    private readonly redisService: RedisService,
    @Inject('TRANSLATE_QUEUE_SERVICE') private readonly rmqClient: ClientProxy,
  ) {}

  onModuleInit() {
    this.translateGrpcService = this.client.getService<TranslationService>(
      MICROSERVICES.TRANSLATE.SERVICE,
    );
  }

  async translate(text: string, targetLang: string) {
    if (!text || !targetLang) {
      throw new BadRequestException('Missing text or targetLang');
    }

    try {
      const jobId = uuidv4();

      await this.redisService.set(
        `translate_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600,
      );

      this.rmqClient.emit('translate_task', {
        jobId,
        text,
        targetLang,
      });

      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      this.logger.error('Error queuing translation task', err);
      throw new InternalServerErrorException('Không thể tạo tác vụ dịch thuật');
    }
  }

  streamJobStatus(jobId: string): Observable<{ data: any }> {
    return interval(1500).pipe(
      switchMap(() => from(this.redisService.get(`translate_job_${jobId}`))),
      map((jobData) => {
        if (!jobData) return null;
        return JSON.parse(jobData);
      }),
      filter((job) => job !== null),
      distinctUntilChanged((prev, curr) => JSON.stringify(prev) === JSON.stringify(curr)),
      takeWhile((job) => job.status !== 'COMPLETED' && job.status !== 'FAILED', true),
      map((job) => ({ data: job }))
    );
  }

  async getJobStatus(jobId: string) {
    try {
      const jobData = await this.redisService.get(`translate_job_${jobId}`);
      if (!jobData) {
        throw new NotFoundException('Không tìm thấy tác vụ (hoặc đã hết hạn)');
      }
      return { success: true, data: JSON.parse(jobData) };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err.message);
    }
  }



  async handleTranslateTask(data: {
    jobId: string;
    text: string;
    targetLang: string;
  }) {
    this.logger.log(`Worker received translation task: ${data.jobId}`);
    try {
      const result = await firstValueFrom(
        this.translateGrpcService.translateSync({
          text: data.text,
          target_lang: data.targetLang,
        }) as any,
      ) as { translated_text: string };

      await this.redisService.set(
        `translate_job_${data.jobId}`,
        JSON.stringify({
          status: 'COMPLETED',
          result: { translated_text: result.translated_text },
        }),
        3600,
      );

      this.logger.log(`Worker completed translation task: ${data.jobId}`);
    } catch (err: any) {
      this.logger.error(`Worker failed translation task: ${data.jobId}`, err);
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
