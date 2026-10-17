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
  async listModels(data: { provider: string; api_key?: string; apiKey?: string }) {
    try {
      const apiKey = data.api_key || data.apiKey || '';
      const models = await this.aiService.listModels(
        data.provider,
        apiKey,
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
    maskingMap?: Record<string, string>;
    fallbackAction?: string;
    fallbackPayload?: any;
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

      // CỬA ẢI GIẢI MÃ ĐỊNH DANH (DE-MASKING): Phục hồi họ tên cán bộ thật từ mã token an danh
      if (data.maskingMap && Object.keys(data.maskingMap).length > 0) {
        parsedResult = this.deMaskResult(parsedResult, data.maskingMap);
      }

      // GẮN NHÃN BẢN NHÁP (HUMAN-IN-THE-LOOP):
      // Đảm bảo AI chỉ đề xuất bản nháp để người có thẩm quyền phê duyệt
      if (typeof parsedResult === 'object' && parsedResult !== null) {
        if (!Array.isArray(parsedResult)) {
          (parsedResult as any).isDraft = true;
          (parsedResult as any).requiresHumanReview = true;
        }
      }

      await this.aiFeatureService.setJobCompleted(data.jobId, parsedResult);
      this.logger.log(`Worker completed AI task: ${data.jobId}`);
    } catch (err: any) {
      this.logger.warn(
        `Worker AI call failed for task ${data.jobId}: ${err.message}. Kiểm tra giải thuật dự phòng...`,
      );

      // MÔ HÌNH DỰ PHÒNG 2 LỚP (RULE-BASED FALLBACK):
      if (data.fallbackAction) {
        try {
          const fallbackData = this.aiFeatureService.generateFallback(
            data.fallbackAction,
            data.fallbackPayload,
          );
          const fallbackResult = {
            ...(typeof fallbackData === 'object' && !Array.isArray(fallbackData)
              ? fallbackData
              : { data: fallbackData }),
            isDraft: true,
            isFallback: true,
            fallbackNotice:
              'Kết quả được xử lý tự động bởi Giải thuật Quy tắc Dự phòng (Rule-based Fallback) do dịch vụ AI bận.',
          };
          await this.aiFeatureService.setJobCompleted(data.jobId, fallbackResult);
          this.logger.log(`Worker served fallback for AI task: ${data.jobId}`);
          return;
        } catch (fallbackErr: any) {
          this.logger.error(`Fallback failed: ${fallbackErr.message}`);
        }
      }

      this.logger.error(`Worker failed AI task: ${data.jobId}`, err);
      await this.aiFeatureService.setJobFailed(data.jobId, err.message);
    }
  }

  private deMaskResult(result: any, maskingMap: Record<string, string>): any {
    if (!result || !maskingMap) return result;
    if (typeof result === 'string') {
      let text = result;
      for (const [token, realVal] of Object.entries(maskingMap)) {
        text = text.split(token).join(realVal);
      }
      return text;
    }
    if (Array.isArray(result)) {
      return result.map((item) => this.deMaskResult(item, maskingMap));
    }
    if (typeof result === 'object' && result !== null) {
      const updated: any = {};
      for (const [key, val] of Object.entries(result)) {
        updated[key] = this.deMaskResult(val, maskingMap);
      }
      return updated;
    }
    return result;
  }
}
