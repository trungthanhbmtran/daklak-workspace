import {
  Injectable,
  Inject,
  OnModuleInit,
  Logger,
  BadRequestException,
  NotFoundException,
  InternalServerErrorException,
} from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { randomUUID } from 'node:crypto';
import { ClientGrpc } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';
import { Metadata } from '@grpc/grpc-js';

@Injectable()
export class AiFeatureService implements OnModuleInit {
  private readonly logger = new Logger(AiFeatureService.name);

  private taskService: any;
  private userService: any;
  private sysConfigService: any;
  private masterPlanService: any;

  constructor(
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @Inject('AI_QUEUE_SERVICE') private readonly rmqClient: ClientProxy,
    @Inject('TASK_SERVICE') private readonly taskClient: any,
    @Inject('USER_SERVICE') private readonly userClient: any,
    @Inject('SYS_CONFIG_SERVICE') private readonly sysConfigClient: any,
    @Inject('MASTER_PLAN_SERVICE') private readonly masterPlanClient: any,
  ) {}

  onModuleInit() {
    this.taskService = this.taskClient?.getService('TaskService');
    this.userService = this.userClient?.getService('UserService');
    this.sysConfigService = this.sysConfigClient?.getService(
      'SystemConfigService',
    );
    this.masterPlanService =
      this.masterPlanClient?.getService('MasterPlanService');
  }

  private getGrpcMetadata(user: any, headers?: any) {
    const meta = new Metadata();

    if (!headers?.authorization)
      throw new Error('Verified Gateway delegation is required');
    meta.set('authorization', headers.authorization);
    return meta;
  }

  private parseAiConfig(value: string) {
    if (!value) return '';
    try {
      const parsed = JSON.parse(value);
      if (typeof parsed === 'object' && parsed !== null) {
        const parts: string[] = [];
        if (parsed.name || parsed.description || parsed.knowledge) {
          parts.push('<SystemContext>');
          if (parsed.name) parts.push(`<Name>\n${parsed.name}\n</Name>`);
          if (parsed.description)
            parts.push(`<Description>\n${parsed.description}\n</Description>`);
          if (parsed.knowledge)
            parts.push(
              `<KnowledgeBase>\n${parsed.knowledge}\n</KnowledgeBase>`,
            );
          parts.push('</SystemContext>');
        }
        if (parsed.instructions) {
          parts.push(`<Instructions>\n${parsed.instructions}\n</Instructions>`);
        }
        return parts.join('\n\n');
      }
    } catch (e) {
      // Fallback for legacy text or XML
      return value;
    }
    return value;
  }

  async generateText(prompt: string, userId?: number) {
    if (!prompt) {
      throw new BadRequestException('Prompt is required');
    }

    try {
      const jobId = randomUUID();
      await this.cacheManager.set(
        `ai_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600000,
      );
      const sysConfigRes: any = await firstValueFrom(
        this.sysConfigService.GetConfigs({}),
      );
      const configs = sysConfigRes?.configs || [];
      const assistantConfig = configs.find(
        (c: any) => c.key === 'AI_PROMPT_SYSTEM_ASSISTANT',
      );
      const systemPrompt = this.parseAiConfig(assistantConfig?.value || '');

      this.rmqClient.emit('ai_generate_task', {
        jobId,
        prompt,
        systemPrompt,
        userId,
      });
      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      this.logger.error('Error queuing AI task', err);
      throw new InternalServerErrorException('Không thể tạo tác vụ xử lý AI');
    }
  }

  async executeAiFeature(
    action: string,
    payload: any,
    user: any,
    headers?: any,
  ) {
    try {
      const isAdmin =
        user?.permissionsFlatten?.includes('TASK:MANAGE') || false;

      const sysConfigRes: any = await firstValueFrom(
        this.sysConfigService.GetConfigs({}),
      );
      const configs = sysConfigRes?.configs || [];
      const assistantConfig = configs.find(
        (c: any) => c.key === 'AI_PROMPT_SYSTEM_ASSISTANT',
      );
      const systemPrompt = this.parseAiConfig(assistantConfig?.value || '');

      const promptConfig = configs.find(
        (c: any) => c.key === `AI_PROMPT_${action}`,
      );

      const promptTemplate = this.parseAiConfig(promptConfig?.value || '');

      if (!promptTemplate) {
        throw new BadRequestException(
          `Chưa cấu hình AI Prompt cho hành động: ${action}`,
        );
      }

      let prompt = promptTemplate;
      let maskingMap: Record<string, string> = {};

      // CỬA ẢI BẢO MẬT: Kiểm tra cấp độ MẬT theo NĐ 63/2026/NĐ-CP & QĐ 348-QĐ/BTCTW
      if (
        payload?.isConfidential === true ||
        ['MAT', 'TOI_MAT', 'TUYET_MAT'].includes(payload?.securityLevel) ||
        /mật|tối mật|tuyệt mật/i.test(payload?.securityLevel || '')
      ) {
        throw new BadRequestException(
          'Nhiệm vụ thuộc danh mục Bí mật Nhà nước theo quy định (NĐ 63/2026/NĐ-CP & QĐ 348-QĐ/BTCTW). Tính năng AI hỗ trợ bị khóa để đảm bảo an toàn thông tin.',
        );
      }

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

          // CỬA ẢI BẢO MẬT: Chặn AI với công việc MẬT
          if (
            taskResponse.isConfidential === true ||
            ['MAT', 'TOI_MAT', 'TUYET_MAT'].includes(taskResponse.securityLevel) ||
            /mật|tối mật|tuyệt mật|chính trị nội bộ|bảo vệ chính trị|hồ sơ 2c/i.test(
              taskResponse.title || '',
            ) ||
            /mật|tối mật|tuyệt mật/i.test(taskResponse.securityLevel || '')
          ) {
            throw new BadRequestException(
              'Nhiệm vụ thuộc danh mục Bí mật Nhà nước theo quy định (NĐ 63/2026/NĐ-CP & QĐ 348-QĐ/BTCTW). Tính năng AI hỗ trợ bị khóa để đảm bảo an toàn thông tin.',
            );
          }

          const usersRes: any = await firstValueFrom(
            this.userService.ListUsers({ take: 500 }),
          );
          const employees = usersRes?.data || [];
          
          // CỬA ẢI KHỬ ĐỊNH DANH (PII SANITIZER): Mã hóa danh tính nhân sự trước khi gửi prompt
          const employeesContext = employees
            .filter((emp: any) => emp.employeeCode)
            .map((emp: any, idx: number) => {
              const token = `[CAN_BO_${idx + 1}]`;
              maskingMap[token] = `${emp.fullName} (Mã: ${emp.employeeCode})`;
              return `${token} (Chức danh: ${emp.jobTitleName || 'Chuyên viên'})`;
            })
            .join('\n');

          const sanitizedTitle = this.sanitizePii(taskResponse.title || 'Không có');
          const sanitizedDesc = this.sanitizePii(taskResponse.description || 'Không có');
          Object.assign(maskingMap, sanitizedTitle.piiMap, sanitizedDesc.piiMap);

          prompt = promptTemplate
            .replace(/{parentTitle}/g, sanitizedTitle.sanitized)
            .replace(/{parentDescription}/g, sanitizedDesc.sanitized)
            .replace(
              /{employeesContext}/g,
              employeesContext || 'Không có dữ liệu nhân sự',
            );
          break;
        }
        case 'MASTER_PLAN_TASKS': {
          const sanitizedPlanTitle = this.sanitizePii(payload.planTitle || '');
          const sanitizedPlanObj = this.sanitizePii(payload.planObjective || '');
          Object.assign(maskingMap, sanitizedPlanTitle.piiMap, sanitizedPlanObj.piiMap);

          prompt = promptTemplate
            .replace(/{framework}/g, payload.framework || '')
            .replace(/{planTitle}/g, sanitizedPlanTitle.sanitized)
            .replace(/{planObjective}/g, sanitizedPlanObj.sanitized)
            .replace(/{orgContext}/g, payload.orgContext || '')
            .replace(/{rolesContext}/g, payload.rolesContext || '');
          break;
        }
        case 'PROJECT_TASKS': {
          const sanitizedTitle = this.sanitizePii(payload.title || '');
          const sanitizedObjective = this.sanitizePii(payload.objective || '');
          Object.assign(maskingMap, sanitizedTitle.piiMap, sanitizedObjective.piiMap);

          prompt = promptTemplate
            .replace(/{modelContext}/g, payload.modelContext || '')
            .replace(/{title}/g, sanitizedTitle.sanitized)
            .replace(/{objective}/g, sanitizedObjective.sanitized);
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

          const sanitizedTitle = this.sanitizePii(payload.title || '');
          const sanitizedObjective = this.sanitizePii(payload.objective || '');
          Object.assign(maskingMap, sanitizedTitle.piiMap, sanitizedObjective.piiMap);

          prompt = promptTemplate
            .replace(/{title}/g, sanitizedTitle.sanitized)
            .replace(/{objective}/g, sanitizedObjective.sanitized)
            .replace(/{durationDays}/g, String(payload.durationDays || ''))
            .replace(/{orgContext}/g, payload.orgContext || '')
            .replace(/{rolesContext}/g, payload.rolesContext || '')
            .replace(/{historyStr}/g, historyStr);
          break;
        }
        case 'TASK_ASSIGNMENT': {
          const usersRes: any = await firstValueFrom(
            this.userService.ListUsers({ take: 500 }),
          );
          const employees = usersRes?.data || [];
          let empContext = payload.employeesContext;
          if (!empContext || typeof empContext !== 'string') {
            empContext = employees
              .filter((emp: any) => emp.employeeCode)
              .map((emp: any, idx: number) => {
                const token = `[CAN_BO_${idx + 1}]`;
                maskingMap[token] = `${emp.fullName} (Mã: ${emp.employeeCode})`;
                return `${token} (Chức danh: ${emp.jobTitleName || 'Chuyên viên'})`;
              })
              .join('\n');
          } else {
            const sanitized = this.sanitizePii(empContext);
            empContext = sanitized.sanitized;
            Object.assign(maskingMap, sanitized.piiMap);
          }

          const sanitizedInstruction = this.sanitizePii(payload.instruction || '');
          Object.assign(maskingMap, sanitizedInstruction.piiMap);

          prompt = promptTemplate
            .replace(/{instruction}/g, sanitizedInstruction.sanitized)
            .replace(/{employeesContext}/g, empContext || '');
          break;
        }
        case 'CALENDAR_SCHEDULE_REUSE': {
          const sanitizedInput = this.sanitizePii(payload.userInput || '');
          const sanitizedContext = this.sanitizePii(payload.historyContext || '');
          Object.assign(maskingMap, sanitizedInput.piiMap, sanitizedContext.piiMap);

          prompt = promptTemplate
            .replace(/{historyContext}/g, sanitizedContext.sanitized)
            .replace(/{userInput}/g, sanitizedInput.sanitized);
          break;
        }
        default:
          throw new BadRequestException(
            `Hành động AI không được hỗ trợ: ${action}`,
          );
      }

      const jobId = randomUUID();
      await this.cacheManager.set(
        `ai_job_${jobId}`,
        JSON.stringify({ status: 'PROCESSING' }),
        3600000,
      );

      this.rmqClient.emit('ai_generate_task', {
        jobId,
        prompt,
        systemPrompt,
        userId: user?.id,
        maskingMap,
        fallbackAction: action,
        fallbackPayload: payload,
      });

      return { success: true, data: { jobId, jobStatus: 'PROCESSING' } };
    } catch (err: any) {
      if (err instanceof BadRequestException) {
        throw err;
      }
      this.logger.error(`Error in executeAiFeature for action ${action}`, err);
      throw new InternalServerErrorException(
        'Không thể khởi tạo tiến trình AI',
      );
    }
  }

  async getJobStatus(jobId: string) {
    try {
      const jobData = (await this.cacheManager.get(
        `ai_job_${jobId}`,
      )) as string;
      if (!jobData) {
        throw new NotFoundException('Không tìm thấy tác vụ (hoặc đã hết hạn)');
      }
      return { success: true, data: JSON.parse(jobData) };
    } catch (err: any) {
      if (err instanceof NotFoundException) throw err;
      throw new InternalServerErrorException(err.message);
    }
  }

  async setJobCompleted(jobId: string, parsedResult: any) {
    await this.cacheManager.set(
      `ai_job_${jobId}`,
      JSON.stringify({
        status: 'COMPLETED',
        result: parsedResult,
      }),
      3600000,
    );
  }

  async setJobFailed(jobId: string, error: string) {
    await this.cacheManager.set(
      `ai_job_${jobId}`,
      JSON.stringify({
        status: 'FAILED',
        error,
      }),
      3600000,
    );
  }

  /**
   * CỬA ẢI KHỬ ĐỊNH DANH (PII SANITIZER):
   * Tự động quét và che giấu thông tin định danh cá nhân (Số điện thoại, CCCD 12 số, Email)
   * trước khi gửi prompt ra mô hình AI.
   */
  public sanitizePii(text: string): { sanitized: string; piiMap: Record<string, string> } {
    if (!text || typeof text !== 'string') {
      return { sanitized: text || '', piiMap: {} };
    }
    const piiMap: Record<string, string> = {};
    let sanitized = text;

    // 1. Số điện thoại (VN: 10 chữ số bắt đầu bằng 03, 05, 07, 08, 09 hoặc +84)
    let phoneCounter = 1;
    sanitized = sanitized.replace(/(?:\+84|0)(?:3|5|7|8|9)\d{8}\b/g, (match) => {
      const token = `[SDT_AN_DANH_${phoneCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    // 2. Số định danh / CCCD (12 chữ số)
    let cccdCounter = 1;
    sanitized = sanitized.replace(/\b\d{12}\b/g, (match) => {
      const token = `[CCCD_AN_DANH_${cccdCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    // 3. Email công vụ / cá nhân
    let emailCounter = 1;
    sanitized = sanitized.replace(/\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g, (match) => {
      const token = `[EMAIL_AN_DANH_${emailCounter++}]`;
      piiMap[token] = match;
      return token;
    });

    return { sanitized, piiMap };
  }

  /**
   * MÔ HÌNH DỰ PHÒNG 2 LỚP (RULE-BASED DETERMINISTIC FALLBACK):
   * Tự động kích hoạt khi AI bên thứ ba bị gián đoạn hoặc quá tải, đảm bảo công việc không bị dừng.
   */
  public generateFallback(action: string, payload: any): any {
    switch (action) {
      case 'CALENDAR_SCHEDULE_REUSE': {
        const events = this.rollOverSchedule(payload);
        return {
          message: 'Lịch công tác đã được tự động kế thừa và chuyển tiếp sang tuần mới theo quy chuẩn Ban Tổ chức Tỉnh ủy (Chế độ Dự phòng).',
          events,
        };
      }
      case 'SUBTASK_ASSIGNMENT': {
        return [
          {
            title: 'Nghiên cứu tài liệu, căn cứ pháp lý và xây dựng đề cương thực hiện',
            description: 'Rà soát các quy định của Đảng, Nhà nước và xây dựng khung kế hoạch chi tiết',
            suggestedAssignee: 'Chuyên viên nghiên cứu',
          },
          {
            title: 'Thu thập số liệu, tổng hợp hồ sơ và thẩm tra thực tế',
            description: 'Phối hợp với các phòng chuyên môn thu thập tài liệu và thẩm tra số liệu',
            suggestedAssignee: 'Chuyên viên phối hợp',
          },
          {
            title: 'Dự thảo văn bản, tờ trình và báo cáo kết quả thực hiện',
            description: 'Soạn thảo văn bản theo đúng thể thức văn bản Đảng (QĐ 39-QĐ/TU) và quy chế cơ quan',
            suggestedAssignee: 'Chuyên viên chủ trì',
          },
          {
            title: 'Rà soát toàn diện hồ sơ và trình Lãnh đạo thẩm định, phê duyệt',
            description: 'Hoàn thiện hồ sơ trình Trưởng phòng và Lãnh đạo Ban phê duyệt',
            suggestedAssignee: 'Lãnh đạo phòng / Chuyên viên chính',
          },
        ];
      }
      case 'EVALUATE_FEASIBILITY': {
        return {
          feasibilityScore: 85,
          analysis: 'Đánh giá sơ bộ theo quy chuẩn nghiệp vụ BTCTU: Kế hoạch có cơ sở triển khai phù hợp với khung thời gian và biên chế phòng ban.',
          risks: [
            'Khối lượng công việc cần phối hợp nhiều bộ phận',
            'Cần đảm bảo tiến độ ở các mốc thẩm tra hồ sơ ban đầu',
          ],
          recommendations: [
            'Phân công cụ thể cán bộ phụ trách từng bước trong quy trình',
            'Báo cáo tiến độ định kỳ hàng tuần cho Lãnh đạo Ban',
          ],
        };
      }
      case 'MASTER_PLAN_TASKS':
      case 'PROJECT_TASKS': {
        return {
          title: payload?.planTitle || payload?.title || 'Kế hoạch công tác chuẩn hóa',
          phases: [
            { phase: 'Giai đoạn 1 (Chuẩn bị)', focus: 'Khảo sát hiện trạng, rà soát văn bản và ban hành kế hoạch triển khai' },
            { phase: 'Giai đoạn 2 (Thực hiện)', focus: 'Triển khai các nhiệm vụ chuyên môn trọng tâm theo đề án đã duyệt' },
            { phase: 'Giai đoạn 3 (Kiểm tra)', focus: 'Kiểm tra, sơ kết đánh giá tiến độ và xử lý vướng mắc phát sinh' },
            { phase: 'Giai đoạn 4 (Tổng kết)', focus: 'Tổng kết, nghiệm thu sản phẩm và báo cáo Thường trực Tỉnh ủy' },
          ],
        };
      }
      case 'TASK_ASSIGNMENT': {
        return {
          assignedTasks: [
            {
              task: payload?.instruction || 'Nhiệm vụ chuyên môn',
              recommendedRole: 'Cán bộ đúng vị trí việc làm và mảng nghiệp vụ phụ trách',
              rationale: 'Phân công căn cứ đề án VTVL và phân công theo dõi đơn vị của Ban Tổ chức Tỉnh ủy',
            },
          ],
        };
      }
      default:
        return {
          message: 'Tác vụ đã được xử lý theo quy tắc dự phòng của hệ thống.',
        };
    }
  }

  private rollOverSchedule(payload: any): any[] {
    if (Array.isArray(payload?.historyEvents) && payload.historyEvents.length > 0) {
      return payload.historyEvents.map((e: any) => {
        const start = e.startDate ? new Date(e.startDate) : new Date();
        const end = e.endDate ? new Date(e.endDate) : new Date(start.getTime() + 2 * 3600 * 1000);
        // Tự động tịnh tiến 7 ngày sang tuần mới
        start.setDate(start.getDate() + 7);
        end.setDate(end.getDate() + 7);
        return {
          title: e.title || 'Lịch làm việc',
          time: `${start.getHours().toString().padStart(2, '0')}:${start.getMinutes().toString().padStart(2, '0')} - ${end.getHours().toString().padStart(2, '0')}:${end.getMinutes().toString().padStart(2, '0')}, ${start.toLocaleDateString('vi-VN')}`,
          startDate: start.toISOString(),
          endDate: end.toISOString(),
        };
      });
    }

    const now = new Date();
    const monday = new Date(now);
    const day = monday.getDay();
    const diff = monday.getDate() - day + (day === 0 ? -6 : 1) + 7;
    monday.setDate(diff);

    const schedule: any[] = [];
    const titles = [
      'Giao ban Thường trực Ban Tổ chức Tỉnh ủy',
      'Họp thẩm định hồ sơ công tác cán bộ',
      'Làm việc với các đơn vị trực thuộc về công tác phát triển đảng viên',
      'Kiểm tra nghiệp vụ bảo vệ chính trị nội bộ',
      'Giao ban cơ quan cuối tuần và đánh giá tiến độ KPI',
    ];

    for (let i = 0; i < 5; i++) {
      const d = new Date(monday);
      d.setDate(d.getDate() + i);
      const start = new Date(d.setHours(8, 0, 0, 0));
      const end = new Date(d.setHours(11, 0, 0, 0));
      schedule.push({
        title: titles[i],
        time: `08:00 - 11:00, ${start.toLocaleDateString('vi-VN')}`,
        startDate: start.toISOString(),
        endDate: end.toISOString(),
      });
    }
    return schedule;
  }
}
