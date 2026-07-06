import { Injectable, Logger } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';
import { RpcException } from '@nestjs/microservices';

@Injectable()
export class TaskKpiService {
  private readonly logger = new Logger(TaskKpiService.name);
  constructor(public prisma: PrismaService) {}

  async upsertTaskKpiSetting(data: any) {
    const { taskId, weight, baseScore, scoringMethod, difficulty, difficultyMultiplier, bonusThresholdDays, bonusPerDay, penaltyPerDay, standardDurationDays, kpiCriteriaId } = data;
    
    const task = await this.prisma.task.findUnique({ where: { id: taskId } });
    if (!task) throw new RpcException('Nhiệm vụ không tồn tại');

    const setting = await this.prisma.taskKpiSetting.upsert({
      where: { taskId },
      create: {
        taskId,
        weight: weight ?? 1.0,
        baseScore,
        scoringMethod: scoringMethod || 'MANUAL',
        bonusPerDay,
        penaltyPerDay,
        standardDurationDays,
        kpiCriteriaId
      },
      update: {
        weight,
        baseScore,
        scoringMethod,
        bonusPerDay,
        penaltyPerDay,
        standardDurationDays,
        kpiCriteriaId
      }
    });

    return {
      success: true,
      message: 'Cập nhật cấu hình đánh giá công việc thành công',
      data: setting
    };
  }

  async getTaskKpiSetting(taskId: number) {
    const setting = await this.prisma.taskKpiSetting.findUnique({ where: { taskId } });
    return {
      success: true,
      message: 'Lấy cấu hình thành công',
      data: setting
    };
  }
}
