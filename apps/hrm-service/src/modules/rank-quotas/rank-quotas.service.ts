import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../database/prisma.service';

@Injectable()
export class RankQuotasService {
  constructor(private prisma: PrismaService) { }

  async SaveRankQuotas(data: any) {
    const { rankCode, quotas } = data;

    // Xóa định biên cũ của ngạch này
    await this.prisma.rankQuota.deleteMany({
      where: { rankCode }
    });

    // Thêm định biên mới
    if (quotas && quotas.length > 0) {
      await this.prisma.rankQuota.createMany({
        data: quotas.map(q => ({
          rankCode,
          taskName: q.taskName,
          unit: q.unit,
          targetValue: q.targetValue,
          weight: q.weight
        }))
      });
    }

    const savedQuotas = await this.prisma.rankQuota.findMany({
      where: { rankCode }
    });

    return {
      success: true,
      message: 'Lưu định biên thành công',
      data: savedQuotas
    };
  }

  async GetRankQuotasByRank(data: any) {
    const { rankCode } = data;
    const quotas = await this.prisma.rankQuota.findMany({
      where: { rankCode }
    });

    return {
      success: true,
      message: 'Lấy định biên thành công',
      data: quotas
    };
  }
}
