import { Controller, Logger } from '@nestjs/common';
import { AiService } from './ai.service';
import { AiFeatureService } from './ai-feature.service';
import { EventPattern, GrpcMethod } from '@nestjs/microservices';

@Controller()
export class AiController {
  private readonly logger = new Logger(AiController.name);

  constructor(
    private readonly aiService: AiService,
    private readonly aiFeatureService: AiFeatureService,
  ) {}

  @GrpcMethod('AiService', 'GenerateText')
  async generateText(data: { prompt: string; user_id?: number }) {
    const result = await this.aiFeatureService.generateText(
      data.prompt,
      data.user_id,
    );
    // aiFeatureService returns a job object like { jobId, status } or just throws.
    // Wait, let's look at what generateText returns. It usually returns JSON.
    return { result: JSON.stringify(result) };
  }

  @GrpcMethod('AiService', 'ExecuteAiFeature')
  async executeAiFeature(data: {
    action: string;
    payload: string;
    user_id?: number;
    headers?: string;
    user_payload?: string;
  }) {
    const payloadParsed = data.payload ? JSON.parse(data.payload) : {};
    const userParsed = data.user_payload
      ? JSON.parse(data.user_payload)
      : { id: data.user_id };
    const headersParsed = data.headers ? JSON.parse(data.headers) : {};

    const result = await this.aiFeatureService.executeAiFeature(
      data.action,
      payloadParsed,
      userParsed,
      headersParsed,
    );
    return { result: JSON.stringify(result) };
  }

  @GrpcMethod('AiService', 'GetJobStatus')
  async getJobStatus(data: { job_id: string }) {
    const status = await this.aiFeatureService.getJobStatus(data.job_id);
    return { status: JSON.stringify(status) };
  }

  @GrpcMethod('AiService', 'ListModels')
  async listModels(data: { provider: string; api_key: string }) {
    try {
      const models = await this.aiService.listModels(
        data.provider,
        data.api_key,
      );
      return { success: true, data: models };
    } catch (err: any) {
      throw new Error(err.message);
    }
  }

  @EventPattern('ai_generate_task')
  async handleAiGenerateTask(data: {
    jobId: string;
    prompt: string;
    systemPrompt?: string;
    userId?: number;
  }) {
    this.logger.log(`Worker received AI task: ${data.jobId}`);
    try {
      const resultStr = await this.aiService.generateText(
        data.prompt,
        data.systemPrompt,
        data.userId,
      );

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
}
