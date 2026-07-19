import {
  Controller,
  Post,
  Body,
  Get,
  Inject,
  Param,
  Logger,
  Req,
  ParseIntPipe,
  OnModuleInit,
} from '@nestjs/common';
import { ApiTags } from '@nestjs/swagger';
import { AiService } from './ai.service';
import { ClientProxy, EventPattern, RmqContext } from '@nestjs/microservices';
import { RedisService } from '../../core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@ApiTags('AI Service')
@Controller('admin/ai')
export class AiController implements OnModuleInit {
  private readonly logger = new Logger(AiController.name);

  private taskService: any;
  private userService: any;
  private sysConfigService: any;
  private masterPlanService: any;

  constructor(
    private readonly aiService: AiService,
    private readonly redisService: RedisService,
    @Inject('AI_QUEUE_SERVICE') private readonly rmqClient: ClientProxy,
    @Inject(MICROSERVICES.TASK.SYMBOL) private readonly taskClient: any,
    @Inject(MICROSERVICES.USER.SYMBOL) private readonly userClient: any,
    @Inject(MICROSERVICES.SYS_CONFIG.SYMBOL) private readonly sysConfigClient: any,
    @Inject(MICROSERVICES.MASTER_PLAN.SYMBOL) private readonly masterPlanClient: any,
  ) {}

  onModuleInit() {
    this.taskService = this.taskClient.getService(MICROSERVICES.TASK.SERVICE);
    this.userService = this.userClient.getService(MICROSERVICES.USER.SERVICE);
    this.sysConfigService = this.sysConfigClient.getService(MICROSERVICES.SYS_CONFIG.SERVICE);
    this.masterPlanService = this.masterPlanClient.getService(MICROSERVICES.MASTER_PLAN.SERVICE);
  }

  private getGrpcMetadata(req: any) {
    const Metadata = require('@grpc/grpc-js').Metadata;
    const meta = new Metadata();

    if (req?.user) {
      const jwt = require('jsonwebtoken');
      const internalToken = jwt.sign(
        req.user,
        process.env.JWT_SECRET || 'super-secret',
      );
      meta.add('authorization', `Bearer ${internalToken}`);
    } else if (req?.headers?.authorization) {
      meta.add('authorization', req.headers.authorization);
    }
    return meta;
  }

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
      return {
        success: false,
        data: null,
        message: 'Không thể tạo tác vụ xử lý AI',
      };
    }
  }

  @Post('execute')
  async executeAiFeature(
    @Req() req: any,
    @Body() body: { action: string; payload: any },
  ) {
    try {
      const { action, payload } = body;
      const user = req.user;
      const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

      // 1. Fetch System Config for Prompt
      const sysConfigRes: any = await firstValueFrom(
        this.sysConfigService.GetSystemConfigs({}),
      );
      const configs = sysConfigRes?.configs || [];
      const promptConfig = configs.find(
        (c: any) => c.key === `AI_PROMPT_${action}`,
      );

      let promptTemplate = promptConfig?.value || '';

      if (!promptTemplate) {
        return { success: false, data: null, message: `Chưa cấu hình AI Prompt cho hành động: ${action}` };
      }

      let prompt = promptTemplate;

      // 2. Resolve Context based on Action
      switch (action) {
        case 'SUBTASK_ASSIGNMENT': {
          const taskId = payload.taskId;
          const taskResponse: any = await firstValueFrom(
            this.taskService.GetTask(
              {
                id: taskId,
                currentEmployeeCode: user?.employeeCode,
                isAdmin: isAdmin,
                isLeader:
                  isAdmin ||
                  user?.permissionsFlatten?.includes('TASK.ASSIGN') ||
                  user?.permissionsFlatten?.includes('TASK.*'),
                currentUserDept: user?.unitId ? parseInt(user.unitId, 10) : undefined,
              },
              this.getGrpcMetadata(req),
            ),
          );

          if (!taskResponse) {
            return { success: false, data: null, message: 'Không tìm thấy công việc' };
          }

          const usersRes: any = await firstValueFrom(
            this.userService.ListUsers({ take: 500 }),
          );
          const employees = usersRes?.data || [];
          const employeesContext = employees
            .filter((emp: any) => emp.employeeCode)
            .map(
              (emp: any) =>
                `${emp.fullName} (Mã: ${emp.employeeCode}, Chức danh: ${
                  emp.jobTitleName || 'Không có'
                })`,
            )
            .join('\n');

          prompt = promptTemplate
            .replace(/{parentTitle}/g, taskResponse.title || 'Không có')
            .replace(/{parentDescription}/g, taskResponse.description || 'Không có')
            .replace(/{employeesContext}/g, employeesContext || 'Không có dữ liệu nhân sự');
          break;
        }
        case 'MASTER_PLAN_TASKS': {
          prompt = promptTemplate
            .replace(/{framework}/g, payload.framework || '')
            .replace(/{planTitle}/g, payload.planTitle || '')
            .replace(/{planObjective}/g, payload.planObjective || '')
            .replace(/{orgContext}/g, payload.orgContext || '')
            .replace(/{rolesContext}/g, payload.rolesContext || '');
          break;
        }
        case 'PROJECT_TASKS': {
          prompt = promptTemplate
            .replace(/{modelContext}/g, payload.modelContext || '')
            .replace(/{title}/g, payload.title || '')
            .replace(/{objective}/g, payload.objective || '');
          break;
        }
        case 'EVALUATE_FEASIBILITY': {
          let historyStr = "Không tìm thấy dữ liệu lịch sử tương tự.";
          try {
            const histRes: any = await firstValueFrom(
              this.masterPlanService.GetHistoricalFeasibility(
                { title: payload.title, type: payload.type, durationDays: payload.durationDays },
                this.getGrpcMetadata(req)
              )
            );
            if (histRes && histRes.pastPlansCount > 0) {
              historyStr = `Dữ liệu lịch sử: Có ${histRes.pastPlansCount} kế hoạch tương tự.\nTổng số phân việc: ${histRes.totalTasks}, đã hoàn thành: ${histRes.completedTasks}, trễ hạn: ${histRes.overdueTasks}.\nTỷ lệ khả thi trung bình trong quá khứ: ${histRes.feasibilityScore}%.`;
            }
          } catch (e) {
            this.logger.warn("Could not fetch historical feasibility data", e);
          }

          prompt = promptTemplate
            .replace(/{title}/g, payload.title || '')
            .replace(/{objective}/g, payload.objective || '')
            .replace(/{durationDays}/g, String(payload.durationDays || ''))
            .replace(/{orgContext}/g, payload.orgContext || '')
            .replace(/{rolesContext}/g, payload.rolesContext || '')
            .replace(/{historyStr}/g, historyStr);
          break;
        }
        case 'TASK_ASSIGNMENT': {
          prompt = promptTemplate
            .replace(/{instruction}/g, payload.instruction || '')
            .replace(/{employeesContext}/g, payload.employeesContext || '');
          break;
        }
        default:
          return { success: false, data: null, message: `Hành động AI không được hỗ trợ: ${action}` };
      }

      // 5. Emit to RabbitMQ (reuse logic)
      const jobId = uuidv4();
      await this.redisService.set(
        `ai_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600,
      );

      this.rmqClient.emit('ai_generate_task', { jobId, prompt });

      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      this.logger.error(`Error in executeAiFeature for action ${body?.action}`, err);
      return {
        success: false,
        data: null,
        message: 'Không thể khởi tạo tiến trình AI',
      };
    }
  }

  @Get('jobs/:jobId')
  async getJobStatus(@Param('jobId') jobId: string) {
    try {
      const jobData = await this.redisService.get(`ai_job_${jobId}`);
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
