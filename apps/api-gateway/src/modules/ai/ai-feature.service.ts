import { Injectable, Inject, OnModuleInit, Logger } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { RedisService } from '../../core/redis/redis.service';
import { v4 as uuidv4 } from 'uuid';
import { MICROSERVICES } from '../../core/constants/services';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AiFeatureService implements OnModuleInit {
  private readonly logger = new Logger(AiFeatureService.name);

  private taskService: any;
  private userService: any;
  private sysConfigService: any;
  private masterPlanService: any;

  constructor(
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
    this.sysConfigService = this.sysConfigClient.getService(
      MICROSERVICES.SYS_CONFIG.SERVICE,
    );
    this.masterPlanService = this.masterPlanClient.getService(
      MICROSERVICES.MASTER_PLAN.SERVICE,
    );
  }

  private getGrpcMetadata(user: any, headers?: any) {
    const Metadata = require('@grpc/grpc-js').Metadata;
    const meta = new Metadata();

    if (user) {
      const jwt = require('jsonwebtoken');
      const internalToken = jwt.sign(
        user,
        process.env.JWT_SECRET || 'super-secret',
      );
      meta.add('authorization', `Bearer ${internalToken}`);
    } else if (headers?.authorization) {
      meta.add('authorization', headers.authorization);
    }
    return meta;
  }

  async generateText(prompt: string) {
    if (!prompt) {
      return { success: false, data: null, message: 'Prompt is required' };
    }

    try {
      const jobId = uuidv4();
      await this.redisService.set(
        `ai_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600,
      );
      this.rmqClient.emit('ai_generate_task', { jobId, prompt });
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

  async executeAiFeature(action: string, payload: any, user: any, headers?: any) {
    try {
      const isAdmin = user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

      const sysConfigRes: any = await firstValueFrom(
        this.sysConfigService.GetSystemConfigs({}),
      );
      const configs = sysConfigRes?.configs || [];
      const promptConfig = configs.find((c: any) => c.key === `AI_PROMPT_${action}`);

      const promptTemplate = promptConfig?.value || '';

      if (!promptTemplate) {
        return {
          success: false,
          data: null,
          message: `Chưa cấu hình AI Prompt cho hành động: ${action}`,
        };
      }

      let prompt = promptTemplate;

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
                currentUserDept: user?.unitId
                  ? parseInt(user.unitId, 10)
                  : undefined,
              },
              this.getGrpcMetadata(user, headers),
            ),
          );

          if (!taskResponse) {
            return {
              success: false,
              data: null,
              message: 'Không tìm thấy công việc',
            };
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
            .replace(
              /{parentDescription}/g,
              taskResponse.description || 'Không có',
            )
            .replace(
              /{employeesContext}/g,
              employeesContext || 'Không có dữ liệu nhân sự',
            );
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
          let historyStr = 'Không tìm thấy dữ liệu lịch sử tương tự.';
          try {
            const histRes: any = await firstValueFrom(
              this.masterPlanService.GetHistoricalFeasibility(
                {
                  title: payload.title,
                  type: payload.type,
                  durationDays: payload.durationDays,
                },
                this.getGrpcMetadata(user, headers),
              ),
            );
            if (histRes && histRes.pastPlansCount > 0) {
              historyStr = `Dữ liệu lịch sử: Có ${histRes.pastPlansCount} kế hoạch tương tự.\nTổng số phân việc: ${histRes.totalTasks}, đã hoàn thành: ${histRes.completedTasks}, trễ hạn: ${histRes.overdueTasks}.\nTỷ lệ khả thi trung bình trong quá khứ: ${histRes.feasibilityScore}%.`;
            }
          } catch (e) {
            this.logger.warn('Could not fetch historical feasibility data', e);
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
          return {
            success: false,
            data: null,
            message: `Hành động AI không được hỗ trợ: ${action}`,
          };
      }

      const jobId = uuidv4();
      await this.redisService.set(
        `ai_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600,
      );

      this.rmqClient.emit('ai_generate_task', { jobId, prompt });

      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      this.logger.error(`Error in executeAiFeature for action ${action}`, err);
      return {
        success: false,
        data: null,
        message: 'Không thể khởi tạo tiến trình AI',
      };
    }
  }

  async getJobStatus(jobId: string) {
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

  async setJobCompleted(jobId: string, parsedResult: any) {
    await this.redisService.set(
      `ai_job_${jobId}`,
      JSON.stringify({
        status: 'COMPLETED',
        result: parsedResult,
      }),
      3600,
    );
  }

  async setJobFailed(jobId: string, error: string) {
    await this.redisService.set(
      `ai_job_${jobId}`,
      JSON.stringify({
        status: 'FAILED',
        error,
      }),
      3600,
    );
  }
}
