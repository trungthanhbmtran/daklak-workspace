import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class TaskKpiService {
  constructor(private prisma: PrismaService) {}

  async upsertTaskKpiSetting(data: any) {
    return { success: true };
  }

  async getTaskKpiSetting(taskId: number) {
    return { success: true, data: null };
  }
}
